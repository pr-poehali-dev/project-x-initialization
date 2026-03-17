"""
Telegram вход — обменивает telegram-auth токен на сессию нашей системы.
POST / — { token } → создаёт запись в sessions, возвращает { token, user }
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Обмен Telegram auth токена на сессию платформы."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    token = (body.get('token') or '').strip()
    if not token:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен токен'})}

    token_hash = hashlib.sha256(token.encode()).hexdigest()

    conn = get_conn()
    cur = conn.cursor()

    # Ищем токен в telegram_auth_tokens
    cur.execute(
        """SELECT telegram_id, telegram_username, telegram_first_name, telegram_last_name,
                  expires_at, used
           FROM telegram_auth_tokens WHERE token_hash = %s""",
        (token_hash,)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Токен не найден или истёк'})}

    telegram_id, tg_username, first_name, last_name, expires_at, used = row

    if used:
        conn.close()
        return {'statusCode': 410, 'headers': CORS, 'body': json.dumps({'error': 'Ссылка уже использована'})}

    # Проверяем срок действия (naive datetime → utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        conn.close()
        return {'statusCode': 410, 'headers': CORS, 'body': json.dumps({'error': 'Ссылка устарела, запросите новую в боте'})}

    # Находим или создаём пользователя
    cur.execute("SELECT id, email, name, organization FROM users WHERE telegram_id = %s", (telegram_id,))
    user_row = cur.fetchone()

    if user_row:
        user_id, email, name, organization = user_row
    else:
        # Новый пользователь через Telegram
        display_name = ' '.join(filter(None, [first_name, last_name])) or tg_username or f'User {telegram_id}'
        cur.execute(
            """INSERT INTO users (telegram_id, name, email, password_hash)
               VALUES (%s, %s, '', '') RETURNING id, email, name, organization""",
            (telegram_id, display_name)
        )
        user_id, email, name, organization = cur.fetchone()

    # Помечаем токен использованным
    cur.execute("UPDATE telegram_auth_tokens SET used = TRUE, used_at = NOW() WHERE token_hash = %s", (token_hash,))

    # Создаём сессию в нашей системе
    session_token = secrets.token_hex(32)
    expires = datetime.now() + timedelta(days=30)
    cur.execute(
        "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
        (user_id, session_token, expires)
    )
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'token': session_token,
            'user': {'id': user_id, 'email': email or '', 'name': name or '', 'organization': organization or ''},
        }),
    }
