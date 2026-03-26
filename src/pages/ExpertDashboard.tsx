import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetExpertMe, apiGetExpertProjects, apiGetCoordinatorMe, removeExpertToken } from '@/lib/api'
import type { ExpertUser, ExpertAssignment } from '@/lib/api'
import Icon from '@/components/ui/icon'
import { useTheme } from '@/hooks/useTheme'

const ASSIGN_STATUS: Record<string, { label: string; darkColor: string; lightColor: string }> = {
  pending:   { label: 'Ожидает',     darkColor: 'text-amber-400 bg-amber-500/10',  lightColor: 'text-amber-600 bg-amber-50' },
  in_review: { label: 'В работе',    darkColor: 'text-blue-400 bg-blue-500/10',    lightColor: 'text-blue-600 bg-blue-50' },
  reviewed:  { label: 'Завершено',   darkColor: 'text-green-400 bg-green-500/10',  lightColor: 'text-green-700 bg-green-50' },
}

export default function ExpertDashboard() {
  const [expert, setExpert] = useState<ExpertUser | null>(null)
  const [assignments, setAssignments] = useState<ExpertAssignment[]>([])
  const [isCoordinator, setIsCoordinator] = useState(false)
  const [loading, setLoading] = useState(true)
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
  }

  useEffect(() => {
    Promise.all([
      apiGetExpertMe(),
      apiGetExpertProjects().catch(() => []),
      apiGetCoordinatorMe().catch(() => null),
    ]).then(([ex, assign, coord]) => {
      if (!ex) { navigate('/expert'); return }
      setExpert(ex)
      setAssignments(assign as ExpertAssignment[])
      setIsCoordinator(!!coord)
      setLoading(false)
    })
  }, [navigate])

  function handleLogout() {
    removeExpertToken()
    navigate('/expert')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
        <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
      </div>
    )
  }

  const pendingCount = assignments.filter(a => a.status === 'pending').length
  const inReviewCount = assignments.filter(a => a.status === 'in_review').length
  const reviewedCount = assignments.filter(a => a.status === 'reviewed').length

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      <header
        className="border-b px-6 py-4 transition-colors duration-300"
        style={{ background: t.headerBg, borderColor: t.headerBorder, backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              className="w-7 h-7"
              style={{ filter: t.logoFilter }}
            />
            <span className="font-semibold" style={{ color: t.text }}>Грантовый дайвинг</span>
            <span className="text-xs px-2 py-0.5 rounded-md ml-1 font-medium" style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
              Эксперт
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isCoordinator && (
              <button
                onClick={() => navigate('/coordinator/dashboard')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}
              >
                <Icon name="Compass" size={15} />
                <span className="hidden sm:inline">Кабинет координатора</span>
              </button>
            )}
            <button
              onClick={toggle}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: t.toggleBg, color: t.toggleColor }}
            >
              <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
              <span className="hidden sm:inline">{dark ? 'Светлая' : 'Тёмная'}</span>
            </button>
            <button
              onClick={() => navigate('/expert/profile')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-70"
              style={{ color: t.textMuted }}
            >
              <Icon name="UserCog" size={15} />
              <span className="hidden sm:inline">Профиль</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:opacity-70"
              style={{ color: t.textMuted }}
            >
              <Icon name="LogOut" size={15} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.text }}>
            Привет, {expert?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm" style={{ color: t.textMuted }}>
            {expert?.specialization ? `${expert.specialization} · ` : ''}Кабинет эксперта
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Ожидают оценки', value: String(pendingCount),   icon: 'Clock',      color: 'from-amber-500 to-orange-500' },
            { label: 'В работе',       value: String(inReviewCount),  icon: 'Pencil',     color: 'from-blue-500 to-blue-600' },
            { label: 'Завершено',      value: String(reviewedCount),  icon: 'CheckCircle', color: 'from-green-500 to-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border p-5" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={17} className="text-white" />
              </div>
              <div className="text-2xl font-bold" style={{ color: t.text }}>{stat.value}</div>
              <div className="text-sm mt-0.5" style={{ color: t.textMuted }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Assignments */}
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-14 text-center" style={{ borderColor: t.emptyBorder }}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="ClipboardList" size={24} className="text-violet-400" />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: t.text }}>Проектов пока нет</h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: t.textMuted }}>
              Участники будут присылать вам проекты для экспертной оценки
            </p>
          </div>
        ) : (
          <div>
            <h2 className="font-semibold text-lg mb-4" style={{ color: t.text }}>Проекты на оценку</h2>
            <div className="space-y-3">
              {assignments.map(a => {
                const st = ASSIGN_STATUS[a.status] || ASSIGN_STATUS.pending
                const statusClass = dark ? st.darkColor : st.lightColor
                return (
                  <div
                    key={a.assignment_id}
                    className="flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200"
                    style={{ background: t.cardBg, borderColor: t.cardBorder }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = t.cardHover)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = t.cardBorder)}
                    onClick={() => navigate(`/expert/projects/${a.project_id}`)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={17} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: t.text }}>{a.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                        {a.author_name}{a.organization ? ` · ${a.organization}` : ''}
                        {a.grant_fund ? ` · ${a.grant_fund}` : ''}
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg flex-shrink-0 ${statusClass}`}>
                      {st.label}
                    </span>
                    <Icon name="ChevronRight" size={16} style={{ color: t.textFaint }} className="flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}