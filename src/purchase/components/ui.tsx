import type { InputHTMLAttributes, ReactNode } from 'react'

export function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} tabIndex={-1} className="mt-1 text-sm font-medium text-red-700">
      {message}
    </p>
  )
}

/** Fajfka nebo pomlčka v tabulce. Čtečka přečte „Ano“ nebo „Ne“, ne název znaku. */
export function YesNoMark({ yes }: { yes: boolean }) {
  return (
    <>
      <span aria-hidden="true">{yes ? '✓' : '–'}</span>
      <span className="sr-only">{yes ? 'Ano' : 'Ne'}</span>
    </>
  )
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
}

export function TextField({ id, label, value, onChange, error, hint, ...rest }: TextFieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ')
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-slate-600">
          {hint}
        </p>
      )}
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={`mt-1 block min-h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${
          error ? 'border-red-700' : 'border-slate-400'
        }`}
        {...rest}
      />
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

interface Option<T extends string> {
  value: T
  label: string
  description?: string
}

interface ChoiceCardsProps<T extends string> {
  name: string
  legend: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  error?: string
  hint?: string
  columns?: 1 | 2 | 3
}

/** Výběr jedné možnosti jako velké karty. Uvnitř jsou nativní radio inputy kvůli klávesnici. */
export function ChoiceCards<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  hint,
  columns = 1,
}: ChoiceCardsProps<T>) {
  const grid = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns]
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="text-base font-semibold text-slate-900">{legend}</legend>
      {hint && <p className="text-sm text-slate-600">{hint}</p>}
      <div className={`mt-2 grid gap-2 ${grid}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border-2 bg-white p-3 has-checked:border-brand-700 has-checked:bg-brand-50 has-focus-visible:outline-3 has-focus-visible:outline-brand-800 has-focus-visible:outline-offset-2 ${
              error ? 'border-red-700' : 'border-slate-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="mt-1 size-5 shrink-0 accent-brand-700"
            />
            <span>
              <span className="block font-semibold text-slate-900">{option.label}</span>
              {option.description && (
                <span className="block text-sm text-slate-600">{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      <ErrorText id={`${name}-error`} message={error} />
    </fieldset>
  )
}

interface YesNoProps {
  name: string
  legend: string
  value: boolean | null
  onChange: (value: boolean) => void
  error?: string
  hint?: string
  yesLabel?: string
  noLabel?: string
}

export function YesNo({
  name,
  legend,
  value,
  onChange,
  error,
  hint,
  yesLabel,
  noLabel,
}: YesNoProps) {
  return (
    <ChoiceCards
      name={name}
      legend={legend}
      hint={hint}
      error={error}
      columns={2}
      value={value === null ? null : value ? 'yes' : 'no'}
      onChange={(next) => onChange(next === 'yes')}
      options={[
        { value: 'yes', label: yesLabel ?? 'Ano' },
        { value: 'no', label: noLabel ?? 'Ne' },
      ]}
    />
  )
}

interface CounterProps {
  id: string
  label: string
  hint?: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  /** Text pro čtečky, např. „dospělého“ v „Přidat dospělého“. */
  unitLabel: string
}

export function Counter({ id, label, hint, value, min, max, onChange, unitLabel }: CounterProps) {
  const buttonClass =
    'flex size-12 items-center justify-center rounded-full border-2 border-brand-700 text-2xl font-bold text-brand-700 disabled:border-slate-300 disabled:text-slate-400'
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p id={`${id}-label`} className="font-semibold text-slate-900">
          {label}
        </p>
        {hint && <p className="text-sm text-slate-600">{hint}</p>}
      </div>
      <div className="flex items-center gap-3" role="group" aria-labelledby={`${id}-label`}>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Ubrat ${unitLabel}`}
        >
          −
        </button>
        <output aria-live="polite" className="w-6 text-center text-xl font-bold">
          {value}
        </output>
        <button
          type="button"
          className={buttonClass}
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`Přidat ${unitLabel}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

interface CheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  error?: string
  disabled?: boolean
}

export function Checkbox({ id, checked, onChange, children, error, disabled }: CheckboxProps) {
  return (
    <div>
      <label htmlFor={id} className="flex min-h-12 cursor-pointer items-start gap-3 py-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 accent-brand-700"
        />
        <span className="text-slate-800">{children}</span>
      </label>
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}
