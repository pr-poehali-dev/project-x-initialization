import { FieldWrap, ViewOrInput, ViewOrTextarea } from './FormField'
import type { FullProject } from './types'

interface Props {
  data: FullProject
  editing: boolean
  errors: Record<string, string>
  onChange: (field: keyof FullProject, value: string) => void
  dark?: boolean
}

const FIELDS: { key: keyof FullProject; label: string; multiline?: boolean; rows?: number }[] = [
  { key: 'short_description', label: 'Краткая информация о проекте', multiline: true, rows: 3 },
  { key: 'problem', label: 'Описание проблемы, решению которой посвящён проект', multiline: true, rows: 4 },
  { key: 'target_audience', label: 'Основные целевые группы', multiline: true, rows: 3 },
  { key: 'goal', label: 'Основная цель проекта', multiline: true, rows: 3 },
  { key: 'description', label: 'Описание проекта', multiline: true, rows: 4 },
  { key: 'experience', label: 'Опыт успешной реализации проекта', multiline: true, rows: 3 },
  { key: 'prospects', label: 'Перспектива развития и потенциал проекта', multiline: true, rows: 3 },
  { key: 'geography', label: 'География проекта', multiline: false },
]

export default function TabAbout({ data, editing, errors, onChange, dark = true }: Props) {
  return (
    <div className="space-y-5">
      {FIELDS.map(f => (
        <FieldWrap key={f.key as string} label={f.label} error={errors[f.key as string]} dark={dark}>
          {f.multiline ? (
            <ViewOrTextarea
              editing={editing}
              value={(data[f.key] as string) ?? ''}
              rows={f.rows}
              placeholder={`${f.label}...`}
              onChange={e => onChange(f.key, e.target.value)}
              dark={dark}
            />
          ) : (
            <ViewOrInput
              editing={editing}
              value={(data[f.key] as string) ?? ''}
              placeholder={f.label}
              onChange={e => onChange(f.key, e.target.value)}
              dark={dark}
            />
          )}
        </FieldWrap>
      ))}
    </div>
  )
}
