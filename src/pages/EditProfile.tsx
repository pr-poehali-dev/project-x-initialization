import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMe, apiUpdateMe } from '@/lib/api'
import Icon from '@/components/ui/icon'

export default function EditProfile() {
  const [name, setName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    apiGetMe().then(u => {
      if (!u) { navigate('/'); return }
      setName(u.name)
      setOrganization(u.organization || '')
      setEmail(u.email)
      setLoading(false)
    })
  }, [navigate])

  async function handleSave() {
    if (!name.trim()) { setError('Укажите имя'); return }
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await apiUpdateMe({ name, organization })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-white/50 text-sm">Загрузка...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">G</div>
            <span className="text-white font-semibold">Грантовый дайвинг</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Редактирование профиля</h1>
          <p className="text-white/40 text-sm">Данные отображаются в ваших проектных картах</p>
        </div>

        <div className="rounded-2xl border border-white/5 p-6 space-y-5 mb-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4 pb-5 border-b border-white/5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/20 flex items-center justify-center text-2xl font-bold text-green-400">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold">{name || 'Имя не указано'}</div>
              <div className="text-white/40 text-sm">{email}</div>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">Имя *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ваше имя или название организации"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">Организация</label>
            <input
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder="НКО, фонд, учреждение..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-green-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">Email</label>
            <input
              value={email}
              disabled
              className="w-full bg-white/3 border border-white/5 rounded-xl px-4 py-3 text-white/30 text-sm cursor-not-allowed"
            />
            <p className="text-white/25 text-xs mt-1.5">Email изменить нельзя</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-green-400 text-sm mb-4 flex items-center gap-2">
            <Icon name="CheckCircle" size={16} />
            Профиль успешно обновлён
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 py-3 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all disabled:opacity-50"
        >
          {saving ? 'Сохраняем...' : 'Сохранить изменения'}
        </button>
      </main>
    </div>
  )
}