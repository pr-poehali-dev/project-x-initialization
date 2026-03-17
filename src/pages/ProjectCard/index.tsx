import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '@/components/ui/icon'
import { apiGetProject, apiUpdateProject } from '@/lib/api'
import type { FullProject } from '@/lib/api'
import { emptyProject } from './types'
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

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: 'text-white/40 bg-white/5' },
  review: { label: 'На проверке', color: 'text-amber-400 bg-amber-500/10' },
  submitted: { label: 'Подана', color: 'text-blue-400 bg-blue-500/10' },
  won: { label: 'Победа!', color: 'text-green-400 bg-green-500/10' },
}

function validate(data: Partial<FullProject>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!data.title?.trim()) errors.title = 'Название обязательно'
  return errors
}

export default function ProjectCard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<FullProject | null>(null)
  const [draft, setDraft] = useState<FullProject | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState('general')

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-white/50 text-sm">Загрузка...</div>
      </div>
    )
  }

  const status = STATUS_LABEL[project.status] || STATUS_LABEL.draft
  const current = editing ? draft : project

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <header className="border-b border-white/5 px-4 sm:px-6 py-4 sticky top-0 z-20" style={{ background: '#0a0f1e' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
            >
              <Icon name="ArrowLeft" size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-white font-semibold text-sm sm:text-base truncate max-w-xs sm:max-w-sm">
                  {project.title}
                </h1>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-lg flex-shrink-0 ${status.color}`}>
                  {status.label}
                </span>
              </div>
              {project.grant_fund && (
                <p className="text-white/30 text-xs mt-0.5 truncate">{project.grant_fund}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!editing ? (
              <button
                onClick={startEdit}
                className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 sm:px-4 py-2 text-white text-sm font-medium transition-all"
              >
                <Icon name="Pencil" size={14} />
                <span className="hidden sm:inline">Редактировать</span>
              </button>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 sm:px-4 py-2 text-white/70 text-sm font-medium transition-all"
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
      <div className="border-b border-white/5 overflow-x-auto" style={{ background: '#0a0f1e' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 min-w-max">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-white/40 hover:text-white/70'
                }`}
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
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-amber-400 text-sm">
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
          />
        )}
        {activeTab === 'about' && (
          <TabAbout
            data={current}
            editing={editing}
            errors={errors}
            onChange={(f, v) => updateField(f, v)}
          />
        )}
        {activeTab === 'team' && (
          <TabTeam
            team={current.team}
            editing={editing}
            onChange={team => updateField('team', team)}
          />
        )}
        {activeTab === 'results' && (
          <TabResults
            data={current}
            editing={editing}
            onChange={(f, v) => updateField(f, v)}
          />
        )}
        {activeTab === 'calendar' && (
          <TabCalendar
            tasks={current.tasks}
            editing={editing}
            onChange={tasks => updateField('tasks', tasks)}
          />
        )}
        {activeTab === 'media' && (
          <TabMedia
            media={current.media}
            editing={editing}
            onChange={media => updateField('media', media)}
          />
        )}
        {activeTab === 'expenses' && (
          <TabExpenses
            expenses={current.expenses}
            editing={editing}
            onChange={expenses => updateField('expenses', expenses)}
          />
        )}
      </main>
    </div>
  )
}
