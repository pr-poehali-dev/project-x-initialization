import Icon from '@/components/ui/icon'
import { FieldWrap, ViewOrInput, ViewOrTextarea } from './FormField'
import { emptyMedia, MONTHS } from './types'
import type { MediaResource } from './types'

interface Props {
  media: MediaResource[]
  editing: boolean
  onChange: (media: MediaResource[]) => void
  dark?: boolean
}

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 1)

function parseMonth(val: string): { month: string; year: string } {
  if (!val) return { month: '', year: '' }
  const [m, y] = val.split('-')
  return { month: m || '', year: y || '' }
}

function formatMonth(month: string, year: string): string {
  if (!month && !year) return ''
  return `${month}-${year}`
}

function displayMonth(val: string): string {
  if (!val) return ''
  const [m, y] = val.split('-')
  const mNum = parseInt(m)
  const mName = mNum >= 1 && mNum <= 12 ? MONTHS[mNum - 1] : m
  return `${mName} ${y}`
}

export default function TabMedia({ media, editing, onChange, dark = true }: Props) {
  function update(idx: number, field: keyof MediaResource, value: unknown) {
    onChange(media.map((m, i) => i === idx ? { ...m, [field]: value } : m))
  }

  function remove(idx: number) {
    onChange(media.filter((_, i) => i !== idx))
  }

  function add() {
    onChange([...media, emptyMedia()])
  }

  if (media.length === 0 && !editing) {
    return <p className="text-sm py-4" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>Медиа-ресурсы не добавлены</p>
  }

  const cardStyle = {
    background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
  }

  const selectStyle = {
    background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
    color: dark ? '#ffffff' : '#111827',
  }

  const optionBg = dark ? '#1f2937' : '#ffffff'

  return (
    <div className="space-y-5">
      {media.map((item, idx) => (
        <div key={idx} className="rounded-xl p-5 space-y-4" style={cardStyle}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>Ресурс {idx + 1}</span>
            {editing && (
              <button onClick={() => remove(idx)} className="hover:text-red-400 transition-colors" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>
                <Icon name="Trash2" size={15} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label="Название ресурса" dark={dark}>
              <ViewOrInput
                editing={editing}
                value={item.resource_name}
                placeholder="Например: VK, Telegram, РИА Новости"
                onChange={e => update(idx, 'resource_name', e.target.value)}
                dark={dark}
              />
            </FieldWrap>

            <FieldWrap label="Месяц публикации" dark={dark}>
              {editing ? (
                <div className="flex gap-2">
                  <select
                    value={parseMonth(item.publication_month).month}
                    onChange={e => {
                      const { year } = parseMonth(item.publication_month)
                      update(idx, 'publication_month', formatMonth(e.target.value, year))
                    }}
                    className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={selectStyle}
                  >
                    <option value="" style={{ background: optionBg }}>Месяц</option>
                    {MONTHS.map((m, i) => (
                      <option key={i} value={String(i + 1).padStart(2, '0')} style={{ background: optionBg }}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={parseMonth(item.publication_month).year}
                    onChange={e => {
                      const { month } = parseMonth(item.publication_month)
                      update(idx, 'publication_month', formatMonth(month, e.target.value))
                    }}
                    className="w-24 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    style={selectStyle}
                  >
                    <option value="" style={{ background: optionBg }}>Год</option>
                    {YEARS.map(y => (
                      <option key={y} value={String(y)} style={{ background: optionBg }}>{y}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="text-sm py-2" style={{ color: dark ? '#ffffff' : '#111827' }}>
                  {item.publication_month ? displayMonth(item.publication_month) : <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</span>}
                </div>
              )}
            </FieldWrap>

            <FieldWrap label="Планируемое количество просмотров" dark={dark}>
              <ViewOrInput
                editing={editing}
                type="number" min={0}
                value={item.planned_views == null ? '' : String(item.planned_views)}
                placeholder="0"
                onChange={e => update(idx, 'planned_views', e.target.value === '' ? null : Number(e.target.value))}
                dark={dark}
              />
            </FieldWrap>
          </div>

          <FieldWrap label="Ссылки на ресурсы" hint="Несколько ссылок — через запятую или с новой строки" dark={dark}>
            <ViewOrTextarea
              editing={editing}
              value={item.resource_links}
              rows={2}
              placeholder="https://..."
              onChange={e => update(idx, 'resource_links', e.target.value)}
              dark={dark}
            />
          </FieldWrap>

          <FieldWrap label="Почему выбран такой формат" dark={dark}>
            <ViewOrTextarea
              editing={editing}
              value={item.format_reason}
              rows={2}
              placeholder="Обоснование выбора ресурса..."
              onChange={e => update(idx, 'format_reason', e.target.value)}
              dark={dark}
            />
          </FieldWrap>
        </div>
      ))}

      {editing && (
        <button
          onClick={add}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition-colors"
        >
          <Icon name="Plus" size={16} />
          Добавить ресурс
        </button>
      )}
    </div>
  )
}
