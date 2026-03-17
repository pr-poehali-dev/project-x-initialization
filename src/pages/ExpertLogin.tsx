import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiExpertLogin, apiExpertRegister, setExpertToken } from '@/lib/api'
import Icon from '@/components/ui/icon'

type Mode = 'login' | 'register'

export default function ExpertLogin() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await apiExpertLogin({ email, password })
        setExpertToken(res.token)
        navigate('/expert/dashboard')
      } else {
        if (!name.trim()) { setError('Введите имя'); setLoading(false); return }
        const res = await apiExpertRegister({ email, password, name, specialization })
        setExpertToken(res.token)
        navigate('/expert/dashboard')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0f1e' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon name="UserCheck" size={26} className="text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Кабинет эксперта</h1>
          <p className="text-white/40 text-sm">Грантовый дайвинг</p>
        </div>

        <div className="rounded-2xl border border-white/5 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex rounded-xl overflow-hidden border border-white/5 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 text-sm font-medium transition-all ${mode === m ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/60'}`}
              >
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Имя и фамилия *</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Иван Иванов"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Специализация</label>
                  <input
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    placeholder="Социальные проекты, НКО..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="expert@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Пароль *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 py-3 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Icon name="Loader2" size={15} className="animate-spin" />}
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p className="text-center text-white/25 text-xs mt-6">
          Вход для участников —{' '}
          <button onClick={() => navigate('/')} className="text-white/40 hover:text-white/60 underline">
            главная страница
          </button>
        </p>
      </div>
    </div>
  )
}
