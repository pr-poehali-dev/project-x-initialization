import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  apiGetCoordinatorMe,
  apiGetCoordinatorEvents, apiCreateCoordinatorEvent, apiUpdateCoordinatorEvent, apiDeleteCoordinatorEvent,
  apiGetCoordinatorSubmissions,
  apiGetCoordinatorAppeals, apiUpdateCoordinatorAppeal,
  apiGetProjectBank, apiGetProjectCardForCoordinator,
  removeExpertToken,
} from '@/lib/api'
import Icon from '@/components/ui/icon'
import { useTheme } from '@/hooks/useTheme'

type Tab = 'events' | 'submissions' | 'appeals' | 'bank'

const CATEGORIES = ['Молодёжь', 'Культура', 'Наука', 'Образование', 'Спорт', 'Социальный', 'Экология', 'Другое']
const STATUSES = [{ value: 'open', label: 'Приём заявок' }, { value: 'soon', label: 'Скоро' }, { value: 'closed', label: 'Завершён' }]
const APPEAL_STATUSES = [
  { value: '', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'resolved', label: 'Решённые' },
]

const EMPTY_EVENT = { title: '', organizer: '', description: '', deadline: '', date_start: '', date_end: '', category: 'Социальный', status: 'open' }

export default function CoordinatorDashboard() {
  const [profile, setProfile] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('events')
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const t = {
    bg: dark ? '#0a0f1e' : '#f5f7fa',
    headerBg: dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    cardBg: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    text: dark ? '#ffffff' : '#111827',
    textMuted: dark ? 'rgba(255,255,255,0.4)' : '#6b7280',
    inputBg: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    inputBorder: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)',
    toggleBg: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    toggleColor: dark ? 'rgba(255,255,255,0.5)' : '#6b7280',
    tabBorder: dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb',
  }

  // ── Events state ──────────────────────────────────────────────────────────
  const [events, setEvents] = useState<Record<string, unknown>[]>([])
  const [eventsTotal, setEventsTotal] = useState(0)
  const [eventsPage, setEventsPage] = useState(1)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editEventId, setEditEventId] = useState<number | null>(null)
  const [eventForm, setEventForm] = useState<Record<string, string>>(EMPTY_EVENT)
  const [savingEvent, setSavingEvent] = useState(false)

  // ── Submissions state ─────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<Record<string, unknown>[]>([])
  const [subsTotal, setSubsTotal] = useState(0)
  const [subsPage, setSubsPage] = useState(1)
  const [subsLoading, setSubsLoading] = useState(false)

  // ── Appeals state ─────────────────────────────────────────────────────────
  const [appeals, setAppeals] = useState<Record<string, unknown>[]>([])
  const [appealsTotal, setAppealsTotal] = useState(0)
  const [appealsPage, setAppealsPage] = useState(1)
  const [appealsLoading, setAppealsLoading] = useState(false)
  const [appealStatusFilter, setAppealStatusFilter] = useState('')
  const [appealModal, setAppealModal] = useState<Record<string, unknown> | null>(null)
  const [appealResponse, setAppealResponse] = useState('')
  const [appealNewStatus, setAppealNewStatus] = useState('')

  // ── Bank state ────────────────────────────────────────────────────────────
  const [bank, setBank] = useState<Record<string, unknown>[]>([])
  const [bankTotal, setBankTotal] = useState(0)
  const [bankPage, setBankPage] = useState(1)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankSearch, setBankSearch] = useState('')
  const [viewProject, setViewProject] = useState<Record<string, unknown> | null>(null)
  const [viewProjectLoading, setViewProjectLoading] = useState(false)

  useEffect(() => {
    apiGetCoordinatorMe().then(p => {
      setProfile(p)
      setLoading(false)
    }).catch(() => {
      navigate('/expert')
    })
  }, [navigate])

  const loadEvents = useCallback((page = 1) => {
    setEventsLoading(true)
    apiGetCoordinatorEvents(page).then(d => {
      setEvents(d.items)
      setEventsTotal(d.total)
      setEventsPage(page)
      setEventsLoading(false)
    }).catch(() => setEventsLoading(false))
  }, [])

  const loadSubmissions = useCallback((page = 1) => {
    setSubsLoading(true)
    apiGetCoordinatorSubmissions(page).then(d => {
      setSubmissions(d.items)
      setSubsTotal(d.total)
      setSubsPage(page)
      setSubsLoading(false)
    }).catch(() => setSubsLoading(false))
  }, [])

  const loadAppeals = useCallback((page = 1, status = appealStatusFilter) => {
    setAppealsLoading(true)
    apiGetCoordinatorAppeals(page, status || undefined).then(d => {
      setAppeals(d.items)
      setAppealsTotal(d.total)
      setAppealsPage(page)
      setAppealsLoading(false)
    }).catch(() => setAppealsLoading(false))
  }, [appealStatusFilter])

  const loadBank = useCallback((page = 1, search = bankSearch) => {
    setBankLoading(true)
    apiGetProjectBank(page, search).then(d => {
      setBank(d.items)
      setBankTotal(d.total)
      setBankPage(page)
      setBankLoading(false)
    }).catch(() => setBankLoading(false))
  }, [bankSearch])

  useEffect(() => {
    if (tab === 'events' && events.length === 0) loadEvents()
    if (tab === 'submissions' && submissions.length === 0) loadSubmissions()
    if (tab === 'appeals' && appeals.length === 0) loadAppeals()
    if (tab === 'bank' && bank.length === 0) loadBank()
  }, [tab])

  async function handleSaveEvent() {
    if (!eventForm.title?.trim()) { toast.error('Введите название'); return }
    setSavingEvent(true)
    try {
      if (editEventId) {
        await apiUpdateCoordinatorEvent({ ...eventForm, event_id: editEventId })
        toast.success('Мероприятие обновлено')
      } else {
        await apiCreateCoordinatorEvent(eventForm)
        toast.success('Мероприятие создано')
      }
      setShowEventForm(false)
      setEditEventId(null)
      setEventForm(EMPTY_EVENT)
      loadEvents()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setSavingEvent(false)
    }
  }

  async function handleDeleteEvent(id: number) {
    if (!confirm('Удалить мероприятие?')) return
    try {
      await apiDeleteCoordinatorEvent(id)
      toast.success('Удалено')
      loadEvents()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  async function handleSaveAppeal() {
    if (!appealModal) return
    try {
      await apiUpdateCoordinatorAppeal({
        appeal_id: appealModal.id as number,
        status: appealNewStatus,
        response: appealResponse,
      })
      toast.success('Обращение обновлено')
      setAppealModal(null)
      loadAppeals()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  async function openProjectCard(projectId: number) {
    setViewProjectLoading(true)
    try {
      const data = await apiGetProjectCardForCoordinator(projectId)
      setViewProject(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка загрузки')
    } finally {
      setViewProjectLoading(false)
    }
  }

  function exportProjectTxt(p: Record<string, unknown>) {
    const lines = [
      `ПРОЕКТНАЯ КАРТА`,
      `Название: ${p.title}`,
      `Автор: ${p.author_name} (${p.author_email})`,
      `Город: ${p.author_city}`,
      `Организация: ${p.author_organization}`,
      `Масштаб: ${p.scale}`,
      `Бюджет: ${p.budget} ₽`,
      `Дедлайн: ${p.deadline}`,
      `Грантовый фонд: ${p.grant_fund}`,
      ``,
      `ОПИСАНИЕ:`,
      String(p.description || ''),
      ``,
      `ПРОБЛЕМА:`,
      String(p.problem || ''),
      ``,
      `ЦЕЛЬ:`,
      String(p.goal || ''),
      ``,
      `ЦЕЛЕВАЯ АУДИТОРИЯ:`,
      String(p.target_audience || ''),
      ``,
      `ОПЫТ:`,
      String(p.experience || ''),
      ``,
      `ПЕРСПЕКТИВЫ:`,
      String((p as Record<string, unknown>).prospects as string || ''),
      ``,
      `КОМАНДА:`,
      ...((p.team as Record<string, unknown>[]) || []).map((m: Record<string, unknown>) => `- ${m.name} (${m.role})`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project_${p.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
      <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
    </div>
  )

  const levelLabel = profile?.level_label || ''

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Header */}
      <header className="px-6 py-4 sticky top-0 z-20 transition-colors duration-300"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <Icon name="Compass" size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="font-semibold text-sm" style={{ color: t.text }}>Кабинет координатора</h1>
              <p className="text-xs" style={{ color: t.textMuted }}>
                {profile?.name} · {levelLabel}{profile?.location ? ` · ${profile.location}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="px-3 py-2 rounded-xl text-sm transition-all"
              style={{ background: t.toggleBg, color: t.toggleColor }}>
              <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
            </button>
            <button onClick={() => { removeExpertToken(); navigate('/expert') }}
              className="px-3 py-2 rounded-xl text-sm transition-all hover:opacity-70"
              style={{ background: t.toggleBg, color: t.textMuted }}>
              <Icon name="LogOut" size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b" style={{ background: t.headerBg, borderColor: t.tabBorder }}>
        <div className="max-w-5xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {([
            { id: 'events', label: 'Мероприятия', icon: 'Calendar' },
            { id: 'submissions', label: 'Заявки', icon: 'ClipboardList' },
            { id: 'appeals', label: 'Обращения', icon: 'MessageSquare' },
            { id: 'bank', label: 'Банк проектов', icon: 'Archive' },
          ] as { id: Tab; label: string; icon: string }[]).map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap ${
                tab === item.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent hover:opacity-70'
              }`}
              style={{ color: tab === item.id ? undefined : t.textMuted }}>
              <Icon name={item.icon} size={15} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Мероприятия ── */}
        {tab === 'events' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: t.textMuted }}>{eventsTotal} мероприятий</p>
              <button onClick={() => { setShowEventForm(true); setEditEventId(null); setEventForm(EMPTY_EVENT) }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 text-white text-sm font-semibold transition-all">
                <Icon name="Plus" size={15} />Создать
              </button>
            </div>

            {showEventForm && (
              <div className="rounded-2xl border p-6 mb-6" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold" style={{ color: t.text }}>
                    {editEventId ? 'Редактировать мероприятие' : 'Новое мероприятие'}
                  </h3>
                  <button onClick={() => setShowEventForm(false)} style={{ color: t.textMuted }}>
                    <Icon name="X" size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'title', label: 'Название *', span: 2 },
                    { key: 'organizer', label: 'Организатор' },
                  ].map(f => (
                    <div key={f.key} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>{f.label}</label>
                      <input value={eventForm[f.key] || ''} onChange={e => setEventForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Описание</label>
                    <textarea rows={3} value={eventForm.description || ''} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
                  </div>
                  {[
                    { key: 'deadline', label: 'Дедлайн', type: 'date' },
                    { key: 'date_start', label: 'Дата начала', type: 'date' },
                    { key: 'date_end', label: 'Дата окончания', type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>{f.label}</label>
                      <input type="date" value={eventForm[f.key] || ''} onChange={e => setEventForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Категория</label>
                    <select value={eventForm.category || ''} onChange={e => setEventForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Статус</label>
                    <select value={eventForm.status || 'open'} onChange={e => setEventForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleSaveEvent} disabled={savingEvent}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-white text-sm font-semibold disabled:opacity-50">
                    {savingEvent ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                    {savingEvent ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button onClick={() => setShowEventForm(false)} className="px-6 py-2.5 rounded-xl text-sm hover:opacity-70"
                    style={{ background: t.toggleBg, color: t.textMuted }}>Отмена</button>
                </div>
              </div>
            )}

            {eventsLoading ? (
              <div className="text-center py-10 text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
            ) : events.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-14 text-center"
                style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Icon name="Calendar" size={32} className="text-indigo-400 mx-auto mb-3" />
                <p className="font-medium mb-1" style={{ color: t.text }}>Мероприятий пока нет</p>
                <p className="text-sm" style={{ color: t.textMuted }}>Создайте первое мероприятие для участников</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(ev => (
                  <div key={String(ev.id)} className="flex items-center gap-4 rounded-xl border p-4"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: t.text }}>{String(ev.title)}</p>
                      <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                        {ev.organizer && `${ev.organizer} · `}
                        {ev.deadline ? `Дедлайн: ${new Date(String(ev.deadline)).toLocaleDateString('ru-RU')}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditEventId(ev.id as number)
                        setEventForm({ title: String(ev.title || ''), organizer: String(ev.organizer || ''), description: String(ev.description || ''), deadline: String(ev.deadline || ''), date_start: String(ev.date_start || ''), date_end: String(ev.date_end || ''), category: String(ev.category || 'Социальный'), status: String(ev.status || 'open') })
                        setShowEventForm(true)
                      }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70"
                        style={{ background: t.toggleBg, color: t.textMuted }}>
                        <Icon name="Pencil" size={14} />
                      </button>
                      <button onClick={() => handleDeleteEvent(ev.id as number)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                        <Icon name="Trash2" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {eventsTotal > 20 && (
                  <div className="flex gap-2 pt-2">
                    <button disabled={eventsPage === 1} onClick={() => loadEvents(eventsPage - 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>
                      ← Назад
                    </button>
                    <span className="px-4 py-2 text-sm" style={{ color: t.textMuted }}>
                      {eventsPage} / {Math.ceil(eventsTotal / 20)}
                    </span>
                    <button disabled={eventsPage * 20 >= eventsTotal} onClick={() => loadEvents(eventsPage + 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>
                      Вперёд →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Заявки ── */}
        {tab === 'submissions' && (
          <>
            {subsLoading ? (
              <div className="text-center py-10 text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
            ) : submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-14 text-center"
                style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Icon name="ClipboardList" size={32} className="text-indigo-400 mx-auto mb-3" />
                <p className="font-medium mb-1" style={{ color: t.text }}>Заявок пока нет</p>
                <p className="text-sm" style={{ color: t.textMuted }}>Заявки появятся, когда участники подадут проекты на ваши мероприятия</p>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: t.textMuted }}>{subsTotal} заявок</p>
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: t.cardBorder }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: t.cardBg, borderBottom: `1px solid ${t.cardBorder}` }}>
                        {['ФИО участника', 'Мероприятие', 'Дата подачи', 'Статус'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: t.textMuted }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => (
                        <tr key={String(s.id)} style={{ borderBottom: `1px solid ${t.cardBorder}`, background: t.cardBg }}>
                          <td className="px-4 py-3" style={{ color: t.text }}>{String(s.full_name || '')}</td>
                          <td className="px-4 py-3" style={{ color: t.textMuted }}>{String(s.event_title || '')}</td>
                          <td className="px-4 py-3" style={{ color: t.textMuted }}>
                            {s.submitted_at ? new Date(String(s.submitted_at)).toLocaleDateString('ru-RU') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                              s.status === 'На экспертизе' ? 'text-violet-400 bg-violet-500/10' : 'text-amber-400 bg-amber-500/10'
                            }`}>{String(s.status)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {subsTotal > 20 && (
                  <div className="flex gap-2 pt-4">
                    <button disabled={subsPage === 1} onClick={() => loadSubmissions(subsPage - 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>← Назад</button>
                    <span className="px-4 py-2 text-sm" style={{ color: t.textMuted }}>{subsPage} / {Math.ceil(subsTotal / 20)}</span>
                    <button disabled={subsPage * 20 >= subsTotal} onClick={() => loadSubmissions(subsPage + 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>Вперёд →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Обращения ── */}
        {tab === 'appeals' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              {APPEAL_STATUSES.map(s => (
                <button key={s.value} onClick={() => { setAppealStatusFilter(s.value); loadAppeals(1, s.value) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                    appealStatusFilter === s.value ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' : 'hover:opacity-70'
                  }`}
                  style={appealStatusFilter !== s.value ? { background: t.cardBg, borderColor: t.cardBorder, color: t.textMuted } : {}}>
                  {s.label}
                </button>
              ))}
            </div>
            {appealsLoading ? (
              <div className="text-center py-10 text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
            ) : appeals.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-14 text-center"
                style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Icon name="MessageSquare" size={32} className="text-indigo-400 mx-auto mb-3" />
                <p className="font-medium mb-1" style={{ color: t.text }}>Обращений нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm mb-2" style={{ color: t.textMuted }}>{appealsTotal} обращений</p>
                {appeals.map(a => {
                  const statusColors: Record<string, string> = {
                    new: 'text-blue-400 bg-blue-500/10',
                    in_progress: 'text-amber-400 bg-amber-500/10',
                    resolved: 'text-green-400 bg-green-500/10',
                  }
                  return (
                    <div key={String(a.id)} className="rounded-xl border p-4 cursor-pointer hover:opacity-90 transition-all"
                      style={{ background: t.cardBg, borderColor: t.cardBorder }}
                      onClick={() => { setAppealModal(a); setAppealResponse(String(a.response || '')); setAppealNewStatus(String(a.status)) }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: t.text }}>{String(a.title || 'Без темы')}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${statusColors[String(a.status)] || ''}`}>
                              {String(a.status_label || a.status)}
                            </span>
                          </div>
                          <p className="text-xs mt-1 line-clamp-2" style={{ color: t.textMuted }}>{String(a.message)}</p>
                          <p className="text-xs mt-1" style={{ color: t.textMuted }}>
                            {String(a.user_name)} · {a.created_at ? new Date(String(a.created_at)).toLocaleDateString('ru-RU') : ''}
                          </p>
                        </div>
                        <Icon name="ChevronRight" size={16} style={{ color: t.textMuted, flexShrink: 0, marginTop: 2 }} />
                      </div>
                    </div>
                  )
                })}
                {appealsTotal > 20 && (
                  <div className="flex gap-2 pt-2">
                    <button disabled={appealsPage === 1} onClick={() => loadAppeals(appealsPage - 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>← Назад</button>
                    <span className="px-4 py-2 text-sm" style={{ color: t.textMuted }}>{appealsPage} / {Math.ceil(appealsTotal / 20)}</span>
                    <button disabled={appealsPage * 20 >= appealsTotal} onClick={() => loadAppeals(appealsPage + 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>Вперёд →</button>
                  </div>
                )}
              </div>
            )}

            {/* Appeal modal */}
            {appealModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                <div className="w-full max-w-lg rounded-2xl p-6 shadow-2xl"
                  style={{ background: dark ? '#131929' : '#ffffff', border: `1px solid ${t.cardBorder}` }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold" style={{ color: t.text }}>Обращение</h3>
                    <button onClick={() => setAppealModal(null)} style={{ color: t.textMuted }}>
                      <Icon name="X" size={18} />
                    </button>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs mb-1" style={{ color: t.textMuted }}>От: {String(appealModal.user_name)} ({String(appealModal.user_email)})</p>
                    {appealModal.title && <p className="font-medium text-sm mb-2" style={{ color: t.text }}>{String(appealModal.title)}</p>}
                    <div className="rounded-xl p-3" style={{ background: t.toggleBg }}>
                      <p className="text-sm" style={{ color: t.text }}>{String(appealModal.message)}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Статус</label>
                      <select value={appealNewStatus} onChange={e => setAppealNewStatus(e.target.value)}
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                        style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>
                        <option value="new">Новое</option>
                        <option value="in_progress">В работе</option>
                        <option value="resolved">Решено</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Ответ</label>
                      <textarea rows={4} value={appealResponse} onChange={e => setAppealResponse(e.target.value)}
                        placeholder="Введите ответ на обращение..."
                        className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                        style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={handleSaveAppeal}
                      className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-white text-sm font-semibold">
                      Сохранить
                    </button>
                    <button onClick={() => setAppealModal(null)} className="px-5 py-2.5 rounded-xl text-sm hover:opacity-70"
                      style={{ background: t.toggleBg, color: t.textMuted }}>Отмена</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Банк проектов ── */}
        {tab === 'bank' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
                <input value={bankSearch} onChange={e => setBankSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadBank(1, bankSearch)}
                  placeholder="Поиск по названию или автору..."
                  className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none"
                  style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
              </div>
              <button onClick={() => loadBank(1, bankSearch)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                Найти
              </button>
            </div>
            {bankLoading ? (
              <div className="text-center py-10 text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
            ) : bank.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-14 text-center"
                style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Icon name="Archive" size={32} className="text-indigo-400 mx-auto mb-3" />
                <p className="font-medium mb-1" style={{ color: t.text }}>Банк проектов пуст</p>
                <p className="text-sm" style={{ color: t.textMuted }}>Участники смогут добавлять проекты в банк из своей проектной карты</p>
              </div>
            ) : (
              <>
                <p className="text-sm mb-4" style={{ color: t.textMuted }}>{bankTotal} проектов</p>
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: t.cardBorder }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: t.cardBg, borderBottom: `1px solid ${t.cardBorder}` }}>
                        {['Название проекта', 'Автор', 'Статус экспертизы', 'Дата добавления', ''].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium" style={{ color: t.textMuted }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bank.map(p => (
                        <tr key={String(p.bank_id)} style={{ borderBottom: `1px solid ${t.cardBorder}`, background: t.cardBg }}>
                          <td className="px-4 py-3 font-medium" style={{ color: t.text }}>{String(p.title)}</td>
                          <td className="px-4 py-3" style={{ color: t.textMuted }}>{String(p.author_name || '')}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded-lg text-indigo-400 bg-indigo-500/10">
                              {String(p.expert_status || 'В банке')}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ color: t.textMuted }}>
                            {p.added_at ? new Date(String(p.added_at)).toLocaleDateString('ru-RU') : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => openProjectCard(p.project_id as number)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                              <Icon name="Eye" size={12} />
                              Просмотр карты
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {bankTotal > 20 && (
                  <div className="flex gap-2 pt-4">
                    <button disabled={bankPage === 1} onClick={() => loadBank(bankPage - 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>← Назад</button>
                    <span className="px-4 py-2 text-sm" style={{ color: t.textMuted }}>{bankPage} / {Math.ceil(bankTotal / 20)}</span>
                    <button disabled={bankPage * 20 >= bankTotal} onClick={() => loadBank(bankPage + 1)}
                      className="px-4 py-2 rounded-xl text-sm disabled:opacity-30" style={{ background: t.toggleBg, color: t.textMuted }}>Вперёд →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </main>

      {/* Просмотр проектной карты */}
      {(viewProjectLoading || viewProject) && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-2xl rounded-2xl p-6 shadow-2xl mb-8"
            style={{ background: dark ? '#131929' : '#ffffff', border: `1px solid ${t.cardBorder}` }}>
            {viewProjectLoading ? (
              <div className="text-center py-10 text-sm" style={{ color: t.textMuted }}>Загрузка проектной карты...</div>
            ) : viewProject ? (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-lg" style={{ color: t.text }}>{String(viewProject.title)}</h2>
                    <p className="text-xs mt-1" style={{ color: t.textMuted }}>
                      {String(viewProject.author_name)} · {String(viewProject.author_city || '')} · {String(viewProject.author_organization || '')}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => exportProjectTxt(viewProject)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                      <Icon name="Download" size={13} />
                      Выгрузить
                    </button>
                    <button onClick={() => setViewProject(null)} style={{ color: t.textMuted }}>
                      <Icon name="X" size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {([
                    { label: 'Краткое описание', value: viewProject.description },
                    { label: 'Проблема', value: viewProject.problem },
                    { label: 'Цель', value: viewProject.goal },
                    { label: 'Целевая аудитория', value: viewProject.target_audience },
                    { label: 'Опыт реализации', value: viewProject.experience },
                    { label: 'Перспективы развития', value: viewProject.prospects },
                    { label: 'География', value: viewProject.geography },
                  ] as { label: string; value: unknown }[]).map(f => f.value ? (
                    <div key={f.label}>
                      <p className="text-xs font-medium mb-1" style={{ color: t.textMuted }}>{f.label}</p>
                      <p className="text-sm" style={{ color: t.text }}>{String(f.value)}</p>
                    </div>
                  ) : null)}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: t.textMuted }}>Бюджет</p>
                      <p className="text-sm font-semibold" style={{ color: t.text }}>{Number(viewProject.budget || 0).toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: t.textMuted }}>Масштаб</p>
                      <p className="text-sm" style={{ color: t.text }}>{String(viewProject.scale || '—')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: t.textMuted }}>Грантовый фонд</p>
                      <p className="text-sm" style={{ color: t.text }}>{String(viewProject.grant_fund || '—')}</p>
                    </div>
                  </div>
                  {(viewProject.team as Record<string, unknown>[])?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: t.textMuted }}>Команда</p>
                      <div className="space-y-2">
                        {(viewProject.team as Record<string, unknown>[]).map((m, i) => (
                          <div key={i} className="rounded-lg p-3" style={{ background: t.toggleBg }}>
                            <p className="text-sm font-medium" style={{ color: t.text }}>{String(m.name)}</p>
                            <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{String(m.role)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
