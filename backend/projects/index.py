"""
CRUD для полной проектной карты Грантовый дайвинг.
GET / - список проектов пользователя
POST / - создать проект
GET /?id=N - получить полную карту проекта (с командой, задачами, медиа, расходами)
PUT /?id=N - обновить полную карту проекта
POST /?action=submit_expert&id=N - отправить проект на экспертизу { expert_email }
GET /?action=reviews&id=N - получить оценки эксперта по проекту
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


def get_user(cur, token):
    cur.execute(
        "SELECT u.id FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def get_full_project(cur, project_id, user_id):
    cur.execute(
        """SELECT id,user_id,title,description,problem,target_audience,goal,expected_results,
                  budget,grant_fund,deadline,status,created_at,updated_at,
                  scale,start_date,end_date,short_description,geography,experience,prospects,
                  results_events_count,results_deadline,results_participants_count,
                  results_publications_count,results_views_count,expert_status
           FROM projects WHERE id=%s AND user_id=%s""",
        (project_id, user_id)
    )
    row = cur.fetchone()
    if not row:
        return None

    project = {
        'id': row[0], 'user_id': row[1], 'title': row[2] or '',
        'description': row[3] or '', 'problem': row[4] or '',
        'target_audience': row[5] or '', 'goal': row[6] or '',
        'expected_results': row[7] or '', 'budget': row[8] or '',
        'grant_fund': row[9] or '',
        'deadline': row[10].isoformat() if row[10] else '',
        'status': row[11],
        'created_at': row[12].isoformat() if row[12] else '',
        'updated_at': row[13].isoformat() if row[13] else '',
        'scale': row[14] or '',
        'start_date': row[15].isoformat() if row[15] else '',
        'end_date': row[16].isoformat() if row[16] else '',
        'short_description': row[17] or '',
        'geography': row[18] or '',
        'experience': row[19] or '',
        'prospects': row[20] or '',
        'results_events_count': row[21],
        'results_deadline': row[22].isoformat() if row[22] else '',
        'results_participants_count': row[23],
        'results_publications_count': row[24],
        'results_views_count': row[25],
        'expert_status': row[26],
    }

    cur.execute(
        "SELECT id,sort_order,full_name,role,competencies,resume_url,resume_filename FROM project_team_members WHERE project_id=%s ORDER BY sort_order",
        (project_id,)
    )
    project['team'] = [
        {'id': r[0], 'sort_order': r[1], 'full_name': r[2] or '', 'role': r[3] or '',
         'competencies': r[4] or '', 'resume_url': r[5] or '', 'resume_filename': r[6] or ''}
        for r in cur.fetchall()
    ]

    cur.execute(
        "SELECT id,sort_order,task_name FROM project_tasks WHERE project_id=%s ORDER BY sort_order",
        (project_id,)
    )
    tasks = []
    for tr in cur.fetchall():
        task = {'id': tr[0], 'sort_order': tr[1], 'task_name': tr[2] or '', 'events': []}
        cur.execute(
            """SELECT id,sort_order,event_name,deadline,event_description,unique_participants,
                      repeat_participants,publications_count,views_count,extra_info
               FROM project_events WHERE task_id=%s ORDER BY sort_order""",
            (task['id'],)
        )
        for er in cur.fetchall():
            task['events'].append({
                'id': er[0], 'sort_order': er[1], 'event_name': er[2] or '',
                'deadline': er[3].isoformat() if er[3] else '',
                'event_description': er[4] or '',
                'unique_participants': er[5], 'repeat_participants': er[6],
                'publications_count': er[7], 'views_count': er[8],
                'extra_info': er[9] or ''
            })
        tasks.append(task)
    project['tasks'] = tasks

    cur.execute(
        "SELECT id,sort_order,resource_name,publication_month,planned_views,resource_links,format_reason FROM project_media WHERE project_id=%s ORDER BY sort_order",
        (project_id,)
    )
    project['media'] = [
        {'id': r[0], 'sort_order': r[1], 'resource_name': r[2] or '', 'publication_month': r[3] or '',
         'planned_views': r[4], 'resource_links': r[5] or '', 'format_reason': r[6] or ''}
        for r in cur.fetchall()
    ]

    cur.execute(
        "SELECT id,sort_order,category,item_name,justification,price,quantity FROM project_expenses WHERE project_id=%s ORDER BY sort_order",
        (project_id,)
    )
    project['expenses'] = [
        {'id': r[0], 'sort_order': r[1], 'category': r[2] or '', 'item_name': r[3] or '',
         'justification': r[4] or '', 'price': float(r[5]) if r[5] else 0,
         'quantity': float(r[6]) if r[6] else 0}
        for r in cur.fetchall()
    ]

    return project


def save_related(cur, project_id, body):
    cur.execute("DELETE FROM project_expenses WHERE project_id=%s", (project_id,))
    cur.execute("DELETE FROM project_media WHERE project_id=%s", (project_id,))
    cur.execute(
        "DELETE FROM project_events WHERE task_id IN (SELECT id FROM project_tasks WHERE project_id=%s)",
        (project_id,)
    )
    cur.execute("DELETE FROM project_tasks WHERE project_id=%s", (project_id,))
    cur.execute("DELETE FROM project_team_members WHERE project_id=%s", (project_id,))

    for i, m in enumerate(body.get('team', [])):
        cur.execute(
            """INSERT INTO project_team_members (project_id,sort_order,full_name,role,competencies,resume_url,resume_filename)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (project_id, i, m.get('full_name'), m.get('role'), m.get('competencies'),
             m.get('resume_url'), m.get('resume_filename'))
        )

    for i, t in enumerate(body.get('tasks', [])):
        cur.execute(
            "INSERT INTO project_tasks (project_id,sort_order,task_name) VALUES (%s,%s,%s) RETURNING id",
            (project_id, i, t.get('task_name'))
        )
        task_id = cur.fetchone()[0]
        for j, e in enumerate(t.get('events', [])):
            cur.execute(
                """INSERT INTO project_events (task_id,sort_order,event_name,deadline,event_description,
                          unique_participants,repeat_participants,publications_count,views_count,extra_info)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
                (task_id, j, e.get('event_name'), e.get('deadline') or None,
                 e.get('event_description'), e.get('unique_participants'),
                 e.get('repeat_participants'), e.get('publications_count'),
                 e.get('views_count'), e.get('extra_info'))
            )

    for i, m in enumerate(body.get('media', [])):
        cur.execute(
            """INSERT INTO project_media (project_id,sort_order,resource_name,publication_month,planned_views,resource_links,format_reason)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (project_id, i, m.get('resource_name'), m.get('publication_month'),
             m.get('planned_views'), m.get('resource_links'), m.get('format_reason'))
        )

    for i, e in enumerate(body.get('expenses', [])):
        cur.execute(
            """INSERT INTO project_expenses (project_id,sort_order,category,item_name,justification,price,quantity)
               VALUES (%s,%s,%s,%s,%s,%s,%s)""",
            (project_id, i, e.get('category'), e.get('item_name'),
             e.get('justification'), e.get('price'), e.get('quantity'))
        )


def handler(event: dict, context) -> dict:
    """CRUD операции для полной проектной карты"""
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

    # ── action-роуты идут ПЕРВЫМИ ──────────────────────────────────────────────

    # POST submit_expert — случайно назначить эксперта из пула
    if method == 'POST' and params.get('action') == 'submit_expert':
        import random
        if not project_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id проекта'})}

        cur.execute("SELECT id FROM projects WHERE id=%s AND user_id=%s", (project_id, user_id))
        if not cur.fetchone():
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Проект не найден'})}

        cur.execute(
            """SELECT id FROM experts
               WHERE id NOT IN (
                   SELECT expert_id FROM expert_assignments WHERE project_id=%s
               )""",
            (project_id,)
        )
        available = [row[0] for row in cur.fetchall()]
        if not available:
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступных экспертов. Подождите, пока в системе зарегистрируется эксперт.'})}

        expert_id = random.choice(available)
        cur.execute(
            """INSERT INTO expert_assignments (project_id, expert_id, status)
               VALUES (%s, %s, 'pending')
               ON CONFLICT (project_id, expert_id)
               DO UPDATE SET status='pending', assigned_at=NOW(), reviewed_at=NULL""",
            (project_id, expert_id)
        )
        cur.execute(
            "UPDATE projects SET expert_status='sent', updated_at=NOW() WHERE id=%s",
            (project_id,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # GET reviews — получить оценки эксперта по проекту участника
    if method == 'GET' and params.get('action') == 'reviews':
        if not project_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id проекта'})}

        cur.execute(
            """SELECT ea.id, ea.status, ea.assigned_at, ea.reviewed_at,
                      e.name as expert_name, e.specialization
               FROM expert_assignments ea
               JOIN experts e ON e.id = ea.expert_id
               WHERE ea.project_id=%s
               ORDER BY ea.assigned_at DESC""",
            (project_id,)
        )
        assignments = []
        for row in cur.fetchall():
            assignment_id, status, assigned_at, reviewed_at, expert_name, specialization = row
            cur.execute(
                "SELECT section, feedback, score FROM expert_reviews WHERE assignment_id=%s",
                (assignment_id,)
            )
            reviews = {}
            for r in cur.fetchall():
                reviews[r[0]] = {'feedback': r[1] or '', 'score': r[2]}
            assignments.append({
                'assignment_id': assignment_id,
                'status': status,
                'assigned_at': assigned_at.isoformat() if assigned_at else None,
                'reviewed_at': reviewed_at.isoformat() if reviewed_at else None,
                'expert_name': expert_name,
                'specialization': specialization or '',
                'reviews': reviews,
            })
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(assignments)}

    # ── стандартные CRUD роуты ──────────────────────────────────────────────────

    if method == 'GET':
        if project_id:
            project = get_full_project(cur, project_id, user_id)
            conn.close()
            if not project:
                return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Не найдено'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(project)}
        else:
            cur.execute(
                "SELECT id,title,status,deadline,created_at,updated_at,scale FROM projects WHERE user_id=%s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            conn.close()
            result = [
                {'id': r[0], 'title': r[1], 'status': r[2],
                 'deadline': r[3].isoformat() if r[3] else '',
                 'created_at': r[4].isoformat() if r[4] else '',
                 'updated_at': r[5].isoformat() if r[5] else '',
                 'scale': r[6] or ''}
                for r in rows
            ]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(result)}

    if method == 'POST':
        body = json.loads(event.get('body') or '{}')
        title = (body.get('title') or '').strip()
        if not title:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Название обязательно'})}
        cur.execute(
            """INSERT INTO projects (user_id,title,description,problem,target_audience,goal,expected_results,
                budget,grant_fund,deadline,status,scale,start_date,end_date,short_description,geography,
                experience,prospects,results_events_count,results_deadline,results_participants_count,
                results_publications_count,results_views_count)
               VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'draft',%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
               RETURNING id""",
            (user_id, title, body.get('description'), body.get('problem'), body.get('target_audience'),
             body.get('goal'), body.get('expected_results'), body.get('budget'), body.get('grant_fund'),
             body.get('deadline') or None, body.get('scale'), body.get('start_date') or None,
             body.get('end_date') or None, body.get('short_description'), body.get('geography'),
             body.get('experience'), body.get('prospects'), body.get('results_events_count'),
             body.get('results_deadline') or None, body.get('results_participants_count'),
             body.get('results_publications_count'), body.get('results_views_count'))
        )
        new_id = cur.fetchone()[0]
        save_related(cur, new_id, body)
        conn.commit()
        project = get_full_project(cur, new_id, user_id)
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(project)}

    if method == 'PUT':
        if not project_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id проекта'})}
        body = json.loads(event.get('body') or '{}')
        cur.execute(
            """UPDATE projects SET title=%s,description=%s,problem=%s,target_audience=%s,goal=%s,
               expected_results=%s,budget=%s,grant_fund=%s,deadline=%s,status=%s,
               scale=%s,start_date=%s,end_date=%s,short_description=%s,geography=%s,
               experience=%s,prospects=%s,results_events_count=%s,results_deadline=%s,
               results_participants_count=%s,results_publications_count=%s,results_views_count=%s,
               updated_at=NOW()
               WHERE id=%s AND user_id=%s""",
            (body.get('title'), body.get('description'), body.get('problem'), body.get('target_audience'),
             body.get('goal'), body.get('expected_results'), body.get('budget'), body.get('grant_fund'),
             body.get('deadline') or None, body.get('status', 'draft'),
             body.get('scale'), body.get('start_date') or None, body.get('end_date') or None,
             body.get('short_description'), body.get('geography'), body.get('experience'),
             body.get('prospects'), body.get('results_events_count'),
             body.get('results_deadline') or None, body.get('results_participants_count'),
             body.get('results_publications_count'), body.get('results_views_count'),
             project_id, user_id)
        )
        if cur.rowcount == 0:
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Не найдено'})}
        save_related(cur, project_id, body)
        conn.commit()
        project = get_full_project(cur, project_id, user_id)
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(project)}

    if method == 'DELETE':
        if not project_id:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нужен id проекта'})}
        cur.execute("DELETE FROM event_project_submissions WHERE project_id=%s", (project_id,))
        cur.execute("""DELETE FROM expert_reviews WHERE assignment_id IN (
            SELECT id FROM expert_assignments WHERE project_id=%s
        )""", (project_id,))
        cur.execute("DELETE FROM expert_assignments WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM project_tasks WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM project_expenses WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM project_team_members WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM project_media WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM project_events WHERE project_id=%s", (project_id,))
        cur.execute("DELETE FROM projects WHERE id=%s AND user_id=%s", (project_id, user_id))
        if cur.rowcount == 0:
            conn.rollback()
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Проект не найден'})}
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Метод не поддерживается'})}