"""
ЛК эксперта: проекты для проверки и управление оценками.
GET /             - список проектов, назначенных эксперту
GET /?project_id= - получить полную карту проекта + все оценки эксперта
POST /            - сохранить/обновить оценку раздела { assignment_id, section, feedback, score }
POST /?action=complete - завершить проверку и вернуть проект участнику
"""
import json
import os
from datetime import date, datetime
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Expert-Token',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def json_serial(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    from decimal import Decimal
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError(f"Type {type(obj)} not serializable")


def get_expert(cur, token):
    cur.execute(
        """SELECT e.id FROM experts e JOIN expert_sessions s ON s.expert_id = e.id
           WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    return row[0] if row else None


def handler(event: dict, context) -> dict:
    """Проекты и оценки эксперта."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    token = (event.get('headers') or {}).get('X-Expert-Token') or (event.get('headers') or {}).get('x-expert-token')
    if not token:
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')

    conn = get_conn()
    cur = conn.cursor()

    expert_id = get_expert(cur, token)
    if not expert_id:
        conn.close()
        return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Сессия истекла'})}

    # GET список проектов эксперта
    if method == 'GET' and not params.get('project_id'):
        cur.execute(
            """SELECT ea.id as assignment_id, ea.status, ea.assigned_at, ea.reviewed_at,
                      p.id, p.title, p.grant_fund, p.deadline, p.status as project_status,
                      u.name as author_name, u.organization
               FROM expert_assignments ea
               JOIN projects p ON p.id = ea.project_id
               JOIN users u ON u.id = p.user_id
               WHERE ea.expert_id = %s
               ORDER BY ea.assigned_at DESC""",
            (expert_id,)
        )
        cols = ['assignment_id', 'status', 'assigned_at', 'reviewed_at',
                'project_id', 'title', 'grant_fund', 'deadline', 'project_status',
                'author_name', 'organization']
        rows = [dict(zip(cols, row)) for row in cur.fetchall()]
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(rows, default=json_serial)}

    # GET полная карта проекта + оценки
    if method == 'GET' and params.get('project_id'):
        project_id = int(params['project_id'])

        cur.execute(
            "SELECT id FROM expert_assignments WHERE project_id = %s AND expert_id = %s",
            (project_id, expert_id)
        )
        assign_row = cur.fetchone()
        if not assign_row:
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}
        assignment_id = assign_row[0]

        # Полная карта проекта
        cur.execute(
            """SELECT id,user_id,title,description,problem,target_audience,goal,expected_results,
                      budget,grant_fund,deadline,status,created_at,updated_at,
                      scale,start_date,end_date,short_description,geography,experience,prospects,
                      results_events_count,results_deadline,results_participants_count,
                      results_publications_count,results_views_count,expert_status
               FROM projects WHERE id=%s""",
            (project_id,)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Проект не найден'})}

        fields = ['id','user_id','title','description','problem','target_audience','goal','expected_results',
                  'budget','grant_fund','deadline','status','created_at','updated_at',
                  'scale','start_date','end_date','short_description','geography','experience','prospects',
                  'results_events_count','results_deadline','results_participants_count',
                  'results_publications_count','results_views_count','expert_status']
        project = dict(zip(fields, row))

        # Команда
        cur.execute("SELECT full_name,role,competencies,resume_url,resume_filename FROM project_team_members WHERE project_id=%s ORDER BY sort_order", (project_id,))
        project['team'] = [dict(zip(['full_name','role','competencies','resume_url','resume_filename'], r)) for r in cur.fetchall()]

        # Задачи
        cur.execute("SELECT id,task_name FROM project_tasks WHERE project_id=%s ORDER BY sort_order", (project_id,))
        tasks = []
        for t_row in cur.fetchall():
            tid, tname = t_row
            cur.execute(
                "SELECT event_name,deadline,event_description,unique_participants,repeat_participants,publications_count,views_count,extra_info FROM project_events WHERE task_id=%s ORDER BY sort_order",
                (tid,)
            )
            events = [dict(zip(['event_name','deadline','event_description','unique_participants','repeat_participants','publications_count','views_count','extra_info'], e)) for e in cur.fetchall()]
            tasks.append({'task_name': tname, 'events': events})
        project['tasks'] = tasks

        # Медиа
        cur.execute("SELECT resource_name,publication_month,planned_views,resource_links,format_reason FROM project_media WHERE project_id=%s ORDER BY sort_order", (project_id,))
        project['media'] = [dict(zip(['resource_name','publication_month','planned_views','resource_links','format_reason'], r)) for r in cur.fetchall()]

        # Расходы
        cur.execute("SELECT category,item_name,justification,price,quantity FROM project_expenses WHERE project_id=%s ORDER BY sort_order", (project_id,))
        project['expenses'] = [dict(zip(['category','item_name','justification','price','quantity'], r)) for r in cur.fetchall()]

        # Оценки эксперта
        cur.execute(
            "SELECT section, feedback, score, updated_at FROM expert_reviews WHERE assignment_id=%s",
            (assignment_id,)
        )
        reviews = {}
        for r in cur.fetchall():
            reviews[r[0]] = {'feedback': r[1] or '', 'score': r[2], 'updated_at': r[3].isoformat() if r[3] else None}

        # Статус назначения
        cur.execute("SELECT status FROM expert_assignments WHERE id=%s", (assignment_id,))
        assign_status = cur.fetchone()[0]

        conn.close()
        return {
            'statusCode': 200,
            'headers': CORS,
            'body': json.dumps({
                'project': project,
                'reviews': reviews,
                'assignment_id': assignment_id,
                'assignment_status': assign_status,
            }, default=json_serial),
        }

    # POST сохранить оценку раздела
    if method == 'POST' and action != 'complete':
        body = json.loads(event.get('body') or '{}')
        assignment_id = body.get('assignment_id')
        section = body.get('section', '').strip()
        feedback = body.get('feedback', '').strip()
        score = body.get('score')

        if not assignment_id or not section:
            conn.close()
            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'assignment_id и section обязательны'})}

        # Проверить что это назначение эксперта
        cur.execute("SELECT id FROM expert_assignments WHERE id=%s AND expert_id=%s", (assignment_id, expert_id))
        if not cur.fetchone():
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

        cur.execute(
            """INSERT INTO expert_reviews (assignment_id, section, feedback, score, updated_at)
               VALUES (%s, %s, %s, %s, NOW())
               ON CONFLICT (assignment_id, section)
               DO UPDATE SET feedback=EXCLUDED.feedback, score=EXCLUDED.score, updated_at=NOW()""",
            (assignment_id, section, feedback, score if score else None)
        )
        # Перевести в статус in_review если ещё pending
        cur.execute(
            "UPDATE expert_assignments SET status='in_review' WHERE id=%s AND status='pending'",
            (assignment_id,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    # POST завершить проверку
    if method == 'POST' and action == 'complete':
        body = json.loads(event.get('body') or '{}')
        assignment_id = body.get('assignment_id')

        cur.execute("SELECT project_id FROM expert_assignments WHERE id=%s AND expert_id=%s", (assignment_id, expert_id))
        row = cur.fetchone()
        if not row:
            conn.close()
            return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}

        project_id = row[0]
        cur.execute(
            "UPDATE expert_assignments SET status='reviewed', reviewed_at=NOW() WHERE id=%s",
            (assignment_id,)
        )
        cur.execute(
            "UPDATE projects SET expert_status='reviewed' WHERE id=%s",
            (project_id,)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}