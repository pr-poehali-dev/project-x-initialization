import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMe, apiGetProjects, removeToken } from '@/lib/api'
import type { Project } from '@/lib/api'
import Icon from '@/components/ui/icon'
import { useTheme } from '@/hooks/useTheme'

interface User {
  id: number
  email: string
  name: string
  organization: string
  created_at: string
  is_admin?: boolean
}

const STATUS_LABEL: Record<string, { label: string; darkColor: string; lightColor: string }> = {
  draft:     { label: 'Черновик',    darkColor: 'text-white/40 bg-white/5',        lightColor: 'text-gray-500 bg-gray-100' },
  review:    { label: 'На проверке', darkColor: 'text-amber-400 bg-amber-500/10',  lightColor: 'text-amber-600 bg-amber-50' },
  submitted: { label: 'Подана',      darkColor: 'text-blue-400 bg-blue-500/10',    lightColor: 'text-blue-600 bg-blue-50' },
  won:       { label: 'Победа!',     darkColor: 'text-green-400 bg-green-500/10',  lightColor: 'text-green-600 bg-green-50' },
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const t = {
    bg:           dark ? '#0a0f1e'                    : '#f5f7fa',
    headerBg:     dark ? 'rgba(255,255,255,0.02)'     : 'rgba(255,255,255,0.9)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.08)',
    cardBg:       dark ? 'rgba(255,255,255,0.03)'     : '#ffffff',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.07)',
    cardHover:    dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.12)',
    text:         dark ? '#ffffff'                    : '#111827',
    textMuted:    dark ? 'rgba(255,255,255,0.4)'      : '#6b7280',
    textFaint:    dark ? 'rgba(255,255,255,0.2)'      : '#d1d5db',
    emptyBorder:  dark ? 'rgba(255,255,255,0.1)'      : 'rgba(0,0,0,0.1)',
    logoFilter:   dark ? 'invert(1)'                  : 'none',
    toggleBg:     dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.06)',
    toggleColor:  dark ? 'rgba(255,255,255,0.5)'      : '#6b7280',
  }

  useEffect(() => {
    Promise.all([apiGetMe(), apiGetProjects().catch(() => [])]).then(([u, p]) => {
      if (!u) { navigate('/'); return }
      setUser(u)
      setProjects(p as Project[])
      setLoading(false)
    })
  }, [navigate])

  function handleLogout() {
    removeToken()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
      </div>
    )
  }

  const joinDate = user ? new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const wonCount = projects.filter(p => p.status === 'won').length
  const reviewCount = projects.filter(p => p.status === 'review' || p.status === 'submitted').length

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Header */}
      <header className="border-b px-6 py-4 transition-colors duration-300" style={{ background: t.headerBg, borderColor: t.headerBorder, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              className="w-7 h-7 transition-all duration-300"
              style={{ filter: t.logoFilter }}
            />
            <span className="font-semibold transition-colors duration-300" style={{ color: t.text }}>Грантовый дайвинг</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
              style={{ color: t.textMuted }}
            >
              <Icon name="Home" size={15} />
              <span className="hidden sm:inline">Главная</span>
            </button>
            <button
              onClick={() => navigate('/events')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
              style={{ color: t.textMuted }}
            >
              <Icon name="CalendarDays" size={15} />
              <span className="hidden sm:inline">Мероприятия</span>
            </button>
            {user?.is_admin && (
              <button
                onClick={() => navigate('/admin/events')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
                style={{ color: t.textMuted }}
              >
                <Icon name="Settings2" size={15} />
                <span className="hidden sm:inline">Управление</span>
              </button>
            )}
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ background: t.toggleBg, color: t.toggleColor }}
              title={dark ? 'Светлая тема' : 'Тёмная тема'}
            >
              <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
              <span className="hidden sm:inline">{dark ? 'Светлая' : 'Тёмная'}</span>
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
              style={{ color: t.textMuted }}
            >
              <Icon name="UserCog" size={15} />
              <span className="hidden sm:inline">Профиль</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200"
              style={{ color: t.textMuted }}
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1 transition-colors duration-300" style={{ color: t.text }}>
            Привет, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm transition-colors duration-300" style={{ color: t.textMuted }}>
            {user?.organization ? `${user.organization} · ` : ''}С нами с {joinDate}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Проектов',    value: String(projects.length), icon: 'FolderOpen', color: 'from-blue-500 to-blue-600' },
            { label: 'На проверке', value: String(reviewCount),     icon: 'Clock',      color: 'from-amber-500 to-orange-500' },
            { label: 'Побед',       value: String(wonCount),        icon: 'Trophy',     color: 'from-green-500 to-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border p-5 transition-colors duration-300" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={17} className="text-white" />
              </div>
              <div className="text-2xl font-bold transition-colors duration-300" style={{ color: t.text }}>{stat.value}</div>
              <div className="text-sm mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: t.emptyBorder }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="Plus" size={24} className="text-green-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2 transition-colors duration-300" style={{ color: t.text }}>Создайте первый проект</h3>
            <p className="text-sm mb-5 max-w-xs mx-auto transition-colors duration-300" style={{ color: t.textMuted }}>
              Заполните проектную карту и получите готовую заявку для подачи на грант
            </p>
            <button
              onClick={() => navigate('/projects/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
            >
              <Icon name="Plus" size={16} />
              Новый проект
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg transition-colors duration-300" style={{ color: t.text }}>Мои проекты</h2>
              <button
                onClick={() => navigate('/projects/new')}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
              >
                <Icon name="Plus" size={15} />
                Новый
              </button>
            </div>
            <div className="space-y-3">
              {projects.map(p => {
                const s = STATUS_LABEL[p.status] || STATUS_LABEL.draft
                const statusClass = dark ? s.darkColor : s.lightColor
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = t.cardHover)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = t.cardBorder)}
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={17} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate transition-colors duration-300" style={{ color: t.text }}>{p.title}</div>
                      <div className="text-xs mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>
                        {p.grant_fund || 'Фонд не указан'}{p.deadline ? ` · до ${new Date(p.deadline).toLocaleDateString('ru-RU')}` : ''}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${statusClass}`}>
                      {s.label}
                    </span>
                    <Icon name="ChevronRight" size={16} style={{ color: t.textFaint }} className="flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Академия грантов',  desc: 'Образовательная платформа с курсами', icon: 'GraduationCap' },
            { title: 'Найти эксперта',  desc: 'Консультация и ревью проекта',        icon: 'Users' },
          ].map(item => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200"
              style={{ background: t.cardBg, borderColor: t.cardBorder }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = t.cardHover)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = t.cardBorder)}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: t.toggleBg }}>
                <Icon name={item.icon} size={18} style={{ color: t.textMuted }} />
              </div>
              <div>
                <div className="text-sm font-medium transition-colors duration-300" style={{ color: t.text }}>{item.title}</div>
                <div className="text-xs mt-0.5 transition-colors duration-300" style={{ color: t.textMuted }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}