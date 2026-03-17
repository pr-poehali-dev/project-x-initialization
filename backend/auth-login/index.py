"""
Вход пользователя Грантовый дайвинг.
POST / — { email, password }
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

    if not email or not password:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Введите email и пароль'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    pw_hash = hashlib.sha256(password.encode()).hexdigest()
    cur.execute(
        "SELECT id, email, name, organization FROM users WHERE email = %s AND password_hash = %s",
        (email, pw_hash)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный email или пароль'})}

    user_id, email, name, organization = row
    token = secrets.token_hex(32)
    expires_at = datetime.now() + timedelta(days=30)
    cur.execute("INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)", (user_id, token, expires_at))
    conn.commit()
    conn.close()

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': email, 'name': name, 'organization': organization or ''}})
    }