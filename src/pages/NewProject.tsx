import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCreateProject } from '@/lib/api'
import Icon from '@/components/ui/icon'

const STEPS = [
  { id: 'basics', label: 'Основное', icon: 'FileText' },
  { id: 'problem', label: 'Проблема', icon: 'AlertCircle' },
  { id: 'solution', label: 'Решение', icon: 'Lightbulb' },
  { id: 'grant', label: 'Грант', icon: 'DollarSign' },
]

interface FormData {
  title: string
  description: string
  problem: string
  target_audience: string
  goal: string
  expected_results: string
  budget: string
  grant_fund: string
  deadline: string
}

const empty: FormData = {
  title: '', description: '', problem: '', target_audience: '',
  goal: '', expected_results: '', budget: '', grant_fund: '', deadline: '',
}

export default function NewProject() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.title.trim()) { setError('Укажите название проекта'); return }
    setLoading(true)
    setError('')
    try {
      const p = await apiCreateProject(form)
      navigate('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  const isLast = step === STEPS.length - 1

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">G</div>
            <span className="text-white font-semibold">GrantRun</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Новый проект</h1>
          <p className="text-white/40 text-sm">Заполните проектную карту — это основа вашей заявки на грант</p>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-medium ${
                i === step
                  ? 'border-green-500/40 bg-green-500/10 text-green-400'
                  : i < step
                  ? 'border-white/10 bg-white/5 text-white/60'
                  : 'border-white/5 bg-white/2 text-white/25'
              }`}
            >
              <Icon name={s.icon} size={16} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-white/5 p-6 mb-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {step === 0 && (
            <div className="space-y-5">
              <Field label="Название проекта *" hint="Коротко и ёмко — как вы называете свою инициативу">
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Например: «Цифровые мастерские для сельских школьников»"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 focus:bg-white/8 transition-all"
                />
              </Field>
              <Field label="Краткое описание" hint="1–3 предложения о том, что за проект и зачем">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Опишите проект в двух словах..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <Field label="Какую проблему решает проект?" hint="Опишите ситуацию: что происходит, почему это важно">
                <textarea
                  value={form.problem}
                  onChange={e => set('problem', e.target.value)}
                  placeholder="Например: в сельских школах нет доступа к современным технологиям, из-за чего дети уступают городским сверстникам..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                />
              </Field>
              <Field label="Целевая аудитория" hint="Кому именно поможет проект? Возраст, количество, локация">
                <textarea
                  value={form.target_audience}
                  onChange={e => set('target_audience', e.target.value)}
                  placeholder="Например: школьники 10–16 лет из трёх сёл Тверской области, около 300 человек"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <Field label="Цель проекта" hint="Измеримая цель — что будет достигнуто по итогу">
                <textarea
                  value={form.goal}
                  onChange={e => set('goal', e.target.value)}
                  placeholder="Например: создать 3 оснащённые цифровые мастерские и обучить 300 школьников базовым навыкам программирования"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                />
              </Field>
              <Field label="Ожидаемые результаты" hint="Что конкретно будет сделано: мероприятия, продукты, охват">
                <textarea
                  value={form.expected_results}
                  onChange={e => set('expected_results', e.target.value)}
                  placeholder="Например: проведено 120 занятий, выдано 300 сертификатов, создан открытый учебный курс..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all resize-none"
                />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <Field label="Грантовый фонд / конкурс" hint="Куда планируете подавать заявку">
                <input
                  value={form.grant_fund}
                  onChange={e => set('grant_fund', e.target.value)}
                  placeholder="Например: Фонд президентских грантов, Росмолодёжь, ФПГ 2025"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                />
              </Field>
              <Field label="Запрашиваемый бюджет" hint="Примерная сумма гранта (в рублях)">
                <input
                  value={form.budget}
                  onChange={e => set('budget', e.target.value)}
                  placeholder="Например: 1 500 000 ₽"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                />
              </Field>
              <Field label="Дедлайн подачи" hint="Когда нужно подать заявку">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => set('deadline', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-green-500/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </Field>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 rounded-xl border border-white/10 py-3 text-white/60 text-sm font-medium hover:text-white/80 hover:border-white/20 transition-all"
            >
              Назад
            </button>
          )}
          {!isLast ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all"
            >
              Далее
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
            >
              {loading ? 'Сохраняем...' : 'Создать проект'}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/80 text-sm font-medium mb-1">{label}</label>
      {hint && <p className="text-white/30 text-xs mb-2">{hint}</p>}
      {children}
    </div>
  )
}