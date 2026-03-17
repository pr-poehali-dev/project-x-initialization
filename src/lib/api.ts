import func2url from '../../backend/func2url.json'

const URLS = {
  register: func2url['auth-register'],
  login: func2url['auth-login'],
  me: func2url['me'],
  projects: func2url['projects'],
  events: func2url['events'],
  expertAuth: func2url['expert-auth'],
  expertReviews: func2url['expert-reviews'],
}

export function getToken() {
  return localStorage.getItem('gr_token')
}
export function setToken(t: string) {
  localStorage.setItem('gr_token', t)
}
export function removeToken() {
  localStorage.removeItem('gr_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { 'X-Session-Token': token } : {}
}

export async function apiRegister(data: { email: string; password: string; name: string; organization?: string }) {
  const res = await fetch(URLS.register, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка регистрации')
  return json
}

export async function apiLogin(data: { email: string; password: string }) {
  const res = await fetch(URLS.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка входа')
  return json
}

export async function apiGetMe() {
  const token = getToken()
  if (!token) return null
  const res = await fetch(URLS.me, {
    headers: { 'X-Session-Token': token },
  })
  if (!res.ok) return null
  return res.json()
}

export async function apiUpdateMe(data: { name: string; organization?: string }) {
  const token = getToken()
  if (!token) throw new Error('Не авторизован')
  const res = await fetch(URLS.me, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Session-Token': token },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка обновления')
  return json
}

export async function apiGetProjects() {
  const res = await fetch(URLS.projects, {
    headers: { ...authHeaders() },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки')
  return json as ProjectListItem[]
}

export async function apiGetProject(id: number) {
  const res = await fetch(`${URLS.projects}?id=${id}`, {
    headers: { ...authHeaders() },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки')
  return json as FullProject
}

export async function apiCreateProject(data: Partial<FullProject>) {
  const res = await fetch(URLS.projects, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка создания')
  return json as FullProject
}

export async function apiUpdateProject(id: number, data: Partial<FullProject>) {
  const res = await fetch(`${URLS.projects}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка обновления')
  return json as FullProject
}

export interface ProjectListItem {
  id: number
  title: string
  status: string
  deadline: string
  created_at: string
  updated_at: string
  scale: string
  grant_fund?: string
}

export interface TeamMember {
  id?: number
  sort_order?: number
  full_name: string
  role: string
  competencies: string
  resume_url: string
  resume_filename: string
}

export interface ProjectEvent {
  id?: number
  sort_order?: number
  event_name: string
  deadline: string
  event_description: string
  unique_participants: number | null
  repeat_participants: number | null
  publications_count: number | null
  views_count: number | null
  extra_info: string
}

export interface ProjectTask {
  id?: number
  sort_order?: number
  task_name: string
  events: ProjectEvent[]
}

export interface MediaResource {
  id?: number
  sort_order?: number
  resource_name: string
  publication_month: string
  planned_views: number | null
  resource_links: string
  format_reason: string
}

export interface ExpenseItem {
  id?: number
  sort_order?: number
  category: string
  item_name: string
  justification: string
  price: number
  quantity: number
}

export interface FullProject {
  id: number
  user_id: number
  title: string
  description: string
  problem: string
  target_audience: string
  goal: string
  expected_results: string
  budget: string
  grant_fund: string
  deadline: string
  status: string
  created_at: string
  updated_at: string
  scale: string
  start_date: string
  end_date: string
  short_description: string
  geography: string
  experience: string
  prospects: string
  results_events_count: number | null
  results_deadline: string
  results_participants_count: number | null
  results_publications_count: number | null
  results_views_count: number | null
  team: TeamMember[]
  tasks: ProjectTask[]
  media: MediaResource[]
  expenses: ExpenseItem[]
  expert_status?: string | null
}

export type Project = ProjectListItem

export interface GrantEvent {
  id: number
  title: string
  organizer: string
  description: string
  deadline: string | null
  start_date: string | null
  end_date: string | null
  grant_amount: string
  category: string
  geography: string
  target_audience: string
  application_url: string
  status: string
  created_at: string
}

export async function apiGetEvents(params?: { category?: string; status?: string }) {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.status) qs.set('status', params.status)
  const url = qs.toString() ? `${URLS.events}?${qs}` : URLS.events
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки мероприятий')
  return json as GrantEvent[]
}

// ─── Expert Auth ───────────────────────────────────────────────────────────────

export function getExpertToken() { return localStorage.getItem('gr_expert_token') }
export function setExpertToken(t: string) { localStorage.setItem('gr_expert_token', t) }
export function removeExpertToken() { localStorage.removeItem('gr_expert_token') }

function expertHeaders() {
  const token = getExpertToken()
  return token ? { 'X-Expert-Token': token } : {}
}

export async function apiExpertRegister(data: { email: string; password: string; name: string; specialization?: string }) {
  const res = await fetch(`${URLS.expertAuth}?action=register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка регистрации')
  return json as { token: string; expert: ExpertUser }
}

export async function apiExpertLogin(data: { email: string; password: string }) {
  const res = await fetch(`${URLS.expertAuth}?action=login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка входа')
  return json as { token: string; expert: ExpertUser }
}

export async function apiGetExpertMe() {
  const token = getExpertToken()
  if (!token) return null
  const res = await fetch(URLS.expertAuth, { headers: { 'X-Expert-Token': token } })
  if (!res.ok) return null
  return res.json() as Promise<ExpertUser>
}

// ─── Expert Reviews ────────────────────────────────────────────────────────────

export async function apiGetExpertProjects() {
  const res = await fetch(URLS.expertReviews, { headers: { ...expertHeaders() } })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки')
  return json as ExpertAssignment[]
}

export async function apiGetExpertProject(projectId: number) {
  const res = await fetch(`${URLS.expertReviews}?project_id=${projectId}`, { headers: { ...expertHeaders() } })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки')
  return json as { project: FullProject; reviews: Record<string, ExpertReview>; assignment_id: number; assignment_status: string }
}

export async function apiSaveExpertReview(data: { assignment_id: number; section: string; feedback: string; score: number | null }) {
  const res = await fetch(URLS.expertReviews, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...expertHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка сохранения')
  return json
}

export async function apiCompleteExpertReview(assignment_id: number) {
  const res = await fetch(`${URLS.expertReviews}?action=complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...expertHeaders() },
    body: JSON.stringify({ assignment_id }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка завершения')
  return json
}

export async function apiSubmitToExpert(projectId: number, expertEmail: string) {
  const res = await fetch(`${URLS.projects}?action=submit_expert&id=${projectId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ expert_email: expertEmail }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка отправки')
  return json
}

export async function apiGetProjectReviews(projectId: number) {
  const res = await fetch(`${URLS.projects}?action=reviews&id=${projectId}`, { headers: { ...authHeaders() } })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка загрузки')
  return json as ExpertAssignmentWithReviews[]
}

// ─── Expert Types ──────────────────────────────────────────────────────────────

export interface ExpertUser {
  id: number
  email: string
  name: string
  specialization: string
}

export interface ExpertAssignment {
  assignment_id: number
  status: string
  assigned_at: string
  reviewed_at: string | null
  project_id: number
  title: string
  grant_fund: string
  deadline: string
  project_status: string
  author_name: string
  organization: string
}

export interface ExpertReview {
  feedback: string
  score: number | null
  updated_at?: string | null
}

export interface ExpertAssignmentWithReviews {
  assignment_id: number
  status: string
  assigned_at: string
  reviewed_at: string | null
  expert_name: string
  specialization: string
  reviews: Record<string, ExpertReview>
}

export async function apiCreateEvent(data: Partial<GrantEvent>) {
  const res = await fetch(URLS.events, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка создания мероприятия')
  return json
}