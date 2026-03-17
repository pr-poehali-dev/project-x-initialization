import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMe, apiGetEvents, removeToken } from '@/lib/api'
import type { GrantEvent } from '@/lib/api'
import Icon from '@/components/ui/icon'
import { useTheme } from '@/hooks/useTheme'

const CATEGORIES = ['Все', 'Молодёжь', 'Культура', 'Наука', 'Образование', 'Спорт', 'Социальный', 'Экология', 'Другое']

const STATUS_MAP: Record<string, { label: string; darkColor: string; lightColor: string }> = {
  open:   { label: 'Приём заявок', darkColor: 'text-green-400 bg-green-500/10',  lightColor: 'text-green-700 bg-green-50' },
  soon:   { label: 'Скоро',        darkColor: 'text-amber-400 bg-amber-500/10',  lightColor: 'text-amber-700 bg-amber-50' },
  closed: { label: 'Завершён',     darkColor: 'text-white/30 bg-white/5',        lightColor: 'text-gray-400 bg-gray-100' },
}

function daysLeft(deadline: string | null): string | null {
  if (!deadline) return null
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Срок истёк'
  if (diff === 0) return 'Сегодня последний день'
  if (diff === 1) return '1 день'
  if (diff < 5) return `${diff} дня`
  return `${diff} дней`
}

export default function Events() {
  const [events, setEvents] = useState<GrantEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Все')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const t = {
    bg:           dark ? '#0a0f1e'                 : '#f5f7fa',
    headerBg:     dark ? 'rgba(255,255,255,0.02)'  : 'rgba(255,255,255,0.9)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.08)',
    cardBg:       dark ? 'rgba(255,255,255,0.03)'  : '#ffffff',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.07)',
    cardHover:    dark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.12)',
    text:         dark ? '#ffffff'                 : '#111827',
    textMuted:    dark ? 'rgba(255,255,255,0.4)'   : '#6b7280',
    textFaint:    dark ? 'rgba(255,255,255,0.2)'   : '#d1d5db',
    emptyBorder:  dark ? 'rgba(255,255,255,0.1)'   : 'rgba(0,0,0,0.1)',
    logoFilter:   dark ? 'invert(1)'               : 'none',
    toggleBg:     dark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.06)',
    toggleColor:  dark ? 'rgba(255,255,255,0.5)'   : '#6b7280',
    inputBg:      dark ? 'rgba(255,255,255,0.05)'  : '#ffffff',
    inputBorder:  dark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.12)',
    tagBg:        dark ? 'rgba(255,255,255,0.06)'  : 'rgba(0,0,0,0.05)',
    tagActiveBg:  dark ? 'rgba(255,255,255,0.12)'  : '#111827',
    tagActiveText:dark ? '#ffffff'                 : '#ffffff',
    tagText:      dark ? 'rgba(255,255,255,0.5)'   : '#6b7280',
    sectionBg:    dark ? 'rgba(255,255,255,0.02)'  : '#f9fafb',
  }

  useEffect(() => {
    Promise.all([apiGetMe(), apiGetEvents({ status: 'all' }).catch(() => [])]).then(([u, ev]) => {
      if (!u) { navigate('/'); return }
      setEvents(ev as GrantEvent[])
      setLoading(false)
    })
  }, [navigate])

  function handleLogout() {
    removeToken()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ background: t.bg }}>
        <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
      </div>
    )
  }

  const filtered = events.filter(ev => {
    const matchCat = category === 'Все' || ev.category === category
    const q = search.toLowerCase()
    const matchSearch = !q || ev.title.toLowerCase().includes(q) || ev.organizer?.toLowerCase().includes(q) || ev.description?.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Header */}
      <header
        className="px-6 py-4 sticky top-0 z-20 transition-colors duration-300"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
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
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:opacity-70"
              style={{ color: t.textMuted }}
            >
              <Icon name="LayoutDashboard" size={15} />
              <span className="hidden sm:inline">Мои проекты</span>
            </button>
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:opacity-70"
              style={{ color: t.textMuted }}
            >
              <Icon name="UserCog" size={15} />
              <span className="hidden sm:inline">Профиль</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:opacity-70"
              style={{ color: t.textMuted }}
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 transition-colors duration-300" style={{ color: t.text }}>
            Мероприятия
          </h1>
          <p className="text-sm transition-colors duration-300" style={{ color: t.textMuted }}>
            Грантовые конкурсы и программы, куда можно подать заявку
          </p>
        </div>

        {/* Search + filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
            <input
              type="text"
              placeholder="Поиск по названию или организатору..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors duration-300"
              style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  category === cat
                    ? { background: t.tagActiveBg, color: t.tagActiveText }
                    : { background: t.tagBg, color: t.tagText }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events list */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl border border-dashed p-14 text-center"
            style={{ borderColor: t.emptyBorder }}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CalendarSearch" size={24} className="text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: t.text }}>
              {events.length === 0 ? 'Мероприятий пока нет' : 'Ничего не найдено'}
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: t.textMuted }}>
              {events.length === 0
                ? 'Скоро здесь появятся грантовые конкурсы и программы'
                : 'Попробуйте изменить фильтры или поисковый запрос'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ev => {
              const st = STATUS_MAP[ev.status] || STATUS_MAP.open
              const statusClass = dark ? st.darkColor : st.lightColor
              const days = daysLeft(ev.deadline)
              const daysUrgent = ev.deadline && !['Срок истёк'].includes(days || '') &&
                Math.ceil((new Date(ev.deadline).getTime() - Date.now()) / 86400000) <= 7

              return (
                <div
                  key={ev.id}
                  className="rounded-2xl border p-5 transition-all duration-200"
                  style={{ background: t.cardBg, borderColor: t.cardBorder }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon name="Award" size={17} className="text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base leading-snug mb-1" style={{ color: t.text }}>
                          {ev.title}
                        </h3>
                        {ev.organizer && (
                          <p className="text-xs" style={{ color: t.textMuted }}>{ev.organizer}</p>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${statusClass}`}>
                      {st.label}
                    </span>
                  </div>

                  {ev.description && (
                    <p className="text-sm leading-relaxed mb-4 line-clamp-3" style={{ color: t.textMuted }}>
                      {ev.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs mb-4">
                    {ev.grant_amount && (
                      <div className="flex items-center gap-1.5" style={{ color: t.textMuted }}>
                        <Icon name="Banknote" size={13} />
                        <span>{ev.grant_amount}</span>
                      </div>
                    )}
                    {ev.deadline && (
                      <div className="flex items-center gap-1.5" style={{ color: daysUrgent ? '#f59e0b' : t.textMuted }}>
                        <Icon name="Clock" size={13} />
                        <span>Дедлайн: {new Date(ev.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        {days && <span className="font-medium">· {days}</span>}
                      </div>
                    )}
                    {ev.geography && (
                      <div className="flex items-center gap-1.5" style={{ color: t.textMuted }}>
                        <Icon name="MapPin" size={13} />
                        <span>{ev.geography}</span>
                      </div>
                    )}
                    {ev.category && ev.category !== 'Все' && (
                      <div className="flex items-center gap-1.5" style={{ color: t.textMuted }}>
                        <Icon name="Tag" size={13} />
                        <span>{ev.category}</span>
                      </div>
                    )}
                  </div>

                  {ev.target_audience && (
                    <p className="text-xs mb-4" style={{ color: t.textMuted }}>
                      <span className="font-medium" style={{ color: t.text }}>Кому: </span>
                      {ev.target_audience}
                    </p>
                  )}

                  {ev.application_url && ev.status !== 'closed' && (
                    <a
                      href={ev.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2 text-white text-sm font-semibold transition-all"
                    >
                      <Icon name="ExternalLink" size={14} />
                      Подать заявку
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
