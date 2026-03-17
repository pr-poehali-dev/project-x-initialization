"""
CRUD для проектов GrantRun.
GET / — список проектов пользователя
POST / — создать проект
GET /?id=N — получить проект
PUT /?id=N — обновить проект
"""
import json
import os
import psycopg2
from datetime import date

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json',
}

def get_user(cur, token):
    cur.execute(
        "SELECT u.id FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None

def serialize(row):
    return {
        'id': row[0],
        'user_id': row[1],
        'title': row[2],
        'description': row[3] or '',
        'problem': row[4] or '',
        'target_audience': row[5] or '',
        'goal': row[6] or '',
        'expected_results': row[7] or '',
        'budget': row[8] or '',
        'grant_fund': row[9] or '',
        'deadline': row[10].isoformat() if row[10] else '',
        'status': row[11],
        'created_at': row[12].isoformat(),
        'updated_at': row[13].isoformat(),
    }

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = (event.get('headers') or {}).get('X-Session-Token') or (event.get('headers') or {}).get('x-session-token')
    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    user_id = get_user(cur, token)
    if not user_id:
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    project_id = params.get('id')

    if method == 'GET':
        if project_id:
            cur.execute(
                "SELECT id,user_id,title,description,problem,target_audience,goal,expected_results,budget,grant_fund,deadline,status,created_at,updated_at FROM projects WHERE id=%s AND user_id=%s",
                (project_id, user_id)
            )
            row = cur.fetchone()
            conn.close()
            if not row:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Не найдено'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(serialize(row))}
        else:
            cur.execute(
                "SELECT id,user_id,title,description,problem,target_audience,goal,expected_results,budget,grant_fund,deadline,status,created_at,updated_at FROM projects WHERE user_id=%s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            conn.close()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps([serialize(r) for r in rows])}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        title = body.get('title', '').strip()
        if not title:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Название обязательно'})}
        deadline_raw = body.get('deadline') or None
        cur.execute(
            """INSERT INTO projects (user_id,title,description,problem,target_audience,goal,expected_results,budget,grant_fund,deadline,status)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'draft')
               RETURNING id,user_id,title,description,problem,target_audience,goal,expected_results,budget,grant_fund,deadline,status,created_at,updated_at""",
            (user_id, title, body.get('description'), body.get('problem'), body.get('target_audience'),
             body.get('goal'), body.get('expected_results'), body.get('budget'), body.get('grant_fund'), deadline_raw)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(serialize(row))}

    if method == 'PUT':
        if not project_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id проекта'})}
        body = json.loads(event.get('body') or '{}')
        deadline_raw = body.get('deadline') or None
        cur.execute(
            """UPDATE projects SET title=%s,description=%s,problem=%s,target_audience=%s,goal=%s,
               expected_results=%s,budget=%s,grant_fund=%s,deadline=%s,status=%s,updated_at=NOW()
               WHERE id=%s AND user_id=%s
               RETURNING id,user_id,title,description,problem,target_audience,goal,expected_results,budget,grant_fund,deadline,status,created_at,updated_at""",
            (body.get('title'), body.get('description'), body.get('problem'), body.get('target_audience'),
             body.get('goal'), body.get('expected_results'), body.get('budget'), body.get('grant_fund'),
             deadline_raw, body.get('status', 'draft'), project_id, user_id)
        )
        row = cur.fetchone()
        conn.commit()
        conn.close()
        if not row:
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Не найдено'})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(serialize(row))}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Метод не поддерживается'})}
