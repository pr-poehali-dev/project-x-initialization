import Icon from '@/components/ui/icon'

const CATEGORIES = ['Все', 'Молодёжь', 'Культура', 'Наука', 'Образование', 'Спорт', 'Социальный', 'Экология', 'Другое']

interface ThemeTokens {
  inputBg: string
  inputBorder: string
  text: string
  textMuted: string
  tagBg: string
  tagActiveBg: string
  tagActiveText: string
  tagText: string
}

interface EventsFiltersProps {
  search: string
  category: string
  t: ThemeTokens
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

export default function EventsFilters({ search, category, t, onSearchChange, onCategoryChange }: EventsFiltersProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="relative">
        <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
        <input
          type="text"
          placeholder="Поиск по названию или организатору..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors duration-300"
          style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.text }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={
              category === cat
                ? { background: t.tagActiveBg, color: t.tagActiveText }
                : { background: t.tagBg, color: t.tagText }
            }
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
