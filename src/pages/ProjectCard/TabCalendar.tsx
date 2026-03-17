import Icon from '@/components/ui/icon'
import { FieldWrap, ViewOrInput, ViewOrTextarea } from './FormField'
import { emptyTask, emptyEvent } from './types'
import type { ProjectTask, ProjectEvent } from './types'

interface Props {
  tasks: ProjectTask[]
  editing: boolean
  onChange: (tasks: ProjectTask[]) => void
  dark?: boolean
}

function numStr(v: number | null | undefined): string {
  return v == null ? '' : String(v)
}

export default function TabCalendar({ tasks, editing, onChange, dark = true }: Props) {
  function updateTask(tIdx: number, field: keyof ProjectTask, value: unknown) {
    onChange(tasks.map((t, i) => i === tIdx ? { ...t, [field]: value } : t))
  }

  function removeTask(tIdx: number) {
    onChange(tasks.filter((_, i) => i !== tIdx))
  }

  function addTask() {
    onChange([...tasks, emptyTask()])
  }

  function updateEvent(tIdx: number, eIdx: number, field: keyof ProjectEvent, value: unknown) {
    const updatedEvents = tasks[tIdx].events.map((e, i) => i === eIdx ? { ...e, [field]: value } : e)
    updateTask(tIdx, 'events', updatedEvents)
  }

  function addEvent(tIdx: number) {
    const events = [...tasks[tIdx].events, emptyEvent()]
    updateTask(tIdx, 'events', events)
  }

  function removeEvent(tIdx: number, eIdx: number) {
    const events = tasks[tIdx].events.filter((_, i) => i !== eIdx)
    updateTask(tIdx, 'events', events)
  }

  function numChange(tIdx: number, eIdx: number, field: keyof ProjectEvent, val: string) {
    updateEvent(tIdx, eIdx, field, val === '' ? null : Number(val))
  }

  if (tasks.length === 0 && !editing) {
    return <p className="text-sm py-4" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>Задачи не добавлены</p>
  }

  const taskCardStyle = {
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
    borderRadius: '12px',
    overflow: 'hidden',
  }

  const taskHeaderStyle = {
    background: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
  }

  const eventCardStyle = {
    background: dark ? 'rgba(0,0,0,0.2)' : '#f3f4f6',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#e5e7eb'}`,
    borderRadius: '8px',
  }

  return (
    <div className="space-y-6">
      {tasks.map((task, tIdx) => (
        <div key={tIdx} style={taskCardStyle}>
          <div className="flex items-start gap-3 p-4" style={taskHeaderStyle}>
            <div className="flex-1">
              <FieldWrap label={`Задача ${tIdx + 1}`} dark={dark}>
                <ViewOrTextarea
                  editing={editing}
                  value={task.task_name}
                  rows={2}
                  placeholder="Поставленная задача..."
                  onChange={e => updateTask(tIdx, 'task_name', e.target.value)}
                  dark={dark}
                />
              </FieldWrap>
            </div>
            {editing && (
              <button
                onClick={() => removeTask(tIdx)}
                className="hover:text-red-400 transition-colors mt-6 flex-shrink-0"
                style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}
              >
                <Icon name="Trash2" size={15} />
              </button>
            )}
          </div>

          <div className="p-4 space-y-4">
            {task.events.map((ev, eIdx) => (
              <div key={eIdx} className="p-4 space-y-3" style={eventCardStyle}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>Мероприятие {eIdx + 1}</span>
                  {editing && (
                    <button
                      onClick={() => removeEvent(tIdx, eIdx)}
                      className="hover:text-red-400 transition-colors"
                      style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}
                    >
                      <Icon name="X" size={14} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldWrap label="Название мероприятия" dark={dark}>
                    <ViewOrInput
                      editing={editing}
                      value={ev.event_name}
                      placeholder="Название..."
                      onChange={e => updateEvent(tIdx, eIdx, 'event_name', e.target.value)}
                      dark={dark}
                    />
                  </FieldWrap>
                  <FieldWrap label="Крайняя дата выполнения" dark={dark}>
                    <ViewOrInput
                      editing={editing}
                      type="date"
                      value={ev.deadline}
                      displayValue={ev.deadline ? new Date(ev.deadline).toLocaleDateString('ru-RU') : ''}
                      onChange={e => updateEvent(tIdx, eIdx, 'deadline', e.target.value)}
                      dark={dark}
                    />
                  </FieldWrap>
                </div>

                <FieldWrap label="Описание мероприятия" dark={dark}>
                  <ViewOrTextarea
                    editing={editing}
                    value={ev.event_description}
                    rows={2}
                    placeholder="Описание..."
                    onChange={e => updateEvent(tIdx, eIdx, 'event_description', e.target.value)}
                    dark={dark}
                  />
                </FieldWrap>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <FieldWrap label="Уникальных участников" dark={dark}>
                    <ViewOrInput
                      editing={editing}
                      type="number" min={0}
                      value={numStr(ev.unique_participants)}
                      placeholder="0"
                      onChange={e => numChange(tIdx, eIdx, 'unique_participants', e.target.value)}
                      dark={dark}
                    />
                  </FieldWrap>
                  <FieldWrap label="Повторных участников" dark={dark}>
                    <ViewOrInput
                      editing={editing}
                      type="number" min={0}
                      value={numStr(ev.repeat_participants)}
                      placeholder="0"
                      onChange={e => numChange(tIdx, eIdx, 'repeat_participants', e.target.value)}
                      dark={dark}
                    />
                  </FieldWrap>
                  <FieldWrap label="Публикаций в СМИ" dark={dark}>
                    <ViewOrInput
                      editing={editing}
                      type="number" min={0}
                      value={numStr(ev.publications_count)}
                      placeholder="0"
                      onChange={e => numChange(tIdx, eIdx, 'publications_count', e.target.value)}
                      dark={dark}
                    />
                  </FieldWrap>
                  <FieldWrap label="Просмотров" dark={dark}>
                    <ViewOrInput
                      editing={editing}
                      type="number" min={0}
                      value={numStr(ev.views_count)}
                      placeholder="0"
                      onChange={e => numChange(tIdx, eIdx, 'views_count', e.target.value)}
                      dark={dark}
                    />
                  </FieldWrap>
                </div>

                <FieldWrap label="Дополнительная информация" dark={dark}>
                  <ViewOrTextarea
                    editing={editing}
                    value={ev.extra_info}
                    rows={2}
                    placeholder="Дополнительно..."
                    onChange={e => updateEvent(tIdx, eIdx, 'extra_info', e.target.value)}
                    dark={dark}
                  />
                </FieldWrap>
              </div>
            ))}

            {editing && (
              <button
                onClick={() => addEvent(tIdx)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                <Icon name="Plus" size={15} />
                Добавить мероприятие
              </button>
            )}
          </div>
        </div>
      ))}

      {editing && (
        <button
          onClick={addTask}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition-colors"
        >
          <Icon name="ListPlus" size={16} />
          Добавить задачу
        </button>
      )}
    </div>
  )
}
