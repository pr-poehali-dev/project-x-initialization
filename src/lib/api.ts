const URLS = {
  register: 'https://functions.poehali.dev/07c33f51-f9f8-40df-8484-508a72da2b38',
  login: 'https://functions.poehali.dev/62b19fda-97e2-4d50-84d6-04eaa606e5a6',
  me: 'https://functions.poehali.dev/0ec6d341-dfc2-48cb-88cf-84c95edb022d',
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
