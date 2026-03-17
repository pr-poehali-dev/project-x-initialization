import { FieldWrap, ViewOrInput } from './FormField'
import type { FullProject } from './types'

interface Props {
  data: FullProject
  editing: boolean
  onChange: (field: keyof FullProject, value: string | number | null) => void
}

function numStr(v: number | null | undefined): string {
  return v == null ? '' : String(v)
}

export default function TabResults({ data, editing, onChange }: Props) {
  function handleNum(field: keyof FullProject, val: string) {
    onChange(field, val === '' ? null : Number(val))
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FieldWrap label="Количество мероприятий">
          <ViewOrInput
            editing={editing}
            type="number"
            min={0}
            value={numStr(data.results_events_count)}
            placeholder="0"
            onChange={e => handleNum('results_events_count', e.target.value)}
          />
        </FieldWrap>

        <FieldWrap label="Крайняя дата выполнения">
          <ViewOrInput
            editing={editing}
            type="date"
            value={data.results_deadline}
            displayValue={data.results_deadline ? new Date(data.results_deadline).toLocaleDateString('ru-RU') : ''}
            onChange={e => onChange('results_deadline', e.target.value)}
          />
        </FieldWrap>

        <FieldWrap label="Количество участников мероприятий">
          <ViewOrInput
            editing={editing}
            type="number"
            min={0}
            value={numStr(data.results_participants_count)}
            placeholder="0"
            onChange={e => handleNum('results_participants_count', e.target.value)}
          />
        </FieldWrap>

        <FieldWrap label="Количество публикаций в СМИ и интернете">
          <ViewOrInput
            editing={editing}
            type="number"
            min={0}
            value={numStr(data.results_publications_count)}
            placeholder="0"
            onChange={e => handleNum('results_publications_count', e.target.value)}
          />
        </FieldWrap>

        <FieldWrap label="Количество просмотров публикаций">
          <ViewOrInput
            editing={editing}
            type="number"
            min={0}
            value={numStr(data.results_views_count)}
            placeholder="0"
            onChange={e => handleNum('results_views_count', e.target.value)}
          />
        </FieldWrap>
      </div>
    </div>
  )
}
