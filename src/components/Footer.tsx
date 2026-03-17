import { useTheme } from '@/hooks/useTheme'
import Icon from '@/components/ui/icon'

export default function Footer() {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const bg          = dark ? '#0d1120'                    : '#f8f9fb'
  const border      = dark ? 'rgba(255,255,255,0.07)'     : 'rgba(0,0,0,0.09)'
  const textMuted   = dark ? 'rgba(255,255,255,0.30)'     : '#a0aab8'
  const textHover   = dark ? 'rgba(255,255,255,0.60)'     : '#5a6478'
  const logoFilter  = dark ? 'invert(1) opacity(0.28)'    : 'opacity(0.35)'
  const divider     = dark ? 'rgba(255,255,255,0.06)'     : 'rgba(0,0,0,0.07)'

  const badgeBg     = dark ? 'rgba(139,92,246,0.12)'      : 'rgba(139,92,246,0.08)'
  const badgeBorder = dark ? 'rgba(139,92,246,0.22)'      : 'rgba(139,92,246,0.18)'
  const badgeColor  = dark ? '#a78bfa'                    : '#6d28d9'

  const tgBg        = dark ? 'rgba(139,92,246,0.14)'      : 'rgba(139,92,246,0.1)'
  const tgBorder    = dark ? 'rgba(139,92,246,0.28)'      : 'rgba(139,92,246,0.22)'
  const tgColor     = dark ? '#c4b5fd'                    : '#7c3aed'

  return (
    <footer style={{ background: bg, borderTop: `1px solid ${border}` }} className="w-full px-6 pt-8 pb-6">
      <div className="max-w-5xl mx-auto">

        {/* Main row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img
              src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип"
              className="w-5 h-5"
              style={{ filter: logoFilter }}
            />
            <span className="text-sm font-medium tracking-tight" style={{ color: textMuted }}>
              Грантовый дайвинг
            </span>
          </div>

          {/* Label badge */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: badgeBg, border: `1px solid ${badgeBorder}` }}
          >
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black leading-none"
              style={{ background: badgeColor, color: dark ? '#0d1120' : '#fff' }}
            >
              M
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold" style={{ color: badgeColor }}>Meridian Corp</span>
              <span className="text-[10px]" style={{ color: textMuted }}>ООО «Меридиан Корп»</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://disk.yandex.ru/i/lO083CtgUTrafQ"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = textHover)}
              onMouseLeave={e => (e.currentTarget.style.color = textMuted)}
            >
              Политика обработки ПД
            </a>

            <a
              href="https://t.me/DUBBLE_RF"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: tgBg, color: tgColor, border: `1px solid ${tgBorder}` }}
            >
              <Icon name="Send" size={12} />
              Связаться
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-6 pt-4 text-center" style={{ borderTop: `1px solid ${divider}` }}>
          <p className="text-[11px]" style={{ color: textMuted }}>
            © 2026 ООО «Меридиан Корп» — платформа для грантрайтеров и НКО
          </p>
        </div>

      </div>
    </footer>
  )
}
