import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '@/components/ui/icon'
import {
  apiGetExpertProject, apiSaveExpertReview, apiCompleteExpertReview, removeExpertToken
} from '@/lib/api'
import type { FullProject, ExpertReview } from '@/lib/api'
import { useTheme } from '@/hooks/useTheme'

const SECTIONS = [
  { id: 'general',  label: 'Общее',             icon: 'Settings2' },
  { id: 'about',    label: 'О проекте',          icon: 'FileText' },
  { id: 'team',     label: 'Команда',            icon: 'Users' },
  { id: 'results',  label: 'Результаты',         icon: 'BarChart2' },
  { id: 'calendar', label: 'Календарный план',   icon: 'CalendarDays' },
  { id: 'media',    label: 'Медиа',              icon: 'Megaphone' },
  { id: 'expenses', label: 'Расходы',            icon: 'Wallet' },
]

function ScoreButton({ score, current, onClick, dark }: { score: number; current: number | null; onClick: (s: number) => void; dark: boolean }) {
  const active = current === score
  const color = score <= 3 ? 'red' : score <= 6 ? 'amber' : 'green'
  const activeStyles: Record<string, string> = {
    red:   'bg-red-500 border-red-500 text-white',
    amber: 'bg-amber-500 border-amber-500 text-white',
    green: 'bg-green-500 border-green-500 text-white',
  }
  const hoverStyles: Record<string, string> = {
    red:   'hover:border-red-400 hover:text-red-500',
    amber: 'hover:border-amber-400 hover:text-amber-500',
    green: 'hover:border-green-400 hover:text-green-600',
  }
  const inactiveBase = dark ? 'border-white/10 text-white/30' : 'border-gray-300 text-gray-400'
  return (
    <button
      onClick={() => onClick(active ? 0 : score)}
      className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${active ? activeStyles[color] : `${inactiveBase} ${hoverStyles[color]}`}`}
    >
      {score}
    </button>
  )
}

function ReviewBlock({
  sectionId, review, onChange, dark, t
}: {
  sectionId: string
  review: ExpertReview
  onChange: (section: string, data: Partial<ExpertReview>) => void
  dark: boolean
  t: Record<string, string>
}) {
  return (
    <div
      className="mt-6 rounded-xl p-4 border"
      style={{ background: dark ? 'rgba(139,92,246,0.05)' : 'rgba(139,92,246,0.03)', borderColor: dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.12)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon name="MessageSquare" size={14} className="text-violet-400" />
        <span className="text-xs font-semibold text-violet-400">Оценка эксперта</span>
      </div>

      <div className="mb-3">
        <div className="text-xs mb-2" style={{ color: t.textMuted }}>Балл (1–10):</div>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(s => (
            <ScoreButton
              key={s}
              score={s}
              current={review.score}
              dark={dark}
              onClick={v => onChange(sectionId, { score: v || null })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs mb-1.5" style={{ color: t.textMuted }}>Комментарий:</div>
        <textarea
          value={review.feedback}
          onChange={e => onChange(sectionId, { feedback: e.target.value })}
          placeholder="Укажите замечания, рекомендации или сильные стороны..."
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-all"
          style={{
            background: dark ? 'rgba(255,255,255,0.05)' : '#f9fafb',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
            color: t.text,
          }}
        />
      </div>
    </div>
  )
}

function Field({ label, value, t }: { label: string; value: string | number | null | undefined; t: Record<string, string> }) {
  if (!value && value !== 0) return null
  return (
    <div className="mb-4">
      <div className="text-xs font-medium mb-1" style={{ color: t.textMuted }}>{label}</div>
      <div className="text-sm leading-relaxed" style={{ color: t.text }}>{String(value)}</div>
    </div>
  )
}

export default function ExpertProjectCard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const [project, setProject] = useState<FullProject | null>(null)
  const [reviews, setReviews] = useState<Record<string, ExpertReview>>({})
  const [assignmentId, setAssignmentId] = useState<number | null>(null)
  const [assignmentStatus, setAssignmentStatus] = useState<string>('pending')
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [loading, setLoading] = useState(true)

  const t = {
    bg:           dark ? '#0a0f1e'                 : '#f5f7fa',
    headerBg:     dark ? '#0a0f1e'                 : 'rgba(255,255,255,0.95)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)'  : '#e5e7eb',
    tabsBorder:   dark ? 'rgba(255,255,255,0.05)'  : '#e5e7eb',
    cardBg:       dark ? 'rgba(255,255,255,0.03)'  : '#ffffff',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)'  : 'rgba(0,0,0,0.07)',
    sectionBg:    dark ? 'rgba(255,255,255,0.02)'  : '#f9fafb',
    text:         dark ? '#ffffff'                 : '#111827',
    textMuted:    dark ? 'rgba(255,255,255,0.4)'   : '#6b7280',
    textFaint:    dark ? 'rgba(255,255,255,0.2)'   : '#d1d5db',
    tabInactive:  dark ? 'rgba(255,255,255,0.4)'   : '#6b7280',
    backBtn:      dark ? 'rgba(255,255,255,0.4)'   : '#9ca3af',
    toggleBg:     dark ? 'rgba(255,255,255,0.08)'  : 'rgba(0,0,0,0.06)',
    toggleColor:  dark ? 'rgba(255,255,255,0.5)'   : '#6b7280',
  }

  useEffect(() => {
    if (!id) return
    apiGetExpertProject(Number(id))
      .then(data => {
        setProject(data.project)
        const r: Record<string, ExpertReview> = {}
        SECTIONS.forEach(s => {
          r[s.id] = data.reviews[s.id] || { feedback: '', score: null }
        })
        setReviews(r)
        setAssignmentId(data.assignment_id)
        setAssignmentStatus(data.assignment_status)
        setLoading(false)
      })
      .catch(() => navigate('/expert/dashboard'))
  }, [id, navigate])

  const handleReviewChange = useCallback((section: string, data: Partial<ExpertReview>) => {
    setReviews(prev => ({ ...prev, [section]: { ...prev[section], ...data } }))
  }, [])

  async function handleSave() {
    if (!assignmentId) return
    setSaving(true)
    try {
      const section = activeSection
      const review = reviews[section]
      await apiSaveExpertReview({
        assignment_id: assignmentId,
        section,
        feedback: review.feedback,
        score: review.score,
      })
      toast.success('Оценка сохранена')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  async function handleComplete() {
    if (!assignmentId) return
    setCompleting(true)
    try {
      // Сохраняем текущий раздел перед завершением
      const review = reviews[activeSection]
      if (review.feedback || review.score) {
        await apiSaveExpertReview({ assignment_id: assignmentId, section: activeSection, feedback: review.feedback, score: review.score })
      }
      await apiCompleteExpertReview(assignmentId)
      setAssignmentStatus('reviewed')
      toast.success('Экспертиза завершена! Участник получил обратную связь.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setCompleting(false)
    }
  }

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
      </div>
    )
  }

  const currentReview = reviews[activeSection] || { feedback: '', score: null }
  const reviewed = assignmentStatus === 'reviewed'

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      {/* Header */}
      <header
        className="px-4 sm:px-6 py-4 sticky top-0 z-20"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}` }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/expert/dashboard')}
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
                <span className="text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                  Эксперт
                </span>
              </div>
              {project.grant_fund && (
                <p className="text-xs mt-0.5 truncate" style={{ color: t.textMuted }}>{project.grant_fund}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggle}
              className="px-3 py-2 rounded-xl text-sm transition-all hover:scale-105"
              style={{ background: t.toggleBg, color: t.toggleColor }}
            >
              <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving || reviewed}
              className="flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`, color: t.text }}
            >
              {saving ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Save" size={14} />}
              <span className="hidden sm:inline">Сохранить</span>
            </button>
            {!reviewed && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-3 sm:px-4 py-2 text-white text-sm font-semibold transition-all disabled:opacity-50"
              >
                {completing ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="CheckCheck" size={14} />}
                <span className="hidden sm:inline">Завершить оценку</span>
              </button>
            )}
            {reviewed && (
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-green-400" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Icon name="CheckCircle" size={14} />
                <span className="hidden sm:inline">Завершено</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="overflow-x-auto" style={{ background: t.headerBg, borderBottom: `1px solid ${t.tabsBorder}` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 min-w-max">
            {SECTIONS.map(sec => {
              const r = reviews[sec.id]
              const hasReview = r && (r.score || r.feedback)
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeSection === sec.id
                      ? 'border-violet-500 text-violet-400'
                      : 'border-transparent'
                  }`}
                  style={activeSection !== sec.id ? { color: t.tabInactive } : {}}
                >
                  <Icon name={sec.icon} size={15} />
                  <span className="hidden sm:inline">{sec.label}</span>
                  <span className="sm:hidden">{sec.label.split(' ')[0]}</span>
                  {hasReview && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {reviewed ? (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-green-400 text-sm">
            <Icon name="CheckCircle" size={14} />
            Экспертиза завершена. Участник получил вашу обратную связь.
          </div>
        ) : (
          <div
            className="mb-6 flex items-start gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: dark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)', border: `1px solid ${dark ? 'rgba(139,92,246,0.2)' : 'rgba(139,92,246,0.15)'}`, color: dark ? '#c4b5fd' : '#7c3aed' }}
          >
            <Icon name="Info" size={15} className="flex-shrink-0 mt-0.5" />
            <span>После оценки каждого раздела нажимайте <strong>«Сохранить»</strong> в шапке. Когда все разделы оценены — нажмите <strong>«Завершить оценку»</strong>.</span>
          </div>
        )}

        {/* GENERAL */}
        {activeSection === 'general' && (
          <div className="space-y-1">
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>Общая информация</h2>
            <div className="rounded-2xl border p-5" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
              <Field label="Название проекта" value={project.title} t={t} />
              <Field label="Грантовый фонд" value={project.grant_fund} t={t} />
              <Field label="Масштаб" value={project.scale} t={t} />
              <Field label="Дедлайн подачи" value={project.deadline} t={t} />
              <Field label="Дата начала" value={project.start_date} t={t} />
              <Field label="Дата окончания" value={project.end_date} t={t} />
              <Field label="Бюджет" value={project.budget} t={t} />
              <Field label="Краткое описание" value={project.short_description} t={t} />
              <Field label="География" value={project.geography} t={t} />
            </div>
            <ReviewBlock sectionId="general" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}

        {/* ABOUT */}
        {activeSection === 'about' && (
          <div>
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>О проекте</h2>
            <div className="rounded-2xl border p-5 space-y-1" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
              <Field label="Описание" value={project.description} t={t} />
              <Field label="Проблема" value={project.problem} t={t} />
              <Field label="Целевая аудитория" value={project.target_audience} t={t} />
              <Field label="Цель проекта" value={project.goal} t={t} />
              <Field label="Ожидаемые результаты" value={project.expected_results} t={t} />
              <Field label="Опыт организации" value={project.experience} t={t} />
              <Field label="Перспективы" value={project.prospects} t={t} />
            </div>
            <ReviewBlock sectionId="about" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}

        {/* TEAM */}
        {activeSection === 'team' && (
          <div>
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>Команда</h2>
            {project.team.length === 0 ? (
              <p className="text-sm" style={{ color: t.textMuted }}>Команда не заполнена</p>
            ) : (
              <div className="space-y-3">
                {project.team.map((m, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    <div className="font-medium text-sm mb-1" style={{ color: t.text }}>{m.full_name}</div>
                    <div className="text-xs mb-2 text-violet-400">{m.role}</div>
                    {m.competencies && <div className="text-xs" style={{ color: t.textMuted }}>{m.competencies}</div>}
                  </div>
                ))}
              </div>
            )}
            <ReviewBlock sectionId="team" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}

        {/* RESULTS */}
        {activeSection === 'results' && (
          <div>
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>Результаты</h2>
            <div className="rounded-2xl border p-5" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
              <Field label="Кол-во мероприятий" value={project.results_events_count} t={t} />
              <Field label="Кол-во участников" value={project.results_participants_count} t={t} />
              <Field label="Публикации" value={project.results_publications_count} t={t} />
              <Field label="Просмотры" value={project.results_views_count} t={t} />
              <Field label="Дедлайн результатов" value={project.results_deadline} t={t} />
            </div>
            <ReviewBlock sectionId="results" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}

        {/* CALENDAR */}
        {activeSection === 'calendar' && (
          <div>
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>Календарный план</h2>
            {project.tasks.length === 0 ? (
              <p className="text-sm" style={{ color: t.textMuted }}>Задачи не заполнены</p>
            ) : (
              <div className="space-y-4">
                {project.tasks.map((task, ti) => (
                  <div key={ti} className="rounded-xl border p-4" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    <div className="font-medium text-sm mb-3" style={{ color: t.text }}>{task.task_name}</div>
                    {task.events.map((ev, ei) => (
                      <div key={ei} className="mb-2 pl-3 border-l-2 border-violet-500/30">
                        <div className="text-sm" style={{ color: t.text }}>{ev.event_name}</div>
                        {ev.deadline && <div className="text-xs" style={{ color: t.textMuted }}>Дедлайн: {ev.deadline}</div>}
                        {ev.event_description && <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>{ev.event_description}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <ReviewBlock sectionId="calendar" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}

        {/* MEDIA */}
        {activeSection === 'media' && (
          <div>
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>Медиа</h2>
            {project.media.length === 0 ? (
              <p className="text-sm" style={{ color: t.textMuted }}>Медиа не заполнено</p>
            ) : (
              <div className="space-y-3">
                {project.media.map((m, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    <div className="font-medium text-sm mb-1" style={{ color: t.text }}>{m.resource_name}</div>
                    <div className="text-xs" style={{ color: t.textMuted }}>
                      {m.publication_month && `Месяц: ${m.publication_month}`}
                      {m.planned_views != null && ` · Охват: ${m.planned_views}`}
                    </div>
                    {m.format_reason && <div className="text-xs mt-1" style={{ color: t.textMuted }}>{m.format_reason}</div>}
                    {m.resource_links && <div className="text-xs mt-1 text-violet-400">{m.resource_links}</div>}
                  </div>
                ))}
              </div>
            )}
            <ReviewBlock sectionId="media" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}

        {/* EXPENSES */}
        {activeSection === 'expenses' && (
          <div>
            <h2 className="text-lg font-semibold mb-5" style={{ color: t.text }}>Расходы</h2>
            {project.expenses.length === 0 ? (
              <p className="text-sm" style={{ color: t.textMuted }}>Расходы не заполнены</p>
            ) : (
              <div className="space-y-3">
                {project.expenses.map((e, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm" style={{ color: t.text }}>{e.item_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>{e.category}</div>
                        {e.justification && <div className="text-xs mt-1" style={{ color: t.textMuted }}>{e.justification}</div>}
                      </div>
                      <div className="text-sm font-semibold flex-shrink-0" style={{ color: t.text }}>
                        {(e.price * e.quantity).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl border p-4 text-sm font-semibold flex justify-between" style={{ background: t.cardBg, borderColor: t.cardBorder, color: t.text }}>
                  <span>Итого:</span>
                  <span>{project.expenses.reduce((s, e) => s + e.price * e.quantity, 0).toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            )}
            <ReviewBlock sectionId="expenses" review={currentReview} onChange={handleReviewChange} dark={dark} t={t} />
          </div>
        )}
      </main>
    </div>
  )
}