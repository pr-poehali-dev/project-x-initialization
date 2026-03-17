import func2url from '../../backend/func2url.json'

const URLS = {
  register: func2url['auth-register'],
  login: func2url['auth-login'],
  me: func2url['me'],
  projects: func2url['projects'],
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
  return json as Project[]
}

export async function apiCreateProject(data: Partial<Project>) {
  const res = await fetch(URLS.projects, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка создания')
  return json as Project
}

export async function apiUpdateProject(id: number, data: Partial<Project>) {
  const res = await fetch(`${URLS.projects}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Ошибка обновления')
  return json as Project
}

export interface Project {
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
}
