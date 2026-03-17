import { useState } from 'react'
import { apiLogin, apiRegister, setToken } from '@/lib/api'

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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">G</div>
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