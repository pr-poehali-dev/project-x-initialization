"""
Регистрация нового пользователя GrantRun.
POST / — { email, password, name, organization }
После регистрации отправляет приветственное письмо.
"""
import json
import os
import hashlib
import secrets
import urllib.request
from datetime import datetime, timedelta
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
}

WELCOME_HTML = """
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0f1e;color:#fff;padding:40px;">
  <div style="max-width:480px;margin:0 auto;background:#111827;border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.08);">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
      <div style="width:32px;height:32px;background:linear-gradient(135deg,#22c55e,#10b981);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">G</div>
      <span style="font-weight:600;font-size:18px;">GrantRun</span>
    </div>
    <h2 style="color:#fff;margin:0 0 12px;font-size:22px;">Добро пожаловать, {name}!</h2>
    <p style="color:rgba(255,255,255,0.6);line-height:1.6;margin:0 0 24px;">
      Вы успешно зарегистрировались на платформе GrantRun — умном наставнике для грантрайтеров.
      Теперь вы можете создавать проекты, заполнять проектные карты и готовиться к защите.
    </p>
    <a href="https://grantrun.ru/dashboard" style="display:inline-block;background:linear-gradient(135deg,#22c55e,#10b981);color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:600;font-size:15px;">
      Перейти в кабинет →
    </a>
    <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:32px;">
      Если вы не регистрировались на GrantRun — просто проигнорируйте это письмо.
    </p>
  </div>
</body>
</html>
"""

def send_welcome(email: str, name: str, send_email_url: str, internal_key: str):
    payload = json.dumps({
        'to': email,
        'subject': 'Добро пожаловать в GrantRun!',
        'html': WELCOME_HTML.replace('{name}', name)
    }).encode()
    req = urllib.request.Request(
        send_email_url,
        data=payload,
        headers={'Content-Type': 'application/json', 'X-Internal-Key': internal_key},
        method='POST'
    )
    try:
        urllib.request.urlopen(req, timeout=10)
    except Exception:
        pass

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

    send_email_url = os.environ.get('SEND_EMAIL_URL', '')
    internal_key = os.environ.get('INTERNAL_API_KEY', '')
    if send_email_url and internal_key:
        send_welcome(email, name, send_email_url, internal_key)

    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({'token': token, 'user': {'id': user_id, 'email': email, 'name': name, 'organization': organization}})
    }
