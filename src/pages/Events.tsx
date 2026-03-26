import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMe, apiGetEvents, removeToken, apiCheckMySubmission } from '@/lib/api'
import type { GrantEvent } from '@/lib/api'
import { useTheme } from '@/hooks/useTheme'
import Icon from '@/components/ui/icon'
import EventsHeader from '@/pages/Events/EventsHeader'
import EventsFilters from '@/pages/Events/EventsFilters'
import EventCard from '@/pages/Events/EventCard'
import SubmitProjectModal from '@/pages/Events/SubmitProjectModal'

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

      <EventsHeader
        dark={dark}
        t={t}
        onToggleTheme={toggle}
        onLogout={handleLogout}
      />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 transition-colors duration-300" style={{ color: t.text }}>
            Мероприятия
          </h1>
          <p className="text-sm transition-colors duration-300" style={{ color: t.textMuted }}>
            Грантовые конкурсы и программы, куда можно подать заявку
          </p>
        </div>

        <EventsFilters
          search={search}
          category={category}
          t={t}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

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
            {filtered.map(ev => (
              <EventCard
                key={ev.id}
                ev={ev}
                dark={dark}
                alreadySubmitted={submittedEventIds.has(ev.id)}
                t={t}
                onSubmitClick={setSubmitModal}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}