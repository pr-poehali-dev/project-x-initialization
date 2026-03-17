import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '@/components/ui/icon'
import { apiGetProject, apiUpdateProject } from '@/lib/api'
import type { FullProject } from '@/lib/api'
import { emptyProject } from './types'
import { useTheme } from '@/hooks/useTheme'
import TabGeneral from './TabGeneral'
import TabAbout from './TabAbout'
import TabTeam from './TabTeam'
import TabResults from './TabResults'
import TabCalendar from './TabCalendar'
import TabMedia from './TabMedia'
import TabExpenses from './TabExpenses'

const TABS = [
  { id: 'general', label: 'Общее', icon: 'Settings2' },
  { id: 'about', label: 'О проекте', icon: 'FileText' },
  { id: 'team', label: 'Команда', icon: 'Users' },
  { id: 'results', label: 'Результаты', icon: 'BarChart2' },
  { id: 'calendar', label: 'Календарный план', icon: 'CalendarDays' },
  { id: 'media', label: 'Медиа', icon: 'Megaphone' },
  { id: 'expenses', label: 'Расходы', icon: 'Wallet' },
]

const STATUS_LABEL: Record<string, { label: string; darkColor: string; lightColor: string }> = {
  draft: { label: 'Черновик', darkColor: 'text-white/40 bg-white/5', lightColor: 'text-gray-400 bg-gray-100' },
  review: { label: 'На проверке', darkColor: 'text-amber-400 bg-amber-500/10', lightColor: 'text-amber-600 bg-amber-50' },
  submitted: { label: 'Подана', darkColor: 'text-blue-400 bg-blue-500/10', lightColor: 'text-blue-600 bg-blue-50' },
  won: { label: 'Победа!', darkColor: 'text-green-400 bg-green-500/10', lightColor: 'text-green-600 bg-green-50' },
}

function validate(data: Partial<FullProject>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.title?.trim()) errors.title = 'Название обязательно'
  return errors
}

export default function ProjectCard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const [project, setProject] = useState<FullProject | null>(null)
  const [draft, setDraft] = useState<FullProject | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('general')

  const t = {
    bg:         dark ? '#0a0f1e'                   : '#f5f7fa',
    headerBg:   dark ? '#0a0f1e'                   : 'rgba(255,255,255,0.95)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)'  : '#e5e7eb',
    tabsBorder: dark ? 'rgba(255,255,255,0.05)'    : '#e5e7eb',
    tabsActive: dark ? 'text-green-400'            : 'text-green-600',
    tabInactive: dark ? 'rgba(255,255,255,0.4)'    : '#6b7280',
    text:       dark ? '#ffffff'                   : '#111827',
    textMuted:  dark ? 'rgba(255,255,255,0.4)'     : '#6b7280',
    editBtn:    dark ? 'rgba(255,255,255,0.05)'    : '#f3f4f6',
    editBtnBorder: dark ? 'rgba(255,255,255,0.1)'  : '#d1d5db',
    editBtnText: dark ? '#ffffff'                  : '#374151',
    backBtn:    dark ? 'rgba(255,255,255,0.4)'     : '#9ca3af',
    statusDraft: dark ? 'text-white/40 bg-white/5' : 'text-gray-400 bg-gray-100',
    noticeBg:   dark ? 'rgba(245,158,11,0.05)'     : 'rgba(245,158,11,0.08)',
    noticeBorder: dark ? 'rgba(245,158,11,0.2)'    : 'rgba(245,158,11,0.3)',
  }

  useEffect(() => {
    if (!id) return
    apiGetProject(Number(id))
      .then(p => { setProject(p); setDraft(p); setLoading(false) })
      .catch(() => { navigate('/dashboard') })
  }, [id, navigate])

  function startEdit() {
    setDraft(project ? { ...project } : null)
    setErrors({})
    setEditing(true)
  }

  function cancelEdit() {
    setDraft(project)
    setErrors({})
    setEditing(false)
  }

  async function save() {
    if (!draft || !id) return
    const errs = validate(draft)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      if (errs.title) setActiveTab('general')
      toast.error('Заполните обязательные поля')
      return
    }
    setSaving(true)
    try {
      const updated = await apiUpdateProject(Number(id), draft)
      setProject(updated)
      setDraft(updated)
      setEditing(false)
      setErrors({})
      toast.success('Проект сохранён')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  function updateField(field: keyof FullProject, value: unknown) {
    setDraft(prev => prev ? { ...prev, [field]: value } : prev)
  }

  if (loading || !project || !draft) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-300" style={{ background: t.bg }}>
        <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
      </div>
    )
  }

  const status = STATUS_LABEL[project.status] || STATUS_LABEL.draft
  const statusColor = dark ? status.darkColor : status.lightColor
  const current = editing ? draft : project

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Header */}
      <header
        className="px-4 sm:px-6 py-4 sticky top-0 z-20 transition-colors duration-300"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}` }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:opacity-70 transition-opacity flex-shrink-0"
              style={{ color: t.backBtn }}
            >
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-semibold text-sm sm:text-base truncate max-w-xs sm:max-w-sm" style={{ color: t.text }}>
                  {project.title}
                </h1>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 ${statusColor}`}>
                  {status.label}
                </span>
              </div>
              {project.grant_fund && (
                <p className="text-xs mt-0.5 truncate" style={{ color: t.textMuted }}>{project.grant_fund}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!editing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
                style={{ background: t.editBtn, border: `1px solid ${t.editBtnBorder}`, color: t.editBtnText }}
              >
                <Icon name="Pencil" size={14} />
                <span className="hidden sm:inline">Редактировать</span>
              </button>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
                  style={{ background: t.editBtn, border: `1px solid ${t.editBtnBorder}`, color: t.textMuted }}
                >
                  <Icon name="X" size={14} />
                  <span className="hidden sm:inline">Отмена</span>
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-3 sm:px-4 py-2 text-white text-sm font-semibold transition-all disabled:opacity-50"
                >
                  {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                  <span className="hidden sm:inline">{saving ? 'Сохранение...' : 'Сохранить'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div
        className="overflow-x-auto transition-colors duration-300"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.tabsBorder}` }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-green-500 ${dark ? 'text-green-400' : 'text-green-600'}`
                    : 'border-transparent'
                }`}
                style={activeTab !== tab.id ? { color: t.tabInactive } : {}}
              >
                <Icon name={tab.icon} size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {editing && (
          <div
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-amber-400 text-sm"
            style={{ border: `1px solid ${t.noticeBorder}`, background: t.noticeBg }}
          >
            <Icon name="Pencil" size={14} />
            Режим редактирования — внесите изменения и нажмите «Сохранить»
          </div>
        )}

        {activeTab === 'general' && (
          <TabGeneral
            data={current}
            editing={editing}
            errors={errors}
            onChange={(f, v) => updateField(f, v)}
            dark={dark}
          />
        )}
        {activeTab === 'about' && (
          <TabAbout
            data={current}
            editing={editing}
            errors={errors}
            onChange={(f, v) => updateField(f, v)}
            dark={dark}
          />
        )}
        {activeTab === 'team' && (
          <TabTeam
            team={current.team}
            editing={editing}
            onChange={team => updateField('team', team)}
            dark={dark}
          />
        )}
        {activeTab === 'results' && (
          <TabResults
            data={current}
            editing={editing}
            onChange={(f, v) => updateField(f, v)}
            dark={dark}
          />
        )}
        {activeTab === 'calendar' && (
          <TabCalendar
            tasks={current.tasks}
            editing={editing}
            onChange={tasks => updateField('tasks', tasks)}
            dark={dark}
          />
        )}
        {activeTab === 'media' && (
          <TabMedia
            media={current.media}
            editing={editing}
            onChange={media => updateField('media', media)}
            dark={dark}
          />
        )}
        {activeTab === 'expenses' && (
          <TabExpenses
            expenses={current.expenses}
            editing={editing}
            onChange={expenses => updateField('expenses', expenses)}
            dark={dark}
          />
        )}
      </main>
    </div>
  )
}