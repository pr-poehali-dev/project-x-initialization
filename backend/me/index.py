"""
Профиль текущего пользователя Грантовый дайвинг.
GET / — получить профиль по токену сессии
PUT / — обновить профиль (все расширенные поля)
"""
import json
import os
import psycopg2
from datetime import datetime

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Профиль участника."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = (event.get('headers') or {}).get('X-Session-Token') or (event.get('headers') or {}).get('x-session-token')
    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT u.id, u.email, u.name, u.organization, u.created_at, u.is_admin,
                  u.full_name, u.education, u.workplace, u.position, u.city, u.phone,
                  u.pd_consent, u.pd_consent_at, u.coordinator_id
           FROM users u JOIN sessions s ON s.user_id = u.id
           WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}

    (user_id, email, name, organization, created_at, is_admin,
     full_name, education, workplace, position, city, phone,
     pd_consent, pd_consent_at, coordinator_id) = row

    method = event.get('httpMethod', 'GET')

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        new_pd_consent = bool(body.get('pd_consent', pd_consent))
        pd_at = pd_consent_at
        if new_pd_consent and not pd_consent:
            pd_at = datetime.now()

        cur.execute(
            """UPDATE users SET
               name=%s, organization=%s, full_name=%s, education=%s,
               workplace=%s, position=%s, city=%s, phone=%s,
               pd_consent=%s, pd_consent_at=%s
               WHERE id=%s""",
            (
                (body.get('name') or '').strip() or name,
                (body.get('organization') or '').strip() or None,
                (body.get('full_name') or '').strip() or None,
                (body.get('education') or '').strip() or None,
                (body.get('workplace') or '').strip() or None,
                (body.get('position') or '').strip() or None,
                (body.get('city') or '').strip() or None,
                (body.get('phone') or '').strip() or None,
                new_pd_consent,
                pd_at,
                user_id,
            )
        )
        conn.commit()
        # Обновляем локальные переменные
        name = (body.get('name') or '').strip() or name
        organization = (body.get('organization') or '').strip()
        full_name = (body.get('full_name') or '').strip()
        education = (body.get('education') or '').strip()
        workplace = (body.get('workplace') or '').strip()
        position = (body.get('position') or '').strip()
        city = (body.get('city') or '').strip()
        phone = (body.get('phone') or '').strip()
        pd_consent = new_pd_consent

    conn.close()
    return {
        'statusCode': 200,
        'headers': CORS,
        'body': json.dumps({
            'id': user_id,
            'email': email or '',
            'name': name or '',
            'organization': organization or '',
            'full_name': full_name or '',
            'education': education or '',
            'workplace': workplace or '',
            'position': position or '',
            'city': city or '',
            'phone': phone or '',
            'pd_consent': bool(pd_consent),
            'is_admin': bool(is_admin),
            'coordinator_id': coordinator_id,
            'created_at': created_at.isoformat() if created_at else '',
        })
    }