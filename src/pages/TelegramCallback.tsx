import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setToken } from '@/lib/api'
import func2url from '../../backend/func2url.json'

const AUTH_URL = func2url['telegram-bot-telegram-auth']

export default function TelegramCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Токен не найден')
      setStatus('error')
      return
    }

    fetch(`${AUTH_URL}?action=callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        // Сохраняем токен в том же формате что и обычный вход
        setToken(data.access_token || data.token)
        navigate('/dashboard')
      })
      .catch(e => {
        setError(e.message || 'Ошибка авторизации')
        setStatus('error')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
      <div className="text-center">
        {status === 'loading' ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-[#0088cc]/20 border border-[#0088cc]/30 flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin w-6 h-6 text-[#0088cc]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-white/60 text-sm">Выполняем вход через Telegram...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-2xl">✕</div>
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="text-white/40 hover:text-white/70 text-sm underline transition-colors"
            >
              Вернуться на главную
            </button>
          </>
        )}
      </div>
    </div>
  )
}
