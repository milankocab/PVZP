import { Check, Info, Minus, Plus, type LucideIcon } from 'lucide-react'
import { useState, type InputHTMLAttributes, type ReactNode } from 'react'

import { TONES, type Tone } from './tones'

export type { Tone }

export function IconBadge({
  icon: Icon,
  tone = 'brand',
  size = 'md',
}: {
  icon: LucideIcon
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
}) {
  const box = { sm: 'size-8 rounded-lg', md: 'size-10 rounded-xl', lg: 'size-12 rounded-2xl' }[size]
  const glyph = { sm: 'size-4', md: 'size-5', lg: 'size-6' }[size]
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center ${box} ${TONES[tone]}`}
    >
      <Icon className={glyph} strokeWidth={2.2} />
    </span>
  )
}

export function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} tabIndex={-1} className="mt-1.5 animate-fade text-sm font-medium text-red-700">
      {message}
    </p>
  )
}

/** Fajfka nebo pomlčka v tabulce. Čtečka přečte „Ano“ nebo „Ne“, ne název znaku. */
export function YesNoMark({ yes }: { yes: boolean }) {
  return (
    <>
      {yes ? (
        <span
          aria-hidden="true"
          className="inline-flex size-6 items-center justify-center rounded-full bg-brand-100 text-brand-700"
        >
          <Check className="size-4" strokeWidth={3} />
        </span>
      ) : (
        <span aria-hidden="true" className="text-slate-400">
          –
        </span>
      )}
      <span className="sr-only">{yes ? 'Ano' : 'Ne'}</span>
    </>
  )
}

/** Neutrální informace. Není to chyba, proto modrá, ne červená. */
export function InfoNote({
  children,
  icon: Icon = Info,
}: {
  children: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="flex animate-rise gap-3 rounded-xl bg-sky-50 p-3 text-sm text-sky-950 ring-1 ring-sky-200">
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-sky-700" />
      <div>{children}</div>
    </div>
  )
}

const fieldClass =
  'mt-1.5 block min-h-12 w-full min-w-0 rounded-xl border-2 bg-white px-3 text-base text-ink transition-colors placeholder:text-slate-400 hover:border-brand-300 focus:border-brand-500 focus:outline-none focus-visible:outline-none focus:ring-4 focus:ring-brand-100'

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
    <div className="min-w-0">
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
        className={`${fieldClass} ${error ? 'border-red-700' : 'border-slate-200'}`}
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
  icon?: LucideIcon
  tone?: Tone
}

interface ChoiceCardsProps<T extends string> {
  name: string
  legend: string
  /** Legenda jen pro čtečky, když skupinu už pojmenovává nadpis sekce. */
  legendHidden?: boolean
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  error?: string
  hint?: string
  /** Počet sloupců i na mobilu. Krátké možnosti vedle sebe ušetří scrollování. */
  columns?: 1 | 2 | 3
  /** Ikona nad textem. Úzká dlaždice pak nemusí lámat popis po jednom slově. */
  stacked?: boolean
}

const tileClass =
  'group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-3 transition duration-200 hover:border-brand-300 active:scale-[0.97] has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:shadow-[0_6px_20px_-8px_rgb(18_160_145/0.55)] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-800'

/** Zaškrtnutí v rohu dlaždice. Objeví se s malým odskokem. */
function TileCheck({ shape = 'circle' }: { shape?: 'circle' | 'square' }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-2 right-2 flex size-5 scale-50 items-center justify-center bg-brand-500 text-white opacity-0 transition duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] group-has-checked:scale-100 group-has-checked:opacity-100 ${
        shape === 'circle' ? 'rounded-full' : 'rounded-md'
      }`}
    >
      <Check className="size-3.5" strokeWidth={3.5} />
    </span>
  )
}

/** Výběr jedné možnosti jako dlaždice. Uvnitř jsou nativní radio inputy kvůli klávesnici. */
export function ChoiceCards<T extends string>({
  name,
  legend,
  legendHidden,
  options,
  value,
  onChange,
  error,
  hint,
  columns = 1,
  stacked = false,
}: ChoiceCardsProps<T>) {
  const grid = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3' }[columns]
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined} className="min-w-0">
      <legend className={legendHidden ? 'sr-only' : 'text-base font-bold text-ink'}>
        {legend}
      </legend>
      {hint && <p className="text-sm text-slate-600">{hint}</p>}
      <div className={`mt-2 grid gap-2.5 ${grid}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`${tileClass} ${stacked ? 'flex-col items-start' : ''} ${
              error ? 'border-red-700' : 'border-slate-200'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon && <IconBadge icon={option.icon} tone={option.tone} />}
            <span className="min-w-0 pr-6">
              <span className="block leading-tight font-bold text-ink">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-sm leading-snug text-slate-600">
                  {option.description}
                </span>
              )}
            </span>
            <TileCheck />
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
  yesIcon?: LucideIcon
  noIcon?: LucideIcon
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
  yesIcon,
  noIcon,
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
        { value: 'yes', label: yesLabel ?? 'Ano', icon: yesIcon, tone: 'brand' },
        { value: 'no', label: noLabel ?? 'Ne', icon: noIcon, tone: 'slate' },
      ]}
    />
  )
}

interface ChipOption<T extends string> {
  value: T
  label: string
  description?: string
  icon: LucideIcon
  tone?: Tone
}

/** Výběr více možností jako dlaždice s ikonou. Uvnitř jsou nativní checkboxy. */
export function ChoiceChips<T extends string>({
  name,
  legend,
  options,
  values,
  onChange,
  error,
}: {
  name: string
  legend: string
  options: ChipOption<T>[]
  values: T[]
  onChange: (values: T[]) => void
  error?: string
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined} className="min-w-0">
      <legend className="text-base font-bold text-ink">{legend}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2.5">
        {options.map((option, index) => (
          <label
            key={option.value}
            style={{ animationDelay: `${index * 35}ms` }}
            className={`${tileClass} animate-rise flex-col items-start gap-2 ${
              error ? 'border-red-700' : 'border-slate-200'
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={values.includes(option.value)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...values, option.value]
                    : values.filter((value) => value !== option.value),
                )
              }
              className="sr-only"
            />
            <IconBadge icon={option.icon} tone={option.tone} size="sm" />
            <span className="min-w-0 pr-3">
              <span className="block text-sm leading-tight font-bold text-ink">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs leading-snug text-slate-600">
                  {option.description}
                </span>
              )}
            </span>
            <TileCheck shape="square" />
          </label>
        ))}
      </div>
      <ErrorText id={`${name}-error`} message={error} />
    </fieldset>
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
  icon?: LucideIcon
  tone?: Tone
}

/** Počítadlo plus a minus. Číslo při změně vyjede nahoru nebo dolů podle směru. */
export function Counter({
  id,
  label,
  hint,
  value,
  min,
  max,
  onChange,
  unitLabel,
  icon,
  tone,
}: CounterProps) {
  const [direction, setDirection] = useState<'up' | 'down' | null>(null)
  const buttonClass =
    'flex size-11 items-center justify-center rounded-full bg-brand-50 text-brand-700 ring-2 ring-brand-200 transition duration-150 hover:bg-brand-100 active:scale-85 active:bg-brand-500 active:text-white disabled:bg-slate-50 disabled:text-slate-300 disabled:ring-slate-200 disabled:active:scale-100'
  const change = (next: number) => {
    setDirection(next > value ? 'up' : 'down')
    onChange(next)
  }
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && <IconBadge icon={icon} tone={tone} />}
        <div className="min-w-0">
          <p id={`${id}-label`} className="leading-tight font-bold text-ink">
            {label}
          </p>
          {hint && <p className="text-sm text-slate-600">{hint}</p>}
        </div>
      </div>
      <div
        className="flex shrink-0 items-center gap-1.5"
        role="group"
        aria-labelledby={`${id}-label`}
      >
        <button
          type="button"
          className={buttonClass}
          onClick={() => change(value - 1)}
          disabled={value <= min}
          aria-label={`Ubrat ${unitLabel}`}
        >
          <Minus aria-hidden="true" className="size-5" strokeWidth={2.75} />
        </button>
        <output
          aria-live="polite"
          className="flex h-11 w-9 items-center justify-center overflow-hidden text-xl font-extrabold text-ink tabular-nums"
        >
          <span
            key={value}
            className={
              direction === 'up' ? 'animate-num-up' : direction === 'down' ? 'animate-num-down' : ''
            }
          >
            {value}
          </span>
        </output>
        <button
          type="button"
          className={buttonClass}
          onClick={() => change(value + 1)}
          disabled={value >= max}
          aria-label={`Přidat ${unitLabel}`}
        >
          <Plus aria-hidden="true" className="size-5" strokeWidth={2.75} />
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
      <label
        htmlFor={id}
        className="group flex min-h-12 cursor-pointer items-start gap-3 py-2 has-disabled:cursor-not-allowed has-disabled:opacity-60"
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border-2 bg-white text-white transition duration-200 peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-800 group-active:scale-90 ${
            error ? 'border-red-700' : 'border-slate-300'
          }`}
        >
          <Check
            className={`size-4 transition duration-300 ${checked ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            strokeWidth={3.5}
          />
        </span>
        <span className="text-slate-800">{children}</span>
      </label>
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

/** Volba ano/ne jako karta s přepínačem. Vhodná na slevy a připojištění. */
export function ToggleCard({
  id,
  checked,
  onChange,
  title,
  description,
  badge,
  icon,
  tone,
  disabled,
  error,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  title: ReactNode
  description?: ReactNode
  badge?: string
  icon?: LucideIcon
  tone?: Tone
  disabled?: boolean
  error?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-3 transition duration-200 hover:border-brand-300 active:scale-[0.98] has-checked:border-brand-500 has-checked:bg-brand-50 has-disabled:cursor-not-allowed has-disabled:opacity-55 has-disabled:hover:border-slate-200 has-disabled:active:scale-100 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-800 ${
          error ? 'border-red-700' : 'border-slate-200'
        }`}
      >
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
        />
        {icon && <IconBadge icon={icon} tone={tone} />}
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight font-bold text-ink">
            {title}
            {badge && (
              <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-bold text-accent-700">
                {badge}
              </span>
            )}
          </span>
          {description && (
            <span className="mt-0.5 block text-sm text-slate-600">{description}</span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="relative h-7 w-12 shrink-0 rounded-full bg-slate-200 transition-colors duration-300 peer-checked:bg-brand-500 peer-checked:[&>span]:translate-x-5"
        >
          <span className="absolute top-1 left-1 size-5 rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)]" />
        </span>
      </label>
      <ErrorText id={`${id}-error`} message={error} />
    </div>
  )
}

/** Část kroku s nadpisem. Nadpis je krátký, aby neopakoval nadpis kroku. */
export function Section({
  title,
  icon,
  tone,
  aside,
  children,
}: {
  title: string
  icon?: LucideIcon
  tone?: Tone
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="animate-rise rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgb(16_41_45/0.06),0_8px_24px_-12px_rgb(16_41_45/0.12)] sm:p-5">
      <div className="flex items-center gap-3">
        {icon && <IconBadge icon={icon} tone={tone} size="sm" />}
        <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}
