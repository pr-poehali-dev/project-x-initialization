"""
Отправка email через SMTP (приветственное письмо после регистрации и другие).
POST / — { to, subject, html }
Используется только внутри платформы (requires SMTP_* secrets).
"""
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Internal-Key',
    'Content-Type': 'application/json',
}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    internal_key = (event.get('headers') or {}).get('X-Internal-Key') or (event.get('headers') or {}).get('x-internal-key')
    if internal_key != os.environ.get('INTERNAL_API_KEY'):
        return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Forbidden'})}

    body = json.loads(event.get('body') or '{}')
    to = body.get('to')
    subject = body.get('subject', 'Грантовый дайвинг')
    html = body.get('html', '')

    if not to:
        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен получатель'})}

    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', '587'))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_pass = os.environ.get('SMTP_PASS', '')
    from_name = os.environ.get('SMTP_FROM_NAME', 'Грантовый дайвинг')

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'{from_name} <{smtp_user}>'
    msg['To'] = to
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, to, msg.as_string())

    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}