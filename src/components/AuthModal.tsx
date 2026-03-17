import { useState } from 'react'
import { apiLogin, apiRegister, setToken } from '@/lib/api'

const TELEGRAM_BOT_USERNAME = 'grantdiving_bot'

interface Props {
  onClose: () => void
  onSuccess: (user: { name: string; email: string; organization?: string }) => void
  initialMode?: 'login' | 'register'
}

export default function AuthModal({ onClose, onSuccess, initialMode = 'register' }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let result
      if (mode === 'register') {
        result = await apiRegister({ email, password, name, organization })
      } else {
        result = await apiLogin({ email, password })
      }
      setToken(result.token)
      onSuccess(result.user)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-2xl"
        style={{ background: 'rgba(10, 15, 30, 0.97)' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <img src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png" alt="Логотип" className="w-8 h-8 invert" />
          <span className="text-white font-semibold text-lg">Грантовый дайвинг</span>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">
          {mode === 'register' ? 'Создать аккаунт' : 'Войти в аккаунт'}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {mode === 'register' ? 'Бесплатно. Без карты.' : 'Рады видеть вас снова!'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Ваше имя *"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
            />
          )}
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
          />
          <input
            type="password"
            placeholder="Пароль (мин. 6 символов) *"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
          />
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Организация (необязательно)"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
            />
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-white font-semibold text-sm hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Загрузка...' : mode === 'register' ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">или</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          type="button"
          onClick={() => window.open(`https://t.me/${TELEGRAM_BOT_USERNAME}?start=web_auth`, '_blank')}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-white font-semibold text-sm transition-all"
          style={{ background: '#0088cc' }}
          onMouseEnter={e => (e.currentTarget.style.background = '#0077b5')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0088cc')}
        >
          <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09" />
          </svg>
          Войти через Telegram
        </button>

        <p className="text-center text-white/40 text-sm mt-4">
          {mode === 'register' ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError('') }}
            className="text-green-400 hover:text-green-300 transition-colors"
          >
            {mode === 'register' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>
      </div>
    </div>
  )
}