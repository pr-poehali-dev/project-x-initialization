import { useTheme } from '@/hooks/useTheme'
import Icon from '@/components/ui/icon'

export default function Footer() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const bg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'
  const border = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const text = dark ? 'rgba(255,255,255,0.35)' : '#9ca3af'
  const textHover = dark ? 'rgba(255,255,255,0.65)' : '#6b7280'
  const logoFilter = dark ? 'invert(1) opacity(0.35)' : 'opacity(0.4)'

  return (
    <footer
      style={{ background: bg, borderTop: `1px solid ${border}` }}
      className="w-full px-6 py-8"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Left: logo + name */}
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              className="w-6 h-6"
              style={{ filter: logoFilter }}
            />
            <span className="text-sm font-medium" style={{ color: text }}>
              Грантовый дайвинг
            </span>
          </div>

          {/* Center: label badge */}
          <div className="flex items-center">
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/af67651e-b57c-42ca-9505-baffb415590b.png"
              alt="Meridian Corp"
              className="h-8 object-contain"
              style={{ filter: dark ? 'invert(1) opacity(0.5)' : 'opacity(0.6)' }}
            />
          </div>

          {/* Right: links */}
          <div className="flex items-center gap-5">
            <a
              href="https://disk.yandex.ru/i/lO083CtgUTrafQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors hover:underline"
              style={{ color: text }}
              onMouseEnter={e => (e.currentTarget.style.color = textHover)}
              onMouseLeave={e => (e.currentTarget.style.color = text)}
            >
              Политика обработки ПД
            </a>

            <a
              href="https://t.me/DUBBLE_RF"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: dark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
                color: dark ? '#a78bfa' : '#7c3aed',
                border: `1px solid ${dark ? 'rgba(139,92,246,0.25)' : 'rgba(139,92,246,0.2)'}`,
              }}
            >
              <Icon name="Send" size={13} />
              Связаться
            </a>
          </div>
        </div>

        <div className="mt-6 pt-5 text-center" style={{ borderTop: `1px solid ${border}` }}>
          <p className="text-xs" style={{ color: text }}>
            © 2026 ООО «Меридиан Корп» — платформа для грантрайтеров и НКО
          </p>
        </div>
      </div>
    </footer>
  )
}
