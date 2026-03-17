interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
}

export function FieldWrap({ label, required, error, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/70 text-sm font-medium">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-white/30 text-xs">{hint}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  editing: boolean
  displayValue?: string
}

export function ViewOrInput({ editing, displayValue, className = '', ...props }: InputProps) {
  if (!editing) {
    return (
      <div className="text-white text-sm py-2 min-h-[36px]">
        {displayValue ?? (props.value as string) ?? <span className="text-white/20">—</span>}
      </div>
    )
  }
  return (
    <input
      {...props}
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors ${className}`}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  editing: boolean
  displayValue?: string
}

export function ViewOrTextarea({ editing, displayValue, className = '', ...props }: TextareaProps) {
  if (!editing) {
    return (
      <div className="text-white text-sm py-2 whitespace-pre-wrap min-h-[36px]">
        {(displayValue ?? (props.value as string)) || <span className="text-white/20">—</span>}
      </div>
    )
  }
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-green-500/50 transition-colors resize-none ${className}`}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  editing: boolean
  displayValue?: string
  options: { value: string; label: string }[]
}

export function ViewOrSelect({ editing, displayValue, options, className = '', ...props }: SelectProps) {
  if (!editing) {
    return (
      <div className="text-white text-sm py-2 min-h-[36px]">
        {displayValue || options.find(o => o.value === props.value)?.label || <span className="text-white/20">—</span>}
      </div>
    )
  }
  return (
    <select
      {...props}
      className={`w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500/50 transition-colors ${className}`}
    >
      <option value="" className="bg-gray-900">Выберите...</option>
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-gray-900">{o.label}</option>
      ))}
    </select>
  )
}