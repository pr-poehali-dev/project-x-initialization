"""
Подача проектов на наши мероприятия.
GET /?event_id=N - список поданных проектов на мероприятие (только администраторы)
GET /?my=1&event_id=N - проверить, подал ли текущий пользователь проект на мероприятие
GET /projects - список проектов пользователя, готовых к подаче (все поля заполнены, сохранены)
POST / - подать проект на мероприятие { event_id, project_id }
POST /?action=launch_expert&event_id=N - запустить экспертизу для поданных проектов (только администраторы)
"""
import json
import os
import random
from datetime import date, datetime
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
    'Content-Type': 'application/json',
}

REQUIRED_FIELDS = [
    'title', 'short_description', 'problem', 'target_audience', 'goal',
    'description', 'geography', 'scale', 'budget', 'grant_fund',
    'start_date', 'end_date', 'deadline',
]


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def json_serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def get_user(cur, token):
    cur.execute(
        "SELECT u.id, u.is_admin FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None, False
    return row[0], bool(row[1])


def project_is_complete(project_row, cols):
    p = dict(zip(cols, project_row))
    for f in REQUIRED_FIELDS:
        val = p.get(f)
        if val is None or (isinstance(val, str) and not val.strip()):
            return False
    return True


def handler(event: dict, context) -> dict:
    """Подача проектов на наши мероприятия и управление экспертизой."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    token = (event.get('headers') or {}).get('X-Session-Token') or (event.get('headers') or {}).get('x-session-token')
    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = get_conn()
    cur = conn.cursor()

    user_id, is_admin = get_user(cur, token)
    if not user_id:
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}

    # GET /?action=my_projects — список проектов пользователя, готовых к подаче
    if method == 'GET' and params.get('action') == 'my_projects':
        cols = ['id', 'title', 'short_description', 'problem', 'target_audience', 'goal',
                'description', 'geography', 'scale', 'budget', 'grant_fund',
                'start_date', 'end_date', 'deadline', 'status', 'expert_status']
        cur.execute(
            f"SELECT {', '.join(cols)} FROM projects WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,)
        )
        rows = cur.fetchall()
        result = []
        for row in rows:
            p = dict(zip(cols, row))
            p['is_complete'] = project_is_complete(row, cols)
            # Проверяем, не подан ли уже этот проект куда-то
            cur.execute(
                "SELECT event_id FROM event_project_submissions WHERE project_id = %s",
                (p['id'],)
            )
            submitted_to = [r[0] for r in cur.fetchall()]
            p['submitted_to_events'] = submitted_to
            result.append(p)
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result, default=json_serial)}

    # GET /?my=1&event_id=N — проверить подачу текущего пользователя
    if method == 'GET' and params.get('my') == '1':
        event_id = params.get('event_id')
        if not event_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен event_id'})}
        cur.execute(
            """SELECT eps.id, eps.project_id, p.title
               FROM event_project_submissions eps
               JOIN projects p ON p.id = eps.project_id
               WHERE eps.event_id = %s AND eps.user_id = %s""",
            (event_id, user_id)
        )
        row = cur.fetchone()
        conn.close()
        if row:
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'submitted': True, 'submission_id': row[0], 'project_id': row[1], 'project_title': row[2]})}
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'submitted': False})}

    # GET /?event_id=N — список поданных проектов (только администраторы)
    if method == 'GET' and params.get('event_id'):
        if not is_admin:
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав доступа'})}
        event_id = params.get('event_id')
        cur.execute(
            """SELECT eps.id, eps.submitted_at, eps.expert_launched,
                      p.id as project_id, p.title, p.short_description, p.goal,
                      p.budget, p.scale, p.geography, p.status, p.expert_status,
                      u.id as user_id, u.name as user_name, u.email as user_email, u.organization
               FROM event_project_submissions eps
               JOIN projects p ON p.id = eps.project_id
               JOIN users u ON u.id = eps.user_id
               WHERE eps.event_id = %s
               ORDER BY eps.submitted_at DESC""",
            (event_id,)
        )
        cols = ['id', 'submitted_at', 'expert_launched',
                'project_id', 'title', 'short_description', 'goal',
                'budget', 'scale', 'geography', 'status', 'expert_status',
                'user_id', 'user_name', 'user_email', 'organization']
        rows = [dict(zip(cols, row)) for row in cur.fetchall()]
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(rows, default=json_serial)}

    # POST /?action=launch_expert&event_id=N — запустить экспертизу
    if method == 'POST' and params.get('action') == 'launch_expert':
        if not is_admin:
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав доступа'})}
        event_id = params.get('event_id')
        if not event_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен event_id'})}

        # Берём поданные проекты, которым ещё не запущена экспертиза
        cur.execute(
            "SELECT eps.id, eps.project_id FROM event_project_submissions eps WHERE eps.event_id = %s AND eps.expert_launched = false",
            (event_id,)
        )
        submissions = cur.fetchall()
        if not submissions:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нет проектов для экспертизы или экспертиза уже запущена'})}

        # Получаем список доступных экспертов
        cur.execute("SELECT id FROM experts ORDER BY id")
        expert_ids = [r[0] for r in cur.fetchall()]
        if not expert_ids:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступных экспертов'})}

        assigned_count = 0
        for sub_id, project_id in submissions:
            # Случайный эксперт
            expert_id = random.choice(expert_ids)
            # Проверяем, нет ли уже назначения
            cur.execute(
                "SELECT id FROM expert_assignments WHERE project_id = %s AND expert_id = %s",
                (project_id, expert_id)
            )
            if not cur.fetchone():
                cur.execute(
                    "INSERT INTO expert_assignments (project_id, expert_id, status) VALUES (%s, %s, 'pending')",
                    (project_id, expert_id)
                )
            # Обновляем статус проекта
            cur.execute(
                "UPDATE projects SET status = 'review', expert_status = 'assigned', updated_at = NOW() WHERE id = %s",
                (project_id,)
            )
            # Помечаем подачу как обработанную
            cur.execute(
                "UPDATE event_project_submissions SET expert_launched = true WHERE id = %s",
                (sub_id,)
            )
            assigned_count += 1

        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'assigned': assigned_count})}

    # POST / — подать проект на мероприятие
    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        event_id = body.get('event_id')
        project_id = body.get('project_id')
        if not event_id or not project_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужны event_id и project_id'})}

        # Проверяем, что мероприятие наше
        cur.execute("SELECT is_our_event, status FROM grant_events WHERE id = %s", (event_id,))
        ev = cur.fetchone()
        if not ev:
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Мероприятие не найдено'})}
        if not ev[0]:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Это не наше мероприятие'})}
        if ev[1] != 'open':
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Приём заявок завершён'})}

        # Проверяем, что проект принадлежит пользователю
        cols = ['id', 'title', 'short_description', 'problem', 'target_audience', 'goal',
                'description', 'geography', 'scale', 'budget', 'grant_fund',
                'start_date', 'end_date', 'deadline', 'status', 'expert_status']
        cur.execute(
            f"SELECT {', '.join(cols)} FROM projects WHERE id = %s AND user_id = %s",
            (project_id, user_id)
        )
        proj_row = cur.fetchone()
        if not proj_row:
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Проект не найден'})}

        # Проверяем заполненность обязательных полей
        if not project_is_complete(proj_row, cols):
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Проект заполнен не полностью. Заполните все обязательные поля и сохраните проект.'})}

        # Проверяем, не подан ли уже проект на это мероприятие
        cur.execute(
            "SELECT id FROM event_project_submissions WHERE event_id = %s AND project_id = %s",
            (event_id, project_id)
        )
        if cur.fetchone():
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Этот проект уже подан на мероприятие'})}

        cur.execute(
            "INSERT INTO event_project_submissions (event_id, project_id, user_id) VALUES (%s, %s, %s) RETURNING id",
            (event_id, project_id, user_id)
        )
        sub_id = cur.fetchone()[0]
        # Меняем статус проекта на submitted
        cur.execute(
            "UPDATE projects SET status = 'submitted', updated_at = NOW() WHERE id = %s",
            (project_id,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 201, 'headers': CORS, 'body': json.dumps({'ok': True, 'submission_id': sub_id})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}