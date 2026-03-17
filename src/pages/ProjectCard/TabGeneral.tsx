import { FieldWrap, ViewOrInput, ViewOrSelect } from './FormField'
import { SCALE_OPTIONS } from './types'
import type { FullProject } from './types'

interface Props {
  data: FullProject
  editing: boolean
  errors: Record<string, string>
  onChange: (field: keyof FullProject, value: string) => void
  dark?: boolean
}

export default function TabGeneral({ data, editing, errors, onChange, dark = true }: Props) {
  return (
    <div className="space-y-5">
      <FieldWrap label="Название проекта" required error={errors.title} dark={dark}>
        <ViewOrInput
          editing={editing}
          value={data.title}
          placeholder="Введите название проекта"
          onChange={e => onChange('title', e.target.value)}
          dark={dark}
        />
      </FieldWrap>

      <FieldWrap label="Масштаб реализации" dark={dark}>
        <ViewOrSelect
          editing={editing}
          value={data.scale}
          options={SCALE_OPTIONS}
          onChange={e => onChange('scale', e.target.value)}
          dark={dark}
        />
      </FieldWrap>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldWrap label="Дата начала реализации" dark={dark}>
          <ViewOrInput
            editing={editing}
            type="date"
            value={data.start_date}
            displayValue={data.start_date ? new Date(data.start_date).toLocaleDateString('ru-RU') : ''}
            onChange={e => onChange('start_date', e.target.value)}
            dark={dark}
          />
        </FieldWrap>
        <FieldWrap label="Дата окончания реализации" dark={dark}>
          <ViewOrInput
            editing={editing}
            type="date"
            value={data.end_date}
            displayValue={data.end_date ? new Date(data.end_date).toLocaleDateString('ru-RU') : ''}
            onChange={e => onChange('end_date', e.target.value)}
            dark={dark}
          />
        </FieldWrap>
      </div>

      <FieldWrap label="Грантодающий фонд" dark={dark}>
        <ViewOrInput
          editing={editing}
          value={data.grant_fund}
          placeholder="Название фонда или конкурса"
          onChange={e => onChange('grant_fund', e.target.value)}
          dark={dark}
        />
      </FieldWrap>

      <FieldWrap label="Крайний срок подачи заявки" dark={dark}>
        <ViewOrInput
          editing={editing}
          type="date"
          value={data.deadline}
          displayValue={data.deadline ? new Date(data.deadline).toLocaleDateString('ru-RU') : ''}
          onChange={e => onChange('deadline', e.target.value)}
          dark={dark}
        />
      </FieldWrap>

      <FieldWrap label="Бюджет проекта" dark={dark}>
        <ViewOrInput
          editing={editing}
          value={data.budget}
          placeholder="Например: 500 000 руб."
          onChange={e => onChange('budget', e.target.value)}
          dark={dark}
        />
      </FieldWrap>
    </div>
  )
}
