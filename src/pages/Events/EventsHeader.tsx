import { useNavigate } from 'react-router-dom'
import Icon from '@/components/ui/icon'

interface ThemeTokens {
  headerBg: string
  headerBorder: string
  text: string
  textMuted: string
  logoFilter: string
  toggleBg: string
  toggleColor: string
}

interface EventsHeaderProps {
  dark: boolean
  t: ThemeTokens
  onToggleTheme: () => void
  onLogout: () => void
}

export default function EventsHeader({ dark, t, onToggleTheme, onLogout }: EventsHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="px-6 py-4 sticky top-0 z-20 transition-colors duration-300"
      style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img
            src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
            alt="Логотип"
            className="w-7 h-7 transition-all duration-300"
            style={{ filter: t.logoFilter }}
          />
          <span className="font-semibold transition-colors duration-300" style={{ color: t.text }}>Грантовый дайвинг</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:opacity-70"
            style={{ color: t.textMuted }}
          >
            <Icon name="LayoutDashboard" size={15} />
            <span className="hidden sm:inline">Мои проекты</span>
          </button>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{ background: t.toggleBg, color: t.toggleColor }}
            title={dark ? 'Светлая тема' : 'Тёмная тема'}
          >
            <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
            <span className="hidden sm:inline">{dark ? 'Светлая' : 'Тёмная'}</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:opacity-70"
            style={{ color: t.textMuted }}
          >
            <Icon name="UserCog" size={15} />
            <span className="hidden sm:inline">Профиль</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:opacity-70"
            style={{ color: t.textMuted }}
          >
            <Icon name="LogOut" size={15} />
            <span className="hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>
    </header>
  )
}
