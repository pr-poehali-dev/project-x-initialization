import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMe, removeToken } from '@/lib/api'
import Icon from '@/components/ui/icon'

interface User {
  id: number
  email: string
  name: string
  organization: string
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    apiGetMe().then(u => {
      if (!u) {
        navigate('/')
        return
      }
      setUser(u)
      setLoading(false)
    })
  }, [navigate])

  function handleLogout() {
    removeToken()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0f1e' }}>
        <div className="text-white/50 text-sm">Загрузка...</div>
      </div>
    )
  }

  const joinDate = user ? new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">G</div>
            <span className="text-white font-semibold">GrantRun</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
          >
            <Icon name="LogOut" size={15} />
            Выйти
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">
            Привет, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-white/40 text-sm">
            {user?.organization ? `${user.organization} · ` : ''}С нами с {joinDate}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Проектов', value: '0', icon: 'FolderOpen', color: 'from-blue-500 to-blue-600' },
            { label: 'На проверке', value: '0', icon: 'Clock', color: 'from-amber-500 to-orange-500' },
            { label: 'Побед', value: '0', icon: 'Trophy', color: 'from-green-500 to-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-white/5 p-5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={17} className="text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-white/40 text-sm mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Create first project */}
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Icon name="Plus" size={24} className="text-green-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Создайте первый проект</h3>
          <p className="text-white/40 text-sm mb-5 max-w-xs mx-auto">
            Заполните проектную карту и получите готовую заявку для подачи на грант
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 text-white text-sm font-semibold hover:from-green-500 hover:to-emerald-500 transition-all">
            <Icon name="Plus" size={16} />
            Новый проект
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Грант-Академия', desc: 'Короткие уроки по написанию заявок', icon: 'GraduationCap' },
            { title: 'Найти эксперта', desc: 'Консультация и ревью проекта', icon: 'Users' },
          ].map(item => (
            <div key={item.title} className="flex items-center gap-4 rounded-xl border border-white/5 p-4 cursor-pointer hover:border-white/10 transition-colors" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={18} className="text-white/60" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">{item.title}</div>
                <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-white/20 ml-auto" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
