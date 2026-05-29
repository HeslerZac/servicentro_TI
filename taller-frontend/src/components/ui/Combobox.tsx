import { useId } from 'react'

interface ComboboxProps<T> {
  label: string
  options: T[]
  value: string
  onChange: (value: string) => void
  displayValue: (item: T) => string
  valueKey: (item: T) => string
  error?: string
  disabled?: boolean
}

export function Combobox<T>({ label, options, value, onChange, displayValue, valueKey, error, disabled }: ComboboxProps<T>) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        list={`${id}-list`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
        disabled={disabled}
      />
      <datalist id={`${id}-list`}>
        {options.map((item, index) => (
          <option key={index} value={valueKey(item)}>
            {displayValue(item)}
          </option>
        ))}
      </datalist>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
