"""
Аутентификация экспертов Грантовый дайвинг.
POST /register - регистрация эксперта { email, password, name, specialization }
POST /login - вход { email, password }
GET / - получить профиль эксперта по токену
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Expert-Token',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Регистрация, вход и профиль эксперта."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    # GET / - профиль по токену
    if method == 'GET':
        token = (event.get('headers') or {}).get('X-Expert-Token') or (event.get('headers') or {}).get('x-expert-token')
        if not token:
            conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
        cur.execute(
            """SELECT e.id, e.email, e.name, e.specialization
               FROM experts e JOIN expert_sessions s ON s.expert_id = e.id
               WHERE s.token = %s AND s.expires_at > NOW()""",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({'id': row[0], 'email': row[1], 'name': row[2], 'specialization': row[3] or ''}),
        }

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')

        # Регистрация
        if action == 'register':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            name = body.get('name', '').strip()
            specialization = body.get('specialization', '').strip()

            if not email or not password or not name:
                conn.close()
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все поля'})}

            pw_hash = hashlib.sha256(password.encode()).hexdigest()
            cur.execute("SELECT id FROM experts WHERE email = %s", (email,))
            if cur.fetchone():
                conn.close()
                return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Этот email уже зарегистрирован'})}

            cur.execute(
                "INSERT INTO experts (email, password_hash, name, specialization) VALUES (%s, %s, %s, %s) RETURNING id",
                (email, pw_hash, name, specialization)
            )
            expert_id = cur.fetchone()[0]
            token = secrets.token_hex(32)
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO expert_sessions (expert_id, token, expires_at) VALUES (%s, %s, %s)",
                (expert_id, token, expires_at)
            )
            conn.commit()
            conn.close()
            return {
                'statusCode': 201,
                'headers': CORS,
                'body': json.dumps({'token': token, 'expert': {'id': expert_id, 'email': email, 'name': name, 'specialization': specialization}}),
            }

        # Вход
        if action == 'login':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            if not email or not password:
                conn.close()
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Введите email и пароль'})}

            pw_hash = hashlib.sha256(password.encode()).hexdigest()
            cur.execute(
                "SELECT id, name, specialization FROM experts WHERE email = %s AND password_hash = %s",
                (email, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                conn.close()
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный email или пароль'})}

            expert_id, name, specialization = row
            token = secrets.token_hex(32)
            expires_at = datetime.now() + timedelta(days=30)
            cur.execute(
                "INSERT INTO expert_sessions (expert_id, token, expires_at) VALUES (%s, %s, %s)",
                (expert_id, token, expires_at)
            )
            conn.commit()
            conn.close()
            return {
                'statusCode': 200,
                'headers': CORS,
                'body': json.dumps({'token': token, 'expert': {'id': expert_id, 'email': email, 'name': name, 'specialization': specialization or ''}}),
            }

    conn.close()
    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Неверный запрос'})}
