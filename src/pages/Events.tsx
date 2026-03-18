import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  apiGetMe, apiGetEvents, removeToken,
  apiGetMyProjectsForSubmission, apiCheckMySubmission, apiSubmitProjectToEvent,
} from '@/lib/api'
import type { GrantEvent, MyProjectForSubmission } from '@/lib/api'
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

interface SubmitModalProps {
  event: GrantEvent
  dark: boolean
  onClose: () => void
  onSuccess: () => void
}

function SubmitProjectModal({ event, dark, onClose, onSuccess }: SubmitModalProps) {
  const [projects, setProjects] = useState<MyProjectForSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const t = {
    overlay:    'rgba(0,0,0,0.6)',
    modalBg:    dark ? '#111827'                : '#ffffff',
    border:     dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
    text:       dark ? '#ffffff'                : '#111827',
    textMuted:  dark ? 'rgba(255,255,255,0.4)'  : '#6b7280',
    cardBg:     dark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
    cardBorder: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    selBorder:  dark ? '#6366f1'                : '#6366f1',
    selBg:      dark ? 'rgba(99,102,241,0.08)'  : 'rgba(99,102,241,0.05)',
  }

  useEffect(() => {
    apiGetMyProjectsForSubmission()
      .then(p => { setProjects(p); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [])

  async function handleSubmit() {
    if (!selected) { toast.error('Выберите проект'); return }
    setSubmitting(true)
    try {
      await apiSubmitProjectToEvent(event.id, selected)
      toast.success('Проект подан на мероприятие!')
      onSuccess()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка подачи')
    } finally {
      setSubmitting(false)
    }
  }

  const alreadySubmittedToThis = projects.filter(p => p.submitted_to_events.includes(event.id))
  const available = projects.filter(p => p.is_complete && !p.submitted_to_events.includes(event.id) && p.status !== 'review')
  const incomplete = projects.filter(p => !p.is_complete)
  const alreadyReview = projects.filter(p => p.is_complete && p.status === 'review' && !p.submitted_to_events.includes(event.id))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: t.overlay }}>
      <div className="w-full max-w-lg rounded-2xl border shadow-2xl" style={{ background: t.modalBg, borderColor: t.border }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: t.border }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: t.text }}>Подать проект</h2>
            <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: t.textMuted }}>{event.title}</p>
          </div>
          <button onClick={onClose} className="hover:opacity-70 transition-opacity" style={{ color: t.textMuted }}>
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-sm" style={{ color: t.textMuted }}>Загрузка проектов...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FolderOpen" size={32} className="mx-auto mb-3 text-indigo-400" />
              <p className="text-sm font-medium mb-1" style={{ color: t.text }}>У вас нет проектов</p>
              <p className="text-xs" style={{ color: t.textMuted }}>Создайте проект и заполните все поля</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alreadySubmittedToThis.length > 0 && (
                <div className="rounded-xl p-4 text-sm bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-400 font-medium mb-1">
                    <Icon name="CheckCircle2" size={15} />
                    Уже подан
                  </div>
                  {alreadySubmittedToThis.map(p => (
                    <div key={p.id} className="text-xs" style={{ color: t.textMuted }}>{p.title}</div>
                  ))}
                </div>
              )}

              {available.length > 0 && (
                <>
                  <p className="text-xs font-medium mb-2" style={{ color: t.textMuted }}>Готовые к подаче</p>
                  {available.map(p => (
                    <div key={p.id}
                      onClick={() => setSelected(p.id)}
                      className="rounded-xl border p-3 cursor-pointer transition-all"
                      style={{
                        background: selected === p.id ? t.selBg : t.cardBg,
                        borderColor: selected === p.id ? t.selBorder : t.cardBorder,
                      }}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected === p.id ? 'border-indigo-500' : ''}`}
                          style={{ borderColor: selected === p.id ? '#6366f1' : t.textMuted }}>
                          {selected === p.id && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                        </div>
                        <span className="text-sm font-medium" style={{ color: t.text }}>{p.title}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-lg text-green-400 bg-green-500/10">Готов</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {alreadyReview.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2" style={{ color: t.textMuted }}>На экспертизе (недоступны)</p>
                  {alreadyReview.map(p => (
                    <div key={p.id} className="rounded-xl border p-3 opacity-50 cursor-not-allowed"
                      style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: t.text }}>{p.title}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-lg text-amber-400 bg-amber-500/10">На проверке</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {incomplete.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium mb-2" style={{ color: t.textMuted }}>Незаполненные проекты</p>
                  {incomplete.map(p => (
                    <div key={p.id} className="rounded-xl border p-3 opacity-50 cursor-not-allowed"
                      style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: t.text }}>{p.title}</span>
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-lg" style={{ color: t.textMuted, background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
                          Не готов
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {available.length === 0 && alreadySubmittedToThis.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm" style={{ color: t.textMuted }}>
                    Нет проектов, готовых к подаче. Заполните все обязательные поля в проекте и сохраните его.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {available.length > 0 && (
          <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: t.border }}>
            <button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 py-2.5 text-white text-sm font-semibold transition-all disabled:opacity-50">
              {submitting ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Send" size={14} />}
              {submitting ? 'Подаём...' : 'Подать проект'}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm transition-all hover:opacity-70"
              style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: t.textMuted }}>
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Events() {
  const [events, setEvents] = useState<GrantEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Все')
  const [search, setSearch] = useState('')
  const [submittedEventIds, setSubmittedEventIds] = useState<Set<number>>(new Set())
  const [submitModal, setSubmitModal] = useState<GrantEvent | null>(null)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const t = {
    bg:           dark ? '#0a0f1e'                 : '#f5f7fa',
    headerBg:     dark ? 'rgba(255,255,255,0.02)'  : 'rgba(255,255,255,0.9)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.08)',
    cardBg:       dark ? 'rgba(255,255,255,0.03)'  : '#ffffff',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.07)',
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
  }

  useEffect(() => {
    Promise.all([apiGetMe(), apiGetEvents({ status: 'all' }).catch(() => [])]).then(([u, ev]) => {
      if (!u) { navigate('/'); return }
      const evList = ev as GrantEvent[]
      setEvents(evList)
      setLoading(false)
      const ourEvents = evList.filter(e => e.is_our_event && e.status === 'open')
      if (ourEvents.length > 0) {
        Promise.all(ourEvents.map(e => apiCheckMySubmission(e.id).catch(() => ({ submitted: false }))))
          .then(results => {
            const submitted = new Set<number>()
            results.forEach((r, i) => { if (r.submitted) submitted.add(ourEvents[i].id) })
            setSubmittedEventIds(submitted)
          })
      }
    })
  }, [navigate])

  function handleLogout() {
    removeToken()
    navigate('/')
  }

  function handleSubmitSuccess() {
    setSubmitModal(null)
    if (submitModal) {
      setSubmittedEventIds(prev => new Set([...prev, submitModal.id]))
    }
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
      {submitModal && (
        <SubmitProjectModal
          event={submitModal}
          dark={dark}
          onClose={() => setSubmitModal(null)}
          onSuccess={handleSubmitSuccess}
        />
      )}

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
          <div className="rounded-2xl border border-dashed p-14 text-center" style={{ borderColor: t.emptyBorder }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-600/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="SearchX" size={24} className="text-purple-400" />
            </div>
            <p className="font-medium mb-1" style={{ color: t.text }}>Ничего не найдено</p>
            <p className="text-sm" style={{ color: t.textMuted }}>
              {events.length === 0 ? 'Мероприятий пока нет' : 'Попробуйте изменить фильтры или поисковый запрос'}
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
              const isOur = ev.is_our_event
              const alreadySubmitted = submittedEventIds.has(ev.id)

              return (
                <div
                  key={ev.id}
                  className="rounded-2xl border p-5 transition-all duration-200"
                  style={{ background: t.cardBg, borderColor: isOur ? 'rgba(99,102,241,0.25)' : t.cardBorder }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 mt-0.5 ${isOur ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                        <Icon name={isOur ? 'Star' : 'Award'} size={17} className={isOur ? 'text-indigo-400' : 'text-purple-400'} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <h3 className="font-semibold text-sm sm:text-base leading-snug" style={{ color: t.text }}>
                            {ev.title}
                          </h3>
                          {isOur && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-lg text-indigo-400 bg-indigo-500/10 flex-shrink-0">
                              Наше мероприятие
                            </span>
                          )}
                        </div>
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

                  {ev.status !== 'closed' && (
                    <div className="flex flex-wrap gap-2">
                      {ev.application_url && (
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

                      {isOur && (
                        alreadySubmitted ? (
                          <div className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-green-400 bg-green-500/10 border border-green-500/20">
                            <Icon name="CheckCircle2" size={14} />
                            Проект подан
                          </div>
                        ) : (
                          <button
                            onClick={() => setSubmitModal(ev)}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-white text-sm font-semibold transition-all"
                          >
                            <Icon name="Send" size={14} />
                            Подать проект
                          </button>
                        )
                      )}
                    </div>
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
