import type { FullProject, TeamMember, ProjectTask, ProjectEvent, MediaResource, ExpenseItem } from '@/lib/api'

export type { FullProject, TeamMember, ProjectTask, ProjectEvent, MediaResource, ExpenseItem }

export const SCALE_OPTIONS = [
  { value: 'federal', label: 'Всероссийский' },
  { value: 'district', label: 'Окружной' },
  { value: 'regional', label: 'Региональный' },
  { value: 'municipal', label: 'Муниципальный' },
]

export const EXPENSE_CATEGORIES = [
  { value: 'direct', label: 'Прямые расходы по проекту' },
  { value: 'additional', label: 'Дополнительные услуги и товары для проекта' },
]

export const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]

export function emptyTeamMember(): TeamMember {
  return { full_name: '', role: '', competencies: '', resume_url: '', resume_filename: '' }
}

export function emptyEvent(): ProjectEvent {
  return {
    event_name: '', deadline: '', event_description: '',
    unique_participants: null, repeat_participants: null,
    publications_count: null, views_count: null, extra_info: ''
  }
}

export function emptyTask(): ProjectTask {
  return { task_name: '', events: [] }
}

export function emptyMedia(): MediaResource {
  return { resource_name: '', publication_month: '', planned_views: null, resource_links: '', format_reason: '' }
}

export function emptyExpense(): ExpenseItem {
  return { category: 'direct', item_name: '', justification: '', price: 0, quantity: 0 }
}

export function emptyProject(): Omit<FullProject, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  return {
    title: '', description: '', problem: '', target_audience: '', goal: '',
    expected_results: '', budget: '', grant_fund: '', deadline: '', status: 'draft',
    scale: '', start_date: '', end_date: '', short_description: '', geography: '',
    experience: '', prospects: '',
    results_events_count: null, results_deadline: '', results_participants_count: null,
    results_publications_count: null, results_views_count: null,
    team: [emptyTeamMember()],
    tasks: [],
    media: [],
    expenses: [],
  }
}
