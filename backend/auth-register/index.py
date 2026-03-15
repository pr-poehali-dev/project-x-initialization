"""
Регистрация нового пользователя GrantRun.
POST / — { email, password, name, organization }
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    name = body.get('name', '').strip()
    organization = body.get('organization', '').strip()

    if not email or not password or not name:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все обязательные поля'})}
    if len(password) < 6:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        conn.close()
        return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}

    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    cur.execute(
        "INSERT INTO users (email, password_hash, name, organization) VALUES (%s, %s, %s, %s) RETURNING id",
        (email, pw_hash, name, organization or None)
    )
    user_id = cur.fetchone()[0]
    token = secrets.token_hex(32)
    expires_at = datetime.now() + timedelta(days=30)
    cur.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)", (user_id, token, expires_at))
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': email, 'name': name, 'organization': organization}})
    }