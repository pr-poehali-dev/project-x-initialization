import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGetMe, apiUpdateMe } from '@/lib/api'
import type { UserProfile } from '@/lib/api'
import Icon from '@/components/ui/icon'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  inputCls: string
  inputStyle: React.CSSProperties
  labelColor: string
}

function Field({ label, value, onChange, placeholder, type = 'text', inputCls, inputStyle, labelColor }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: labelColor }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
        style={inputStyle}
      />
    </div>
  )
}

const EMPTY: Partial<UserProfile> = {
  name: '', full_name: '', organization: '', education: '',
  workplace: '', position: '', city: '', phone: '', pd_consent: false,
}

export default function EditProfile() {
  const [profile, setProfile] = useState<Partial<UserProfile>>(EMPTY)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'

  const t = {
    bg:           dark ? '#0a0f1e'                : '#f5f7fa',
    headerBg:     dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)',
    headerBorder: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)',
    cardBg:       dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
    cardBorder:   dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    text:         dark ? '#ffffff'                : '#111827',
    textMuted:    dark ? 'rgba(255,255,255,0.4)'  : '#6b7280',
    inputBg:      dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    inputBorder:  dark ? 'rgba(255,255,255,0.1)'  : 'rgba(0,0,0,0.12)',
    disabledBg:   dark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
    logoFilter:   dark ? 'invert(1)'               : 'none',
    toggleBg:     dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    toggleColor:  dark ? 'rgba(255,255,255,0.5)'  : '#6b7280',
  }

  useEffect(() => {
    apiGetMe().then(u => {
      if (!u) { navigate('/'); return }
      setEmail(u.email || '')
      setProfile({
        name: u.name || '',
        full_name: u.full_name || '',
        organization: u.organization || '',
        education: u.education || '',
        workplace: u.workplace || '',
        position: u.position || '',
        city: u.city || '',
        phone: u.phone || '',
        pd_consent: u.pd_consent || false,
      })
      setLoading(false)
    })
  }, [navigate])

  function set(key: keyof UserProfile, value: string | boolean) {
    setProfile(p => ({ ...p, [key]: value }))
  }

  async function handleSave() {
    if (!profile.full_name?.trim() && !profile.name?.trim()) {
      toast.error('Укажите ФИО')
      return
    }
    setSaving(true)
    try {
      await apiUpdateMe(profile)
      toast.success('Профиль сохранён')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
      <div className="text-sm" style={{ color: t.textMuted }}>Загрузка...</div>
    </div>
  )

  const initials = (profile.full_name || profile.name || '?').charAt(0).toUpperCase()
  const inputCls = 'w-full rounded-xl px-4 py-3 text-sm outline-none transition-all'
  const inputStyle = { background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg }}>
      <header className="px-6 py-4 transition-colors duration-300"
        style={{ background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`, backdropFilter: 'blur(12px)' }}>
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
            style={{ color: t.textMuted }}>
            <Icon name="ArrowLeft" size={16} />
            Назад
          </button>
          <div className="flex items-center gap-2">
            <img src="https://cdn.poehali.dev/projects/21c1c609-db21-406e-b017-fd98879900e7/bucket/93e4dbc3-2940-479b-8ac0-6b26b4801bc0.png"
              alt="Логотип" className="w-7 h-7" style={{ filter: t.logoFilter }} />
            <span className="font-semibold" style={{ color: t.text }}>Грантовый дайвинг</span>
          </div>
          <button onClick={toggle} className="px-3 py-2 rounded-xl text-sm transition-all"
            style={{ background: t.toggleBg, color: t.toggleColor }}>
            <Icon name={dark ? 'Sun' : 'Moon'} size={15} />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: t.text }}>Профиль участника</h1>
          <p className="text-sm" style={{ color: t.textMuted }}>Данные используются в проектных картах и заявках</p>
        </div>

        {/* Аватар */}
        <div className="flex items-center gap-4 rounded-2xl border p-5 mb-6 transition-colors duration-300"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/20 flex items-center justify-center text-2xl font-bold text-green-400 flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate" style={{ color: t.text }}>{profile.full_name || profile.name || 'Имя не указано'}</div>
            <div className="text-sm truncate" style={{ color: t.textMuted }}>{email}</div>
          </div>
        </div>

        {/* Личные данные */}
        <div className="rounded-2xl border p-5 mb-4 space-y-4 transition-colors duration-300"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <h2 className="text-sm font-semibold" style={{ color: t.text }}>Личные данные</h2>

          <Field label="ФИО *" value={profile.full_name || ''} onChange={v => set('full_name', v)} placeholder="Иванов Иван Иванович" inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: t.textMuted }}>Email</label>
            <input value={email} disabled className={inputCls}
              style={{ background: t.disabledBg, border: `1px solid ${t.inputBorder}`, color: t.textMuted, cursor: 'not-allowed' }} />
            <p className="text-xs mt-1" style={{ color: t.textMuted }}>Email изменить нельзя</p>
          </div>

          <Field label="Телефон" value={profile.phone || ''} onChange={v => set('phone', v)} placeholder="+7 (900) 000-00-00" type="tel" inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />
          <Field label="Город" value={profile.city || ''} onChange={v => set('city', v)} placeholder="Москва" inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />
        </div>

        {/* Образование и работа */}
        <div className="rounded-2xl border p-5 mb-4 space-y-4 transition-colors duration-300"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <h2 className="text-sm font-semibold" style={{ color: t.text }}>Образование и работа</h2>

          <Field label="Образование" value={profile.education || ''} onChange={v => set('education', v)} placeholder="Высшее, специальность..." inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />
          <Field label="Организация / место работы" value={profile.organization || ''} onChange={v => set('organization', v)} placeholder="НКО, фонд, учреждение..." inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />
          <Field label="Место работы (подробно)" value={profile.workplace || ''} onChange={v => set('workplace', v)} placeholder="ООО Пример, Москва" inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />
          <Field label="Должность" value={profile.position || ''} onChange={v => set('position', v)} placeholder="Руководитель проектов" inputCls={inputCls} inputStyle={inputStyle} labelColor={t.textMuted} />
        </div>

        {/* Согласие на обработку ПД */}
        <div className="rounded-2xl border p-5 mb-6 transition-colors duration-300"
          style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={profile.pd_consent || false}
                onChange={e => set('pd_consent', e.target.checked)}
                className="sr-only"
              />
              <div
                onClick={() => set('pd_consent', !profile.pd_consent)}
                className="w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer"
                style={{
                  background: profile.pd_consent ? '#10b981' : t.inputBg,
                  border: `2px solid ${profile.pd_consent ? '#10b981' : t.inputBorder}`,
                }}
              >
                {profile.pd_consent && <Icon name="Check" size={12} className="text-white" />}
              </div>
            </div>
            <span className="text-sm leading-relaxed" style={{ color: t.textMuted }}>
              Я даю согласие на обработку персональных данных{' '}
              <span style={{ color: t.text }}>ООО «Меридиан Корп»</span>{' '}
              в соответствии с Федеральным законом № 152-ФЗ «О персональных данных»
            </span>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 py-3 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Icon name="Loader2" size={15} className="animate-spin" />}
          {saving ? 'Сохраняем...' : 'Сохранить изменения'}
        </button>
      </main>
    </div>
  )
}