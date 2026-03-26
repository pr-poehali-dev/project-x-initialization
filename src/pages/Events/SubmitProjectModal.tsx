import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { apiGetMyProjectsForSubmission, apiSubmitProjectToEvent } from '@/lib/api'
import type { GrantEvent, MyProjectForSubmission } from '@/lib/api'
import Icon from '@/components/ui/icon'

interface SubmitModalProps {
  event: GrantEvent
  dark: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SubmitProjectModal({ event, dark, onClose, onSuccess }: SubmitModalProps) {
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
