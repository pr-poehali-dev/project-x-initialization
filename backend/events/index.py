"""
Грантовые мероприятия - публичный каталог.
GET / - список всех мероприятий (фильтры: ?category=, ?status=open)
POST / - создать мероприятие (авторизованные пользователи)
PUT /?id=N - обновить мероприятие
DELETE /?id=N - удалить мероприятие
"""
import json
import os
import psycopg2
from datetime import date, datetime

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json',
}


def json_serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def handler(event: dict, context) -> dict:
    """Каталог грантовых мероприятий."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    conn = get_conn()
    cur = conn.cursor()

    if method == 'GET':
        category = params.get('category')
        status = params.get('status', 'open')

        where_parts = []
        values = []

        if status and status != 'all':
            where_parts.append("status = %s")
            values.append(status)

        if category:
            where_parts.append("category = %s")
            values.append(category)

        where_sql = ("WHERE " + " AND ".join(where_parts)) if where_parts else ""

        cur.execute(
            f"""SELECT id, title, organizer, description, deadline, start_date, end_date,
                       grant_amount, category, geography, target_audience, application_url, status, created_at
               FROM grant_events
               {where_sql}
               ORDER BY deadline ASC NULLS LAST, created_at DESC""",
            values
        )
        cols = ['id', 'title', 'organizer', 'description', 'deadline', 'start_date', 'end_date',
                'grant_amount', 'category', 'geography', 'target_audience', 'application_url', 'status', 'created_at']
        rows = [dict(zip(cols, row)) for row in cur.fetchall()]
        conn.close()
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps(rows, default=json_serial),
        }

    if method == 'POST':
        token = (event.get('headers') or {}).get('X-Session-Token') or (event.get('headers') or {}).get('x-session-token')
        if not token:
            conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

        cur.execute(
            "SELECT u.id, u.is_admin FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}
        if not row[1]:
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав доступа'})}

        body = json.loads(event.get('body') or '{}')
        title = (body.get('title') or '').strip()
        if not title:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Название обязательно'})}

        cur.execute(
            """INSERT INTO grant_events (title, organizer, description, deadline, start_date, end_date,
                grant_amount, category, geography, target_audience, application_url, status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               RETURNING id""",
            (
                title,
                body.get('organizer') or '',
                body.get('description') or '',
                body.get('deadline') or None,
                body.get('start_date') or None,
                body.get('end_date') or None,
                body.get('grant_amount') or '',
                body.get('category') or '',
                body.get('geography') or '',
                body.get('target_audience') or '',
                body.get('application_url') or '',
                body.get('status') or 'open',
            )
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {
            'statusCode': 201,
            'headers': CORS,
            'body': json.dumps({'id': new_id, 'ok': True}),
        }

    if method in ('PUT', 'DELETE'):
        token = (event.get('headers') or {}).get('X-Session-Token') or (event.get('headers') or {}).get('x-session-token')
        if not token:
            conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
        cur.execute(
            "SELECT u.id, u.is_admin FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        admin_row = cur.fetchone()
        if not admin_row:
            conn.close()
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}
        if not admin_row[1]:
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав доступа'})}

        event_id = params.get('id')
        if not event_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id мероприятия'})}

    if method == 'PUT':
        body = json.loads(event.get('body') or '{}')
        title = (body.get('title') or '').strip()
        if not title:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Название обязательно'})}
        cur.execute(
            """UPDATE grant_events SET title=%s, organizer=%s, description=%s, deadline=%s,
               start_date=%s, end_date=%s, grant_amount=%s, category=%s, geography=%s,
               target_audience=%s, application_url=%s, status=%s, updated_at=NOW()
               WHERE id=%s""",
            (
                title,
                body.get('organizer') or '',
                body.get('description') or '',
                body.get('deadline') or None,
                body.get('start_date') or None,
                body.get('end_date') or None,
                body.get('grant_amount') or '',
                body.get('category') or '',
                body.get('geography') or '',
                body.get('target_audience') or '',
                body.get('application_url') or '',
                body.get('status') or 'open',
                event_id,
            )
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    if method == 'DELETE':
        cur.execute("DELETE FROM grant_events WHERE id=%s", (event_id,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}