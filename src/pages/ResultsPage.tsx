import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Segment, Variant } from '../analytics/experiment'
import { funnelStats, type FunnelStats } from '../analytics/funnel'
import { clearStoredEvents, getStoredEvents } from '../analytics/track'
import { formatCzk } from '../pricing'
import { STEPS } from '../purchase/state'

const VARIANTS: { id: Variant; label: string; color: string }[] = [
  { id: 'a', label: 'A · pod sebou', color: '#2a78d6' },
  { id: 'b', label: 'B · vedle sebe, Komfort', color: '#eb6834' },
]

const SEGMENTS: { id: Segment | 'all'; label: string }[] = [
  { id: 'all', label: 'Všichni' },
  { id: 'manager', label: 'Manažeři' },
  { id: 'other', label: 'Ostatní' },
]

function percent(value: number | null): string {
  return value === null
    ? '–'
    : `${(value * 100).toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} %`
}

function money(value: number | null): string {
  return value === null ? '–' : formatCzk(Math.round(value))
}

function FunnelChart({ stats }: { stats: Record<Variant, FunnelStats> }) {
  return (
    <figure>
      <figcaption className="text-sm text-slate-700">
        Podíl průchodů, které došly do daného kroku, z těch, kdo začali.
      </figcaption>
      <ul className="mt-3 flex flex-wrap gap-4 text-sm" aria-label="Legenda">
        {VARIANTS.map((variant) => (
          <li key={variant.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block size-3 rounded-sm"
              style={{ background: variant.color }}
            />
            {variant.label}
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-4">
        {STEPS.map((step, index) => (
          <div key={step.id}>
            <p className="text-sm font-semibold text-slate-900">
              {index + 1}. {step.label}
            </p>
            <div className="mt-1 space-y-[2px]">
              {VARIANTS.map((variant) => {
                const { starts, stepViews } = stats[variant.id]
                const share = starts > 0 ? stepViews[index] / starts : 0
                return (
                  <div
                    key={variant.id}
                    className="flex items-center gap-2"
                    title={`Varianta ${variant.id.toUpperCase()}, ${step.label}: ${stepViews[index]} z ${starts} (${percent(starts > 0 ? share : null)})`}
                  >
                    <div className="h-4 flex-1 rounded-r bg-slate-100">
                      <div
                        className="h-full rounded-r"
                        style={{ width: `${share * 100}%`, background: variant.color }}
                      />
                    </div>
                    <span className="w-16 text-right text-sm text-slate-800 tabular-nums">
                      {percent(starts > 0 ? share : null)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </figure>
  )
}

export function ResultsPage() {
  const [events, setEvents] = useState(getStoredEvents)
  const [segment, setSegment] = useState<Segment | 'all'>('all')
  const filter = segment === 'all' ? undefined : segment
  const stats = {
    a: funnelStats(events, 'a', STEPS.length, filter),
    b: funnelStats(events, 'b', STEPS.length, filter),
  }
  const hasData = stats.a.starts + stats.b.starts > 0

  const rows: { label: string; value: (s: FunnelStats) => string }[] = [
    { label: 'Začali (funnel_start)', value: (s) => String(s.starts) },
    { label: 'Dokončili (purchase_simulated)', value: (s) => String(s.purchases) },
    { label: 'Konverze', value: (s) => percent(s.conversion) },
    { label: 'AOV (průměrná objednávka)', value: (s) => money(s.aov) },
    { label: 'Tržba na návštěvu', value: (s) => money(s.revenuePerStart) },
    { label: 'Tržba celkem', value: (s) => money(s.revenue) },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Ladicí přehled měření</h1>
      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-slate-800">
        Jen data z tohoto prohlížeče. Nejde o výsledky testu. Slouží ke kontrole, že měření funguje.
        Skutečné vyhodnocení by probíhalo v GA4 a BigQuery, postup je v README.
      </p>

      {!hasData ? (
        <div className="mt-6 space-y-3 text-slate-800">
          <p>Zatím tu nic není. Projděte prototyp v jedné nebo obou variantách.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              to="/sjednani?v=a"
              className="flex min-h-12 items-center justify-center rounded-lg bg-brand-700 px-5 font-semibold text-white"
            >
              Vyzkoušet variantu A
            </Link>
            <Link
              to="/sjednani?v=b"
              className="flex min-h-12 items-center justify-center rounded-lg border-2 border-brand-700 px-5 font-semibold text-brand-700"
            >
              Vyzkoušet variantu B
            </Link>
          </div>
        </div>
      ) : (
        <>
          <fieldset className="mt-6">
            <legend className="font-semibold text-slate-900">Segment</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SEGMENTS.map((option) => (
                <label
                  key={option.id}
                  className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-300 px-3 has-checked:border-brand-700 has-checked:bg-brand-50 has-focus-visible:outline-3 has-focus-visible:outline-brand-800 has-focus-visible:outline-offset-2"
                >
                  <input
                    type="radio"
                    name="segment"
                    value={option.id}
                    checked={segment === option.id}
                    onChange={() => setSegment(option.id)}
                    className="accent-brand-700"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <section className="mt-6">
            <h2 className="text-xl font-bold text-slate-900">Metriky podle varianty</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th scope="col" className="py-2 pr-2">
                      Metrika
                    </th>
                    <th scope="col" className="py-2 pr-2">
                      Varianta A
                    </th>
                    <th scope="col" className="py-2">
                      Varianta B
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.label} className="border-b border-slate-200">
                      <th scope="row" className="py-2 pr-2 font-medium">
                        {row.label}
                      </th>
                      <td className="py-2 pr-2 tabular-nums">{row.value(stats.a)}</td>
                      <td className="py-2 tabular-nums">{row.value(stats.b)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-900">Funnel po krocích</h2>
            <div className="mt-3">
              <FunnelChart stats={stats} />
            </div>
            <details className="mt-4">
              <summary className="min-h-11 cursor-pointer content-center font-medium text-brand-700">
                Zobrazit jako tabulku
              </summary>
              <table className="mt-2 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th scope="col" className="py-2">
                      Krok
                    </th>
                    <th scope="col" className="py-2">
                      A
                    </th>
                    <th scope="col" className="py-2">
                      B
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STEPS.map((step, index) => (
                    <tr key={step.id} className="border-b border-slate-200">
                      <th scope="row" className="py-2 font-medium">
                        {index + 1}. {step.label}
                      </th>
                      <td className="py-2 tabular-nums">{stats.a.stepViews[index]}</td>
                      <td className="py-2 tabular-nums">{stats.b.stepViews[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Opravdu smazat všechna lokálně uložená data měření?')) {
                clearStoredEvents()
                setEvents([])
              }
            }}
            className="mt-8 min-h-12 rounded-lg border-2 border-red-700 px-5 font-semibold text-red-700"
          >
            Smazat data
          </button>
        </>
      )}
    </div>
  )
}
