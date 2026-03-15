"""
Регистрация и вход пользователей GrantRun.
POST /register — создать аккаунт
POST /login — войти
POST /logout — выйти
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    path = event.get('path', '/')
    body = json.loads(event.get('body') or '{}')

    if path.endswith('/register'):
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')
        name = body.get('name', '').strip()
        organization = body.get('organization', '').strip()

        if not email or not password or not name:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Заполните все обязательные поля'})}

        if len(password) < 6:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Пароль должен быть не менее 6 символов'})}

        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            conn.close()
            return {'statusCode': 409, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}

        password_hash = hash_password(password)
        cur.execute(
            "INSERT INTO users (email, password_hash, name, organization) VALUES (%s, %s, %s, %s) RETURNING id",
            (email, password_hash, name, organization or None)
        )
        user_id = cur.fetchone()[0]

        token = secrets.token_hex(32)
        expires_at = datetime.now() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        conn.commit()
        conn.close()

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': email, 'name': name, 'organization': organization}})
        }

    if path.endswith('/login'):
        email = body.get('email', '').strip().lower()
        password = body.get('password', '')

        if not email or not password:
            return {'statusCode': 400, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Введите email и пароль'})}

        conn = get_conn()
        cur = conn.cursor()
        password_hash = hash_password(password)
        cur.execute(
            "SELECT id, email, name, organization FROM users WHERE email = %s AND password_hash = %s",
            (email, password_hash)
        )
        user = cur.fetchone()

        if not user:
            conn.close()
            return {'statusCode': 401, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Неверный email или пароль'})}

        user_id, email, name, organization = user
        token = secrets.token_hex(32)
        expires_at = datetime.now() + timedelta(days=30)
        cur.execute(
            "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires_at)
        )
        conn.commit()
        conn.close()

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': email, 'name': name, 'organization': organization}})
        }

    if path.endswith('/logout'):
        token = event.get('headers', {}).get('X-Session-Token') or event.get('headers', {}).get('x-session-token')
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            conn.close()
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps({'ok': True})}

    return {'statusCode': 404, 'headers': CORS_HEADERS, 'body': json.dumps({'error': 'Not found'})}
