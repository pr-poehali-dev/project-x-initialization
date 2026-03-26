"""
Координаторы — управление координаторами платформы Грантовый дайвинг.

Для администратора:
GET  ?action=experts            — список экспертов
POST ?action=assign             — назначить координатора { expert_id, level, location }
GET  ?action=list               — список координаторов

Для координатора (X-Expert-Token):
GET  ?action=me                 — профиль координатора
GET  ?action=events             — мероприятия координатора
POST ?action=create_event       — создать мероприятие
PUT  ?action=update_event       — обновить мероприятие { event_id, ... }
POST ?action=delete_event       — удалить мероприятие { event_id }
GET  ?action=submissions        — заявки на мероприятия координатора
PUT  ?action=update_submission  — изменить статус заявки { submission_id, status }
GET  ?action=appeals            — обращения координатора
PUT  ?action=update_appeal      — изменить статус обращения { appeal_id, status, response }
GET  ?action=project_bank       — банк проектов координатора
GET  ?action=project_card       — полная карта проекта { project_id }

Для участника (X-Session-Token):
GET  ?action=available          — доступные координаторы { level? }
POST ?action=set_coordinator    — прикрепиться к координатору { coordinator_id }
POST ?action=add_to_bank        — добавить проект в банк { project_id }
POST ?action=create_appeal      — создать обращение { coordinator_id, title, message }
"""
import json
import os
import psycopg2
from datetime import datetime

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token, X-Expert-Token, X-Auth-Token',
    'Content-Type': 'application/json',
}

LEVELS = {'local': 'локальный', 'municipal': 'муниципальный', 'regional': 'региональный', 'district': 'окружной'}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data, code=200):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data, default=str)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}


def get_user(cur, token):
    cur.execute(
        """SELECT u.id, u.is_admin, u.coordinator_id FROM users u
           JOIN sessions s ON s.user_id = u.id
           WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def get_expert(cur, token):
    cur.execute(
        """SELECT e.id FROM experts e
           JOIN expert_sessions s ON s.expert_id = e.id
           WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def get_coordinator_by_expert(cur, expert_id):
    cur.execute("SELECT id, level, location FROM coordinators WHERE expert_id = %s", (expert_id,))
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    """Управление координаторами платформы."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    headers = event.get('headers') or {}
    session_token = headers.get('X-Session-Token') or headers.get('x-session-token')
    expert_token = headers.get('X-Expert-Token') or headers.get('x-expert-token')
    body = json.loads(event.get('body') or '{}')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # === ADMIN ACTIONS ===

        if action == 'experts':
            # Список экспертов для назначения координатором
            user = get_user(cur, session_token) if session_token else None
            if not user or not user[1]:
                return err('Нет доступа', 403)
            cur.execute("""
                SELECT e.id, e.email, e.name, e.specialization, e.city, e.phone, e.full_name,
                       c.id as coord_id, c.level, c.location
                FROM experts e
                LEFT JOIN coordinators c ON c.expert_id = e.id
                ORDER BY e.name
            """)
            rows = cur.fetchall()
            return ok([{
                'id': r[0], 'email': r[1], 'name': r[2], 'specialization': r[3] or '',
                'city': r[4] or '', 'phone': r[5] or '', 'full_name': r[6] or '',
                'coordinator_id': r[7], 'coordinator_level': r[8], 'coordinator_location': r[9],
            } for r in rows])

        if action == 'assign':
            user = get_user(cur, session_token) if session_token else None
            if not user or not user[1]:
                return err('Нет доступа', 403)
            expert_id = body.get('expert_id')
            level = body.get('level')
            location = body.get('location', '')
            if not expert_id or level not in LEVELS:
                return err('Заполните все поля')
            # Проверяем, что location заполнен для нужных уровней
            if level in ('municipal', 'regional', 'district') and not location:
                return err('Укажите локацию для выбранного уровня')
            cur.execute("SELECT id FROM experts WHERE id = %s", (expert_id,))
            if not cur.fetchone():
                return err('Эксперт не найден', 404)
            # Upsert
            cur.execute(
                """INSERT INTO coordinators (expert_id, level, location, created_by)
                   VALUES (%s, %s, %s, %s)
                   ON CONFLICT (expert_id) DO UPDATE SET level=EXCLUDED.level, location=EXCLUDED.location""",
                (expert_id, level, location or None, user[0])
            )
            cur.execute("SELECT id FROM coordinators WHERE expert_id = %s", (expert_id,))
            coord_id = cur.fetchone()[0]
            # Лог
            cur.execute(
                """INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
                   VALUES (%s, %s, %s, %s, %s)""",
                (user[0], 'assign_coordinator', 'expert', expert_id,
                 json.dumps({'level': level, 'location': location, 'coordinator_id': coord_id}))
            )
            conn.commit()
            return ok({'success': True, 'coordinator_id': coord_id})

        if action == 'list':
            user = get_user(cur, session_token) if session_token else None
            if not user or not user[1]:
                return err('Нет доступа', 403)
            cur.execute("""
                SELECT c.id, c.level, c.location, c.created_at,
                       e.id as eid, e.name, e.email, e.city
                FROM coordinators c JOIN experts e ON e.id = c.expert_id
                ORDER BY c.level, e.name
            """)
            rows = cur.fetchall()
            return ok([{
                'id': r[0], 'level': r[1], 'level_label': LEVELS.get(r[1], r[1]),
                'location': r[2] or '', 'created_at': str(r[3]),
                'expert_id': r[4], 'expert_name': r[5], 'expert_email': r[6], 'expert_city': r[7] or '',
            } for r in rows])

        # === COORDINATOR ACTIONS (expert token) ===

        if action in ('me', 'events', 'create_event', 'update_event', 'delete_event',
                      'submissions', 'update_submission', 'appeals', 'update_appeal',
                      'project_bank', 'project_card'):
            if not expert_token:
                return err('Нет доступа', 403)
            expert = get_expert(cur, expert_token)
            if not expert:
                return err('Не авторизован', 401)
            expert_id = expert[0]
            coord = get_coordinator_by_expert(cur, expert_id)
            if not coord:
                return err('Вы не являетесь координатором', 403)
            coord_id, coord_level, coord_location = coord

            if action == 'me':
                cur.execute("""
                    SELECT e.id, e.email, e.name, e.specialization, e.city, e.phone, e.full_name,
                           c.id, c.level, c.location
                    FROM experts e JOIN coordinators c ON c.expert_id = e.id
                    WHERE e.id = %s
                """, (expert_id,))
                r = cur.fetchone()
                return ok({
                    'expert_id': r[0], 'email': r[1], 'name': r[2], 'specialization': r[3] or '',
                    'city': r[4] or '', 'phone': r[5] or '', 'full_name': r[6] or '',
                    'coordinator_id': r[7], 'level': r[8], 'level_label': LEVELS.get(r[8], r[8]),
                    'location': r[9] or '',
                })

            if action == 'events':
                page = int(params.get('page', 1))
                per_page = int(params.get('per_page', 20))
                offset = (page - 1) * per_page
                cur.execute("""
                    SELECT id, title, organizer, description, deadline, status, is_our_event,
                           date_start, date_end, category, created_at
                    FROM grant_events WHERE coordinator_id = %s
                    ORDER BY created_at DESC LIMIT %s OFFSET %s
                """, (coord_id, per_page, offset))
                rows = cur.fetchall()
                cur.execute("SELECT COUNT(*) FROM grant_events WHERE coordinator_id = %s", (coord_id,))
                total = cur.fetchone()[0]
                return ok({
                    'items': [{
                        'id': r[0], 'title': r[1], 'organizer': r[2] or '', 'description': r[3] or '',
                        'deadline': str(r[4]) if r[4] else '', 'status': r[5] or '',
                        'is_our_event': bool(r[6]), 'date_start': str(r[7]) if r[7] else '',
                        'date_end': str(r[8]) if r[8] else '', 'category': r[9] or '',
                        'created_at': str(r[10]),
                    } for r in rows],
                    'total': total, 'page': page, 'per_page': per_page,
                })

            if action == 'create_event':
                title = body.get('title', '').strip()
                if not title:
                    return err('Укажите название мероприятия')
                cur.execute("""
                    INSERT INTO grant_events (title, organizer, description, deadline, status,
                        is_our_event, date_start, date_end, category, coordinator_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
                """, (
                    title, body.get('organizer', ''), body.get('description', ''),
                    body.get('deadline') or None, body.get('status', 'active'),
                    True, body.get('date_start') or None, body.get('date_end') or None,
                    body.get('category', ''), coord_id,
                ))
                event_id = cur.fetchone()[0]
                conn.commit()
                return ok({'success': True, 'event_id': event_id}, 201)

            if action == 'update_event':
                event_id = body.get('event_id')
                if not event_id:
                    return err('Укажите event_id')
                cur.execute("SELECT id FROM grant_events WHERE id = %s AND coordinator_id = %s", (event_id, coord_id))
                if not cur.fetchone():
                    return err('Мероприятие не найдено', 404)
                cur.execute("""
                    UPDATE grant_events SET title=%s, organizer=%s, description=%s, deadline=%s,
                        status=%s, date_start=%s, date_end=%s, category=%s, updated_at=NOW()
                    WHERE id=%s
                """, (
                    body.get('title', ''), body.get('organizer', ''), body.get('description', ''),
                    body.get('deadline') or None, body.get('status', 'active'),
                    body.get('date_start') or None, body.get('date_end') or None,
                    body.get('category', ''), event_id,
                ))
                conn.commit()
                return ok({'success': True})

            if action == 'delete_event':
                event_id = body.get('event_id')
                cur.execute("SELECT id FROM grant_events WHERE id = %s AND coordinator_id = %s", (event_id, coord_id))
                if not cur.fetchone():
                    return err('Мероприятие не найдено', 404)
                cur.execute("UPDATE grant_events SET status='deleted' WHERE id = %s", (event_id,))
                conn.commit()
                return ok({'success': True})

            if action == 'submissions':
                page = int(params.get('page', 1))
                per_page = int(params.get('per_page', 20))
                offset = (page - 1) * per_page
                cur.execute("""
                    SELECT eps.id, eps.event_id, ge.title as event_title,
                           eps.user_id, u.full_name, u.name, u.email,
                           eps.submitted_at, eps.expert_launched,
                           p.id as project_id, p.title as project_title
                    FROM event_project_submissions eps
                    JOIN grant_events ge ON ge.id = eps.event_id
                    JOIN users u ON u.id = eps.user_id
                    JOIN projects p ON p.id = eps.project_id
                    WHERE ge.coordinator_id = %s
                    ORDER BY eps.submitted_at DESC LIMIT %s OFFSET %s
                """, (coord_id, per_page, offset))
                rows = cur.fetchall()
                cur.execute("""
                    SELECT COUNT(*) FROM event_project_submissions eps
                    JOIN grant_events ge ON ge.id = eps.event_id WHERE ge.coordinator_id = %s
                """, (coord_id,))
                total = cur.fetchone()[0]
                return ok({
                    'items': [{
                        'id': r[0], 'event_id': r[1], 'event_title': r[2],
                        'user_id': r[3], 'full_name': r[4] or r[5] or '', 'email': r[6],
                        'submitted_at': str(r[7]) if r[7] else '',
                        'status': 'На экспертизе' if r[8] else 'Ожидает рассмотрения',
                        'project_id': r[9], 'project_title': r[10],
                    } for r in rows],
                    'total': total, 'page': page, 'per_page': per_page,
                })

            if action == 'update_submission':
                sub_id = body.get('submission_id')
                status = body.get('status')
                if not sub_id:
                    return err('Укажите submission_id')
                # Пока просто помечаем expert_launched
                expert_launched = status == 'На экспертизе'
                cur.execute("""
                    UPDATE event_project_submissions SET expert_launched=%s WHERE id=%s
                """, (expert_launched, sub_id))
                conn.commit()
                return ok({'success': True})

            if action == 'appeals':
                page = int(params.get('page', 1))
                per_page = int(params.get('per_page', 20))
                offset = (page - 1) * per_page
                status_filter = params.get('status')
                query = """
                    SELECT ca.id, ca.user_id, u.full_name, u.name, u.email,
                           ca.title, ca.message, ca.status, ca.response, ca.created_at, ca.updated_at
                    FROM coordinator_appeals ca JOIN users u ON u.id = ca.user_id
                    WHERE ca.coordinator_id = %s
                """
                q_params = [coord_id]
                if status_filter:
                    query += " AND ca.status = %s"
                    q_params.append(status_filter)
                query += " ORDER BY ca.created_at DESC LIMIT %s OFFSET %s"
                q_params.extend([per_page, offset])
                cur.execute(query, q_params)
                rows = cur.fetchall()
                count_q = "SELECT COUNT(*) FROM coordinator_appeals WHERE coordinator_id = %s"
                count_params = [coord_id]
                if status_filter:
                    count_q += " AND status = %s"
                    count_params.append(status_filter)
                cur.execute(count_q, count_params)
                total = cur.fetchone()[0]
                STATUS_LABELS = {'new': 'Новое', 'in_progress': 'В работе', 'resolved': 'Решено'}
                return ok({
                    'items': [{
                        'id': r[0], 'user_id': r[1], 'user_name': r[2] or r[3] or '', 'user_email': r[4],
                        'title': r[5] or '', 'message': r[6], 'status': r[7],
                        'status_label': STATUS_LABELS.get(r[7], r[7]),
                        'response': r[8] or '', 'created_at': str(r[9]), 'updated_at': str(r[10]),
                    } for r in rows],
                    'total': total, 'page': page, 'per_page': per_page,
                })

            if action == 'update_appeal':
                appeal_id = body.get('appeal_id')
                new_status = body.get('status')
                response = body.get('response', '')
                if not appeal_id or new_status not in ('new', 'in_progress', 'resolved'):
                    return err('Неверные данные')
                cur.execute("""
                    UPDATE coordinator_appeals SET status=%s, response=%s, updated_at=NOW()
                    WHERE id=%s AND coordinator_id=%s
                """, (new_status, response, appeal_id, coord_id))
                conn.commit()
                return ok({'success': True})

            if action == 'project_bank':
                page = int(params.get('page', 1))
                per_page = int(params.get('per_page', 20))
                offset = (page - 1) * per_page
                search = params.get('search', '').strip()
                status_filter = params.get('status')
                query = """
                    SELECT pb.id, pb.project_id, pb.status, pb.added_at,
                           p.title, p.expert_status,
                           u.full_name, u.name, u.email
                    FROM project_bank pb
                    JOIN projects p ON p.id = pb.project_id
                    JOIN users u ON u.id = pb.added_by
                    WHERE pb.coordinator_id = %s
                """
                q_params = [coord_id]
                if search:
                    query += " AND (p.title ILIKE %s OR u.full_name ILIKE %s OR u.name ILIKE %s)"
                    q_params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])
                if status_filter:
                    query += " AND pb.status = %s"
                    q_params.append(status_filter)
                query += " ORDER BY pb.added_at DESC LIMIT %s OFFSET %s"
                q_params.extend([per_page, offset])
                cur.execute(query, q_params)
                rows = cur.fetchall()
                count_q = "SELECT COUNT(*) FROM project_bank pb JOIN projects p ON p.id = pb.project_id JOIN users u ON u.id = pb.added_by WHERE pb.coordinator_id = %s"
                count_params = [coord_id]
                if search:
                    count_q += " AND (p.title ILIKE %s OR u.full_name ILIKE %s OR u.name ILIKE %s)"
                    count_params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])
                if status_filter:
                    count_q += " AND pb.status = %s"
                    count_params.append(status_filter)
                cur.execute(count_q, count_params)
                total = cur.fetchone()[0]
                return ok({
                    'items': [{
                        'bank_id': r[0], 'project_id': r[1], 'bank_status': r[2],
                        'added_at': str(r[3]), 'title': r[4],
                        'expert_status': r[5] or '', 'author_name': r[6] or r[7] or '',
                        'author_email': r[8],
                    } for r in rows],
                    'total': total, 'page': page, 'per_page': per_page,
                })

            if action == 'project_card':
                project_id = params.get('project_id')
                if not project_id:
                    return err('Укажите project_id')
                # Проверяем, что проект в банке этого координатора
                cur.execute("""
                    SELECT p.id, p.title, p.description, p.problem, p.goal, p.target_audience,
                           p.experience, p.geography, p.budget, p.deadline, p.scale,
                           p.grant_fund, p.date_start, p.date_end, p.results_events,
                           p.results_participants, p.results_publications, p.results_views,
                           p.expert_status, p.created_at,
                           u.full_name, u.name, u.email, u.city, u.organization
                    FROM projects p
                    JOIN project_bank pb ON pb.project_id = p.id
                    JOIN users u ON u.id = p.user_id
                    WHERE p.id = %s AND pb.coordinator_id = %s
                """, (project_id, coord_id))
                row = cur.fetchone()
                if not row:
                    return err('Проект не найден', 404)
                # Команда
                cur.execute("SELECT name, role, competencies FROM project_team_members WHERE project_id = %s", (project_id,))
                team = [{'name': t[0], 'role': t[1], 'competencies': t[2]} for t in cur.fetchall()]
                # Расходы
                cur.execute("SELECT category, name, price, quantity FROM project_expenses WHERE project_id = %s", (project_id,))
                expenses = [{'category': e[0], 'name': e[1], 'price': float(e[2] or 0), 'quantity': e[3]} for e in cur.fetchall()]
                return ok({
                    'id': row[0], 'title': row[1], 'description': row[2] or '',
                    'problem': row[3] or '', 'goal': row[4] or '', 'target_audience': row[5] or '',
                    'experience': row[6] or '', 'geography': row[7] or '',
                    'budget': float(row[8] or 0), 'deadline': str(row[9]) if row[9] else '',
                    'scale': row[10] or '', 'grant_fund': row[11] or '',
                    'date_start': str(row[12]) if row[12] else '', 'date_end': str(row[13]) if row[13] else '',
                    'results_events': row[14], 'results_participants': row[15],
                    'results_publications': row[16], 'results_views': row[17],
                    'expert_status': row[18] or '', 'created_at': str(row[19]),
                    'author_name': row[20] or row[21] or '', 'author_email': row[22],
                    'author_city': row[23] or '', 'author_organization': row[24] or '',
                    'team': team, 'expenses': expenses,
                })

        # === USER ACTIONS ===

        if action == 'available':
            if not session_token:
                return err('Не авторизован', 401)
            user = get_user(cur, session_token)
            if not user:
                return err('Не авторизован', 401)
            level_filter = params.get('level')
            query = """
                SELECT c.id, c.level, c.location, e.name, e.email, e.city, e.full_name
                FROM coordinators c JOIN experts e ON e.id = c.expert_id
            """
            q_params = []
            if level_filter:
                query += " WHERE c.level = %s"
                q_params.append(level_filter)
            query += " ORDER BY c.level, e.name"
            cur.execute(query, q_params)
            rows = cur.fetchall()
            return ok([{
                'id': r[0], 'level': r[1], 'level_label': LEVELS.get(r[1], r[1]),
                'location': r[2] or '', 'name': r[3], 'email': r[4],
                'city': r[5] or '', 'full_name': r[6] or '',
            } for r in rows])

        if action == 'set_coordinator':
            if not session_token:
                return err('Не авторизован', 401)
            user = get_user(cur, session_token)
            if not user:
                return err('Не авторизован', 401)
            coordinator_id = body.get('coordinator_id')
            if not coordinator_id:
                return err('Укажите coordinator_id')
            cur.execute("SELECT id FROM coordinators WHERE id = %s", (coordinator_id,))
            if not cur.fetchone():
                return err('Координатор не найден', 404)
            cur.execute("UPDATE users SET coordinator_id = %s WHERE id = %s", (coordinator_id, user[0]))
            conn.commit()
            return ok({'success': True})

        if action == 'add_to_bank':
            if not session_token:
                return err('Не авторизован', 401)
            user = get_user(cur, session_token)
            if not user:
                return err('Не авторизован', 401)
            project_id = body.get('project_id')
            if not project_id:
                return err('Укажите project_id')
            cur.execute("SELECT id FROM projects WHERE id = %s AND user_id = %s", (project_id, user[0]))
            if not cur.fetchone():
                return err('Проект не найден', 404)
            coordinator_id = user[2]
            if not coordinator_id:
                return err('Вы не прикреплены к координатору. Сначала выберите координатора в профиле.')
            cur.execute("SELECT id FROM project_bank WHERE project_id = %s", (project_id,))
            if cur.fetchone():
                return err('Проект уже добавлен в банк')
            cur.execute("""
                INSERT INTO project_bank (project_id, coordinator_id, added_by, status)
                VALUES (%s, %s, %s, 'in_bank')
            """, (project_id, coordinator_id, user[0]))
            cur.execute("UPDATE projects SET expert_status = 'in_bank' WHERE id = %s", (project_id,))
            conn.commit()
            return ok({'success': True}, 201)

        if action == 'create_appeal':
            if not session_token:
                return err('Не авторизован', 401)
            user = get_user(cur, session_token)
            if not user:
                return err('Не авторизован', 401)
            coordinator_id = body.get('coordinator_id') or user[2]
            if not coordinator_id:
                return err('Укажите coordinator_id')
            message = body.get('message', '').strip()
            if not message:
                return err('Введите текст обращения')
            cur.execute("""
                INSERT INTO coordinator_appeals (coordinator_id, user_id, title, message)
                VALUES (%s, %s, %s, %s) RETURNING id
            """, (coordinator_id, user[0], body.get('title', '').strip() or None, message))
            appeal_id = cur.fetchone()[0]
            conn.commit()
            return ok({'success': True, 'appeal_id': appeal_id}, 201)

        return err('Неизвестное действие')

    finally:
        conn.close()
