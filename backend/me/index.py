"""
Профиль текущего пользователя Грантовый дайвинг.
GET / — получить профиль по токену сессии
PUT / — обновить имя и организацию
"""
import json
import os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = (event.get('headers') or {}).get('X-Session-Token') or (event.get('headers') or {}).get('x-session-token')
    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT u.id, u.email, u.name, u.organization, u.created_at, u.is_admin FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}

    user_id, email, name, organization, created_at, is_admin = row

    method = event.get('httpMethod', 'GET')

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        new_name = body.get('name', '').strip() or name
        new_org = body.get('organization', '').strip()
        cur.execute(
            "UPDATE users SET name=%s, organization=%s WHERE id=%s",
            (new_name, new_org or None, user_id)
        )
        conn.commit()
        name = new_name
        organization = new_org

    conn.close()
    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'id': user_id,
            'email': email,
            'name': name,
            'organization': organization or '',
            'created_at': created_at.isoformat(),
            'is_admin': bool(is_admin),
        })
    }