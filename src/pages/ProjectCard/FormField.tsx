import React from 'react'

interface FieldProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
  hint?: string
  dark?: boolean
}

export function FieldWrap({ label, required, error, children, hint, dark = true }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: dark ? 'rgba(255,255,255,0.7)' : '#374151' }}>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }}>{hint}</p>}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  editing: boolean
  displayValue?: string
  dark?: boolean
}

export function ViewOrInput({ editing, displayValue, dark = true, className = '', ...props }: InputProps) {
  if (!editing) {
    return (
      <div className="text-sm py-2 min-h-[36px]" style={{ color: dark ? '#ffffff' : '#111827' }}>
        {displayValue ?? (props.value as string) ?? <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</span>}
      </div>
    )
  }
  return (
    <input
      {...props}
      className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${className}`}
      style={{
        background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
        color: dark ? '#ffffff' : '#111827',
        ...(props.style || {}),
      }}
      placeholder={props.placeholder}
    />
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  editing: boolean
  displayValue?: string
  dark?: boolean
}

export function ViewOrTextarea({ editing, displayValue, dark = true, className = '', ...props }: TextareaProps) {
  if (!editing) {
    return (
      <div className="text-sm py-2 whitespace-pre-wrap min-h-[36px]" style={{ color: dark ? '#ffffff' : '#111827' }}>
        {(displayValue ?? (props.value as string)) || <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</span>}
      </div>
    )
  }
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors resize-none ${className}`}
      style={{
        background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
        color: dark ? '#ffffff' : '#111827',
        ...(props.style || {}),
      }}
      placeholder={props.placeholder}
    />
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  editing: boolean
  displayValue?: string
  options: { value: string; label: string }[]
  dark?: boolean
}

export function ViewOrSelect({ editing, displayValue, options, dark = true, className = '', ...props }: SelectProps) {
  if (!editing) {
    return (
      <div className="text-sm py-2 min-h-[36px]" style={{ color: dark ? '#ffffff' : '#111827' }}>
        {displayValue || options.find(o => o.value === props.value)?.label || <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</span>}
      </div>
    )
  }
  return (
    <select
      {...props}
      className={`w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-colors ${className}`}
      style={{
        background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#d1d5db'}`,
        color: dark ? '#ffffff' : '#111827',
        ...(props.style || {}),
      }}
    >
      <option value="" style={{ background: dark ? '#1f2937' : '#ffffff' }}>Выберите...</option>
      {options.map(o => (
        <option key={o.value} value={o.value} style={{ background: dark ? '#1f2937' : '#ffffff' }}>{o.label}</option>
      ))}
    </select>
  )
}
