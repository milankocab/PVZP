import {
  COVERAGE_ROWS,
  PLAN_ORDER,
  PLANS,
  formatCzk,
  tryCalculatePrice,
  type PlanId,
} from '../../pricing'
import { ErrorText } from '../components/ui'
import { toBasePriceInput, type StepProps } from '../stepProps'

// Přínosy na kartách. Nahoře je to, co řeší manažeři s pracovní elektronikou.
const HIGHLIGHTS: Record<PlanId, string[]> = {
  basic: [
    'Zavazadla a elektronika do 15 000 Kč, 1 kufr na smlouvu',
    'Léčebné výlohy do 5 mil. Kč',
    'Odpovědnost do 3 mil. Kč',
    'Lékařská asistence nonstop',
  ],
  comfort: [
    'Pracovní notebook i telefon. 50 000 Kč na kufr, 40 000 Kč na kus',
    'Kufr v ceně pro každého cestujícího',
    'Léčebné výlohy do 25 mil. Kč, odpovědnost do 10 mil. Kč',
    'Rozšířená asistence při ztrátě dokladů a právní pomoc',
  ],
  premium: [
    'Elektronika do 2 let za novou cenu. 80 000 Kč na kufr',
    'Kryje i firemní notebook a telefon, které používáte',
    'Storno zájezdu v ceně, bez lhůty od koupě',
    'Zpoždění letu, léčebné výlohy do 250 mil. Kč',
  ],
}

function CoverageValueCell({ value }: { value: string | boolean }) {
  if (value === true) return <span aria-label="Ano">✓</span>
  if (value === false) return <span aria-label="Ne">–</span>
  return <>{value}</>
}

export function StepPlan({ state, update, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <fieldset aria-describedby={errors.plan ? 'plan-error' : undefined}>
        <legend className="sr-only">Balíček</legend>
        <div className="space-y-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id]
            const input = toBasePriceInput(state, id)
            const price = input ? tryCalculatePrice(input) : null
            return (
              <label
                key={id}
                className={`relative block cursor-pointer rounded-xl border-2 bg-white p-4 has-checked:border-brand-700 has-checked:bg-brand-50 has-focus-visible:outline-3 has-focus-visible:outline-accent-500 ${
                  errors.plan ? 'border-red-700' : 'border-slate-300'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-4 rounded-full bg-accent-500 px-3 py-0.5 text-sm font-bold text-slate-900">
                    Doporučujeme
                  </span>
                )}
                <span className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="plan"
                    value={id}
                    checked={state.plan === id}
                    onChange={() => update({ plan: id, luggageSharedConfirmed: false })}
                    className="mt-1.5 size-5 shrink-0 accent-brand-700"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-xl font-bold text-slate-900">{plan.label}</span>
                      {price && (
                        <span className="text-xl font-bold text-slate-900">
                          {formatCzk(price.total)}
                        </span>
                      )}
                    </span>
                    {price && (
                      <span className="block text-right text-sm text-slate-600">
                        za celou cestu, {formatCzk(Math.round(price.total / price.days))} za den
                      </span>
                    )}
                    <ul className="mt-2 space-y-1 text-sm text-slate-800">
                      {HIGHLIGHTS[id].map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true" className="text-brand-700">
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <ErrorText id="plan-error" message={errors.plan} />
      </fieldset>

      <details className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="min-h-12 cursor-pointer content-center font-semibold text-brand-700">
          Porovnat všechna krytí
        </summary>
        <table className="mt-3 w-full table-fixed text-sm">
          <caption className="sr-only">Srovnání krytí balíčků</caption>
          <thead>
            <tr>
              <th scope="col" className="w-2/5 pb-2 text-left">
                <span className="sr-only">Krytí</span>
              </th>
              {PLAN_ORDER.map((id) => (
                <th key={id} scope="col" className="pb-2 text-left font-bold">
                  {PLANS[id].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COVERAGE_ROWS.map((row) => (
              <tr key={row.label} className="border-t border-slate-200 align-top">
                <th scope="row" className="py-2 pr-2 text-left font-medium text-slate-800">
                  {row.label}
                </th>
                {PLAN_ORDER.map((id) => (
                  <td key={id} className="py-2 pr-1 text-slate-800">
                    <CoverageValueCell value={row.values[id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
