import { FieldWrap, ViewOrInput, ViewOrSelect } from './FormField'
import { SCALE_OPTIONS } from './types'
import type { FullProject } from './types'

interface Props {
  data: FullProject
  editing: boolean
  errors: Record<string, string>
  onChange: (field: keyof FullProject, value: string) => void
}

export default function TabGeneral({ data, editing, errors, onChange }: Props) {
  return (
    <div className="space-y-5">
      <FieldWrap label="Название проекта" required error={errors.title}>
        <ViewOrInput
          editing={editing}
          value={data.title}
          placeholder="Введите название проекта"
          onChange={e => onChange('title', e.target.value)}
        />
      </FieldWrap>

      <FieldWrap label="Масштаб реализации">
        <ViewOrSelect
          editing={editing}
          value={data.scale}
          options={SCALE_OPTIONS}
          onChange={e => onChange('scale', e.target.value)}
        />
      </FieldWrap>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldWrap label="Дата начала реализации">
          <ViewOrInput
            editing={editing}
            type="date"
            value={data.start_date}
            displayValue={data.start_date ? new Date(data.start_date).toLocaleDateString('ru-RU') : ''}
            onChange={e => onChange('start_date', e.target.value)}
          />
        </FieldWrap>
        <FieldWrap label="Дата окончания реализации">
          <ViewOrInput
            editing={editing}
            type="date"
            value={data.end_date}
            displayValue={data.end_date ? new Date(data.end_date).toLocaleDateString('ru-RU') : ''}
            onChange={e => onChange('end_date', e.target.value)}
          />
        </FieldWrap>
      </div>

      <FieldWrap label="Грантодающий фонд">
        <ViewOrInput
          editing={editing}
          value={data.grant_fund}
          placeholder="Название фонда или конкурса"
          onChange={e => onChange('grant_fund', e.target.value)}
        />
      </FieldWrap>

      <FieldWrap label="Крайний срок подачи заявки">
        <ViewOrInput
          editing={editing}
          type="date"
          value={data.deadline}
          displayValue={data.deadline ? new Date(data.deadline).toLocaleDateString('ru-RU') : ''}
          onChange={e => onChange('deadline', e.target.value)}
        />
      </FieldWrap>

      <FieldWrap label="Бюджет проекта">
        <ViewOrInput
          editing={editing}
          value={data.budget}
          placeholder="Например: 500 000 руб."
          onChange={e => onChange('budget', e.target.value)}
        />
      </FieldWrap>
    </div>
  )
}
