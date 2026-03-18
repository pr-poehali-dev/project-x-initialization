import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  apiGetMe, apiGetEvents, apiCreateEvent, apiUpdateEvent, apiDeleteEvent,
  apiGetEventSubmissions, apiLaunchExpertise,
} from '@/lib/api'
import type { GrantEvent, EventSubmission } from '@/lib/api'
import Icon from '@/components/ui/icon'
import { useTheme } from '@/hooks/useTheme'

const CATEGORIES = ['Молодёжь', 'Культура', 'Наука', 'Образование', 'Спорт', 'Социальный', 'Экология', 'Другое']
const STATUSES = [
  { value: 'open',   label: 'Приём заявок' },
  { value: 'soon',   label: 'Скоро' },
  { value: 'closed', label: 'Завершён' },
]

const EMPTY: Partial<GrantEvent> = {
  title: '', organizer: '', description: '', deadline: '',
  start_date: '', end_date: '', grant_amount: '', category: 'Социальный',
  geography: '', target_audience: '', application_url: '', status: 'open',
  is_our_event: false,
}

type AdminTab = 'events' | 'submissions'

export default function AdminEvents() {
  const [adminTab, setAdminTab] = useState<AdminTab>('events')
  const [events, setEvents] = useState<GrantEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<GrantEvent>>(EMPTY)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [submissions, setSubmissions] = useState<EventSubmission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [launchingExpert, setLaunchingExpert] = useState(false)

  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const t = {
    bg:           dark ? '#0a0f1e'                : '#f5f7fa',
    headerBg:     dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    cardBg:       dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    text:         dark ? '#ffffff'                : '#111827',
    textMuted:    dark ? 'rgba(255,255,255,0.4)'  : '#6b7280',
    inputBg:      dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    inputBorder:  dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.12)',
    toggleBg:     dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    toggleColor:  dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
    tabBorder:    dark ? 'rgba(255,255,255,0.06)'  : '#e5e7eb',
  }

  useEffect(() => {
    apiGetMe().then(u => {
      if (!u) { navigate('/'); return }
      if (!u.is_admin) { navigate('/dashboard'); return }
      loadEvents()
    })
  }, [navigate])

  function loadEvents() {
    apiGetEvents({ status: 'all' }).then(ev => {
      setEvents(ev)
      setLoading(false)
      if (ev.length > 0 && !selectedEventId) {
        const ourEvent = ev.find(e => e.is_our_event)
        if (ourEvent) setSelectedEventId(ourEvent.id)
        else setSelectedEventId(ev[0].id)
      }
    }).catch(() => setLoading(false))
  }

  useEffect(() => {
    if (adminTab === 'submissions' && selectedEventId) {
      loadSubmissions(selectedEventId)
    }
  }, [adminTab, selectedEventId])

  function loadSubmissions(eventId: number) {
    setSubmissionsLoading(true)
    apiGetEventSubmissions(eventId)
      .then(s => { setSubmissions(s); setSubmissionsLoading(false) })
      .catch(() => { setSubmissions([]); setSubmissionsLoading(false) })
  }

  function openNew() {
    setForm(EMPTY)
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(ev: GrantEvent) {
    setForm({ ...ev })
    setEditId(ev.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeForm() {
    setShowForm(false)
    setForm(EMPTY)
    setEditId(null)
  }

  async function handleSave() {
    if (!form.title?.trim()) { toast.error('Введите название'); return }
    setSaving(true)
    try {
      if (editId) {
        await apiUpdateEvent(editId, form)
        toast.success('Мероприятие обновлено')
      } else {
        await apiCreateEvent(form)
        toast.success('Мероприятие добавлено')
      }
      closeForm()
      loadEvents()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить мероприятие?')) return
    try {
      await apiDeleteEvent(id)
      toast.success('Удалено')
      loadEvents()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  async function handleLaunchExpert() {
    if (!selectedEventId) return
    const pending = submissions.filter(s => !s.expert_launched)
    if (pending.length === 0) { toast.error('Нет проектов для запуска экспертизы'); return }
    if (!confirm(`Запустить экспертизу для ${pending.length} проектов? Эксперты будут назначены случайным образом.`)) return
    setLaunchingExpert(true)
    try {
      const res = await apiLaunchExpertise(selectedEventId)
      toast.success(`Экспертиза запущена для ${res.assigned} проектов`)
      loadSubmissions(selectedEventId)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка запуска')
    } finally {
      setLaunchingExpert(false)
    }
  }

  function field(key: keyof GrantEvent, label: string, opts?: { type?: string; required?: boolean; textarea?: boolean; half?: boolean }) {
    const val = (form[key] as string) || ''
    const cls = `w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all`
    const style = { background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }
    return (
      <div className={opts?.half ? '' : 'col-span-2 sm:col-span-1'}>
        <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>
          {label}{opts?.required && ' *'}
        </label>
        {opts?.textarea ? (
          <textarea rows={3} value={val} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className={cls + ' resize-none'} style={style} />
        ) : (
          <input type={opts?.type || 'text'} value={val}
            onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
            className={cls} style={style} />
        )}
      </div>
    )
  }

  const ourEvents = events.filter(e => e.is_our_event)
  const pendingSubmissions = submissions.filter(s => !s.expert_launched)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
      <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
    </div>
  )

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Header */}
      <header className="px-6 py-4 sticky top-0 z-20 transition-colors duration-300"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="hover:opacity-70 transition-opacity" style={{ color: t.textMuted }}>
              <Icon name="ArrowLeft" size={18} />
            </button>
            <h1 className="font-semibold" style={{ color: t.text }}>Управление мероприятиями</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="px-3 py-2 rounded-xl text-sm transition-all"
              style={{ background: t.toggleBg, color: t.toggleColor }}>
              <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
            </button>
            {adminTab === 'events' && (
              <button onClick={openNew}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-2 text-white text-sm font-semibold transition-all">
                <Icon name="Plus" size={15} />
                Добавить
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b" style={{ background: t.headerBg, borderColor: t.tabBorder }}>
        <div className="max-w-5xl mx-auto px-6 flex gap-1">
          {[
            { id: 'events' as AdminTab, label: 'Мероприятия', icon: 'Calendar' },
            { id: 'submissions' as AdminTab, label: 'Поданные проекты', icon: 'FolderOpen', badge: ourEvents.length },
          ].map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                adminTab === tab.id
                  ? 'border-green-500 text-green-500'
                  : 'border-transparent hover:opacity-70'
              }`}
              style={{ color: adminTab === tab.id ? undefined : t.textMuted }}>
              <Icon name={tab.icon} size={15} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Вкладка: Мероприятия ── */}
        {adminTab === 'events' && (
          <>
            {showForm && (
              <div className="rounded-2xl border p-6 mb-8" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold" style={{ color: t.text }}>
                    {editId ? 'Редактировать мероприятие' : 'Новое мероприятие'}
                  </h2>
                  <button onClick={closeForm} className="hover:opacity-70" style={{ color: t.textMuted }}>
                    <Icon name="X" size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Название *</label>
                    <input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="Например: Президентские гранты 2026"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
                  </div>

                  {field('organizer', 'Организатор')}
                  {field('grant_amount', 'Размер гранта', { half: true })}

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Описание</label>
                    <textarea rows={3} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Краткое описание конкурса..."
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none transition-all"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }} />
                  </div>

                  {field('target_audience', 'Целевая аудитория')}
                  {field('geography', 'География')}
                  {field('application_url', 'Ссылка для подачи заявки')}

                  {field('deadline', 'Дедлайн подачи', { type: 'date' })}
                  {field('start_date', 'Дата начала проекта', { type: 'date' })}
                  {field('end_date', 'Дата окончания проекта', { type: 'date' })}

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Категория</label>
                    <select value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Статус</label>
                    <select value={form.status || 'open'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
                      style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>

                  {/* Наше мероприятие */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => setForm(f => ({ ...f, is_our_event: !f.is_our_event }))}
                        className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${form.is_our_event ? 'bg-green-500' : ''}`}
                        style={{ background: form.is_our_event ? undefined : t.inputBorder }}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_our_event ? 'translate-x-5' : ''}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: t.text }}>Наше мероприятие</div>
                        <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                          Участники смогут подавать проекты прямо в системе, а вы — запускать экспертизу
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-2.5 text-white text-sm font-semibold transition-all disabled:opacity-50">
                    {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                    {saving ? 'Сохранение...' : (editId ? 'Сохранить' : 'Добавить')}
                  </button>
                  <button onClick={closeForm} className="px-6 py-2.5 rounded-xl text-sm transition-all hover:opacity-70"
                    style={{ background: t.toggleBg, color: t.textMuted }}>
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-14 text-center"
                style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Icon name="CalendarPlus" size={32} className="text-green-400 mx-auto mb-3" />
                <p className="font-medium mb-1" style={{ color: t.text }}>Мероприятий пока нет</p>
                <p className="text-sm mb-4" style={{ color: t.textMuted }}>Добавьте первое грантовое мероприятие</p>
                <button onClick={openNew}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-white text-sm font-semibold transition-all">
                  <Icon name="Plus" size={15} />Добавить мероприятие
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm mb-4" style={{ color: t.textMuted }}>{events.length} мероприятий</p>
                {events.map(ev => {
                  const st = STATUSES.find(s => s.value === ev.status) || STATUSES[0]
                  const stColor = ev.status === 'open' ? 'text-green-400 bg-green-500/10'
                    : ev.status === 'soon' ? 'text-amber-400 bg-amber-500/10'
                    : 'text-gray-400 bg-gray-500/10'
                  return (
                    <div key={ev.id} className="flex items-center gap-4 rounded-xl border p-4 transition-all"
                      style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate" style={{ color: t.text }}>{ev.title}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 ${stColor}`}>{st.label}</span>
                          {ev.is_our_event && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 text-violet-400 bg-violet-500/10">
                              Наше
                            </span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                          {ev.organizer && `${ev.organizer} · `}
                          {ev.category && `${ev.category} · `}
                          {ev.deadline && `до ${new Date(ev.deadline).toLocaleDateString('ru-RU')}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => openEdit(ev)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-all"
                          style={{ background: t.toggleBg, color: t.textMuted }}>
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button onClick={() => handleDelete(ev.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-70 transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── Вкладка: Поданные проекты ── */}
        {adminTab === 'submissions' && (
          <>
            {/* Выбор мероприятия */}
            {ourEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-14 text-center"
                style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Icon name="FolderOpen" size={32} className="text-violet-400 mx-auto mb-3" />
                <p className="font-medium mb-1" style={{ color: t.text }}>Нет наших мероприятий</p>
                <p className="text-sm" style={{ color: t.textMuted }}>
                  Создайте мероприятие с отметкой «Наше» — тогда участники смогут подавать проекты
                </p>
              </div>
            ) : (
              <>
                {/* Переключатель мероприятий */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {ourEvents.map(ev => (
                    <button key={ev.id}
                      onClick={() => { setSelectedEventId(ev.id); loadSubmissions(ev.id) }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        selectedEventId === ev.id ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'hover:opacity-70'
                      }`}
                      style={selectedEventId !== ev.id ? { background: t.cardBg, borderColor: t.cardBorder, color: t.textMuted } : {}}>
                      {ev.title}
                    </button>
                  ))}
                </div>

                {submissionsLoading ? (
                  <div className="text-center py-10 text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
                ) : submissions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-14 text-center"
                    style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <Icon name="Inbox" size={32} className="text-violet-400 mx-auto mb-3" />
                    <p className="font-medium mb-1" style={{ color: t.text }}>Проектов пока нет</p>
                    <p className="text-sm" style={{ color: t.textMuted }}>Участники ещё не подали проекты на это мероприятие</p>
                  </div>
                ) : (
                  <>
                    {/* Шапка с кнопкой запуска */}
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm" style={{ color: t.textMuted }}>
                        {submissions.length} проектов · {pendingSubmissions.length} ожидают экспертизы
                      </p>
                      {pendingSubmissions.length > 0 && (
                        <button
                          onClick={handleLaunchExpert}
                          disabled={launchingExpert}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-5 py-2.5 text-white text-sm font-semibold transition-all disabled:opacity-50">
                          {launchingExpert
                            ? <Icon name="Loader2" size={14} className="animate-spin" />
                            : <Icon name="Play" size={14} />}
                          {launchingExpert ? 'Запускаю...' : `Запустить экспертизу (${pendingSubmissions.length})`}
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {submissions.map(sub => (
                        <div key={sub.id} className="rounded-xl border p-4 transition-all"
                          style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-sm font-medium" style={{ color: t.text }}>{sub.title}</span>
                                {sub.expert_launched ? (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-lg text-violet-400 bg-violet-500/10">
                                    На экспертизе
                                  </span>
                                ) : (
                                  <span className="text-xs font-medium px-2 py-0.5 rounded-lg text-amber-400 bg-amber-500/10">
                                    Ожидает экспертизы
                                  </span>
                                )}
                              </div>
                              <div className="text-xs mb-1" style={{ color: t.textMuted }}>
                                {sub.user_name}{sub.organization && ` · ${sub.organization}`}
                              </div>
                              {sub.short_description && (
                                <p className="text-xs line-clamp-2" style={{ color: t.textMuted }}>{sub.short_description}</p>
                              )}
                              <div className="flex flex-wrap gap-3 mt-2 text-xs" style={{ color: t.textMuted }}>
                                {sub.budget && <span>Бюджет: {sub.budget}</span>}
                                {sub.geography && <span>🗺 {sub.geography}</span>}
                                <span>Подан: {new Date(sub.submitted_at).toLocaleDateString('ru-RU')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  )
}
