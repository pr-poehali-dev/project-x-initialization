import type { GrantEvent } from '@/lib/api'
import Icon from '@/components/ui/icon'

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

interface ThemeTokens {
  cardBg: string
  cardBorder: string
  text: string
  textMuted: string
}

interface EventCardProps {
  ev: GrantEvent
  dark: boolean
  alreadySubmitted: boolean
  t: ThemeTokens
  onSubmitClick: (ev: GrantEvent) => void
}

export default function EventCard({ ev, dark, alreadySubmitted, t, onSubmitClick }: EventCardProps) {
  const st = STATUS_MAP[ev.status] || STATUS_MAP.open
  const statusClass = dark ? st.darkColor : st.lightColor
  const days = daysLeft(ev.deadline)
  const daysUrgent = ev.deadline && !['Срок истёк'].includes(days || '') &&
    Math.ceil((new Date(ev.deadline).getTime() - Date.now()) / 86400000) <= 7
  const isOur = ev.is_our_event

  return (
    <div
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
                onClick={() => onSubmitClick(ev)}
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
}
