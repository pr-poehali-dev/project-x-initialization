import Icon from '@/components/ui/icon'
import { FieldWrap, ViewOrInput, ViewOrTextarea } from './FormField'
import { emptyTeamMember } from './types'
import type { TeamMember } from './types'

interface Props {
  team: TeamMember[]
  editing: boolean
  onChange: (team: TeamMember[]) => void
  dark?: boolean
}

export default function TabTeam({ team, editing, onChange, dark = true }: Props) {
  function updateMember(idx: number, field: keyof TeamMember, value: string) {
    const next = team.map((m, i) => i === idx ? { ...m, [field]: value } : m)
    onChange(next)
  }

  function addMember() {
    if (team.length >= 3) return
    onChange([...team, emptyTeamMember()])
  }

  function removeMember(idx: number) {
    onChange(team.filter((_, i) => i !== idx))
  }

  const cardStyle = {
    background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
  }

  return (
    <div className="space-y-6">
      {team.map((member, idx) => (
        <div key={idx} className="rounded-xl p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: dark ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>
              Участник {idx + 1}
            </span>
            {editing && team.length > 1 && (
              <button
                onClick={() => removeMember(idx)}
                className="hover:text-red-400 transition-colors"
                style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#d1d5db' }}
              >
                <Icon name="Trash2" size={15} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label="ФИО участника" dark={dark}>
              <ViewOrInput
                editing={editing}
                value={member.full_name}
                placeholder="Фамилия Имя Отчество"
                onChange={e => updateMember(idx, 'full_name', e.target.value)}
                dark={dark}
              />
            </FieldWrap>
            <FieldWrap label="Роль в проекте" dark={dark}>
              <ViewOrInput
                editing={editing}
                value={member.role}
                placeholder="Например: Руководитель проекта"
                onChange={e => updateMember(idx, 'role', e.target.value)}
                dark={dark}
              />
            </FieldWrap>
          </div>

          <FieldWrap label="Компетенции" dark={dark}>
            <ViewOrTextarea
              editing={editing}
              value={member.competencies}
              rows={2}
              placeholder="Опишите ключевые компетенции участника"
              onChange={e => updateMember(idx, 'competencies', e.target.value)}
              dark={dark}
            />
          </FieldWrap>

          <FieldWrap label="Резюме" hint="PDF, DOC, DOCX — до 10 МБ" dark={dark}>
            {editing ? (
              <div className="flex items-center gap-3">
                <label
                  className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-sm transition-colors"
                  style={{
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
                    background: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
                    color: dark ? 'rgba(255,255,255,0.6)' : '#6b7280',
                  }}
                >
                  <Icon name="Paperclip" size={15} />
                  {member.resume_filename ? member.resume_filename : 'Прикрепить файл'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 10 * 1024 * 1024) { alert('Файл слишком большой (максимум 10 МБ)'); return }
                      const reader = new FileReader()
                      reader.onload = () => {
                        updateMember(idx, 'resume_filename', file.name)
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
                {member.resume_filename && (
                  <button
                    onClick={() => { updateMember(idx, 'resume_filename', ''); updateMember(idx, 'resume_url', '') }}
                    className="hover:text-red-400 transition-colors"
                    style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#d1d5db' }}
                  >
                    <Icon name="X" size={15} />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm py-2" style={{ color: dark ? '#ffffff' : '#111827' }}>
                {member.resume_filename ? (
                  <span className="flex items-center gap-2 text-blue-400">
                    <Icon name="Paperclip" size={14} />
                    {member.resume_filename}
                  </span>
                ) : <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</span>}
              </div>
            )}
          </FieldWrap>
        </div>
      ))}

      {editing && team.length < 3 && (
        <button
          onClick={addMember}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition-colors"
        >
          <Icon name="UserPlus" size={16} />
          Добавить участника
        </button>
      )}
    </div>
  )
}
