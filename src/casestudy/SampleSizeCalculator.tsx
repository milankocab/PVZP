import { useId, useState } from 'react'
import { sampleSizeForConversion, sampleSizeForMean } from '../analytics/sampleSize'

type Mode = 'aov' | 'conversion'

// Test nechávám běžet aspoň 2 celé týdny, aby pokryl všední dny i víkendy dvakrát.
const MIN_WEEKS = 2

const number = (value: number) => value.toLocaleString('cs-CZ')

function weeksLabel(weeks: number): string {
  if (weeks === 1) return '1 týden'
  if (weeks >= 2 && weeks <= 4) return `${weeks} týdny`
  return `${weeks} týdnů`
}

/** Číslo z políčka. Prázdné nebo nesmyslné políčko vrací NaN. */
function parse(value: string): number {
  return Number(value.replace(',', '.').replace(/\s/g, ''))
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  hint,
}: {
  label: string
  unit: string
  value: string
  onChange: (value: string) => void
  hint?: string
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className="block font-medium text-slate-900">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-slate-700">
          {hint}
        </p>
      )}
      <div className="mt-1 flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          className="min-h-12 w-32 rounded-lg border-2 border-slate-400 px-3 text-lg tabular-nums"
        />
        <span className="text-slate-800">{unit}</span>
      </div>
    </div>
  )
}

export function SampleSizeCalculator() {
  const [mode, setMode] = useState<Mode>('aov')
  const [aov, setAov] = useState('290')
  const [sd, setSd] = useState('200')
  const [aovEffect, setAovEffect] = useState('10')
  const [conversion, setConversion] = useState('10')
  const [conversionEffect, setConversionEffect] = useState('5')
  const [weeklyVisits, setWeeklyVisits] = useState('10000')

  const baseline = parse(conversion) / 100
  const weekly = parse(weeklyVisits)

  let orders: number | null = null
  let visits: number | null = null
  if (mode === 'aov') {
    orders = sampleSizeForMean(parse(aov), parse(sd), parse(aovEffect) / 100)
    visits = orders !== null && baseline > 0 && baseline < 1 ? Math.ceil(orders / baseline) : null
  } else {
    visits = sampleSizeForConversion(baseline, -parse(conversionEffect) / 100)
  }
  const weeks = visits !== null && weekly > 0 ? Math.ceil(visits / weekly) : null

  return (
    <div className="rounded-xl border-2 border-slate-300 bg-white p-4">
      <p className="text-sm text-slate-700">
        Hladina významnosti 5 % (oboustranně), síla testu 80 %. Výchozí hodnoty jsou předpoklady o
        smyšlené firmě.
      </p>
      <fieldset className="mt-4">
        <legend className="font-semibold text-slate-900">Co chci změřit</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(
            [
              ['aov', 'AOV, primární metrika'],
              ['conversion', 'Konverze, ochranná metrika'],
            ] as const
          ).map(([id, label]) => (
            <label
              key={id}
              className="flex min-h-12 cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-300 px-3 has-checked:border-brand-700 has-checked:bg-brand-50 has-focus-visible:outline-3 has-focus-visible:outline-brand-800 has-focus-visible:outline-offset-2"
            >
              <input
                type="radio"
                name="sample-mode"
                checked={mode === id}
                onChange={() => setMode(id)}
                className="size-5 accent-brand-700"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode === 'aov' ? (
          <>
            <NumberField label="Dnešní AOV" unit="Kč" value={aov} onChange={setAov} />
            <NumberField
              label="Směrodatná odchylka cen objednávek"
              unit="Kč"
              value={sd}
              onChange={setSd}
              hint="Jak moc se ceny objednávek liší od průměru."
            />
            <NumberField
              label="Růst AOV, který chci odhalit"
              unit="%"
              value={aovEffect}
              onChange={setAovEffect}
            />
            <NumberField
              label="Konverze funnelu"
              unit="%"
              value={conversion}
              onChange={setConversion}
              hint="Potřebuji ji k převodu objednávek na návštěvy."
            />
          </>
        ) : (
          <>
            <NumberField
              label="Výchozí konverze"
              unit="%"
              value={conversion}
              onChange={setConversion}
            />
            <NumberField
              label="Pokles konverze, který chci odhalit"
              unit="% relativně"
              value={conversionEffect}
              onChange={setConversionEffect}
            />
          </>
        )}
        <NumberField
          label="Návštěvy funnelu za týden na variantu"
          unit="návštěv"
          value={weeklyVisits}
          onChange={setWeeklyVisits}
        />
      </div>

      <div aria-live="polite" className="mt-5 rounded-lg bg-brand-50 p-4 text-slate-900">
        {visits === null || weeks === null ? (
          <p>Zkontrolujte vstupy. Čísla musí být kladná a konverze menší než 100 %.</p>
        ) : (
          <>
            {orders !== null && (
              <p>
                Potřebuji <strong className="tabular-nums">{number(orders)}</strong> objednávek na
                variantu.
              </p>
            )}
            <p>
              To je <strong className="tabular-nums">{number(visits)}</strong> návštěv na variantu.
            </p>
            <p>
              Test poběží <strong>{weeksLabel(Math.max(weeks, MIN_WEEKS))}</strong>.
              {weeks < MIN_WEEKS &&
                ` Výpočet vychází na ${weeksLabel(weeks)}, ale test nechávám běžet aspoň ${weeksLabel(MIN_WEEKS)}, aby pokryl všední dny i víkendy.`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
