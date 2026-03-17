import Icon from '@/components/ui/icon'
import { FieldWrap, ViewOrInput, ViewOrTextarea, ViewOrSelect } from './FormField'
import { emptyExpense, EXPENSE_CATEGORIES } from './types'
import type { ExpenseItem } from './types'

interface Props {
  expenses: ExpenseItem[]
  editing: boolean
  onChange: (expenses: ExpenseItem[]) => void
  dark?: boolean
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 2 }).format(n)
}

export default function TabExpenses({ expenses, editing, onChange, dark = true }: Props) {
  function update(idx: number, field: keyof ExpenseItem, value: unknown) {
    onChange(expenses.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }

  function remove(idx: number) {
    onChange(expenses.filter((_, i) => i !== idx))
  }

  function add() {
    onChange([...expenses, emptyExpense()])
  }

  const total = expenses.reduce((sum, e) => sum + (e.price || 0) * (e.quantity || 0), 0)

  if (expenses.length === 0 && !editing) {
    return <p className="text-sm py-4" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>Статьи расходов не добавлены</p>
  }

  const cardStyle = {
    background: dark ? 'rgba(255,255,255,0.02)' : '#f9fafb',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
  }

  return (
    <div className="space-y-5">
      {expenses.map((item, idx) => {
        const lineTotal = (item.price || 0) * (item.quantity || 0)
        return (
          <div key={idx} className="rounded-xl p-5 space-y-4" style={cardStyle}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: dark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }}>Статья {idx + 1}</span>
              {editing && (
                <button onClick={() => remove(idx)} className="hover:text-red-400 transition-colors" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>
                  <Icon name="Trash2" size={15} />
                </button>
              )}
            </div>

            <FieldWrap label="Категория расходов" dark={dark}>
              <ViewOrSelect
                editing={editing}
                value={item.category}
                options={EXPENSE_CATEGORIES}
                onChange={e => update(idx, 'category', e.target.value)}
                dark={dark}
              />
            </FieldWrap>

            <FieldWrap label="Наименование товара/услуги" dark={dark}>
              <ViewOrInput
                editing={editing}
                value={item.item_name}
                placeholder="Название товара или услуги"
                onChange={e => update(idx, 'item_name', e.target.value)}
                dark={dark}
              />
            </FieldWrap>

            <FieldWrap label="Обоснование" dark={dark}>
              <ViewOrTextarea
                editing={editing}
                value={item.justification}
                rows={2}
                placeholder="Обоснование необходимости расхода..."
                onChange={e => update(idx, 'justification', e.target.value)}
                dark={dark}
              />
            </FieldWrap>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <FieldWrap label="Цена (₽)" dark={dark}>
                <ViewOrInput
                  editing={editing}
                  type="number" min={0} step={0.01}
                  value={item.price === 0 ? '' : String(item.price)}
                  displayValue={item.price ? formatCurrency(item.price) : ''}
                  placeholder="0.00"
                  onChange={e => update(idx, 'price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  dark={dark}
                />
              </FieldWrap>

              <FieldWrap label="Количество" dark={dark}>
                <ViewOrInput
                  editing={editing}
                  type="number" min={0} step={0.01}
                  value={item.quantity === 0 ? '' : String(item.quantity)}
                  placeholder="0"
                  onChange={e => update(idx, 'quantity', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                  dark={dark}
                />
              </FieldWrap>

              <FieldWrap label="Итого" dark={dark}>
                <div className="text-green-400 font-semibold text-sm py-2">
                  {formatCurrency(lineTotal)}
                </div>
              </FieldWrap>
            </div>
          </div>
        )
      })}

      {editing && (
        <button
          onClick={add}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm transition-colors"
        >
          <Icon name="Plus" size={16} />
          Добавить статью расходов
        </button>
      )}

      {expenses.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-green-500/20 bg-green-500/5 px-5 py-3">
          <span className="text-sm font-medium" style={{ color: dark ? 'rgba(255,255,255,0.6)' : '#374151' }}>Общая сумма расходов</span>
          <span className="text-green-400 font-bold text-lg">{formatCurrency(total)}</span>
        </div>
      )}
    </div>
  )
}
