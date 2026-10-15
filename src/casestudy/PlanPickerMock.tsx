import { PLAN_ORDER, PLANS, formatCzk, tryCalculatePrice, type PlanId } from '../pricing'

// Ukázková cesta pro náhled. Evropa, 1 dospělý, 7 dní.
function samplePrice(plan: PlanId): number | null {
  return (
    tryCalculatePrice({
      region: 'europe',
      departure: '2027-03-01',
      return: '2027-03-07',
      travelers: { adult: 1, child: 0, senior: 0 },
      plan,
      addons: [],
      today: '2027-01-01',
    })?.total ?? null
  )
}

function Badge() {
  return (
    <span className="absolute -top-3 left-3 rounded-full bg-accent-500 px-2 text-xs font-bold text-slate-900">
      Doporučujeme
    </span>
  )
}

function SelectedMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected ? 'border-brand-700' : 'border-slate-500'
      }`}
    >
      {selected && <span className="size-2.5 rounded-full bg-brand-700" />}
    </span>
  )
}

/**
 * Zjednodušený náhled kroku 2. Jen obrázek, ne formulář.
 * Varianta A má balíčky pod sebou, varianta B vedle sebe s kartou uprostřed.
 */
export function PlanPickerMock({
  layout,
  selected,
}: {
  layout: 'stacked' | 'carousel'
  selected: PlanId | null
}) {
  if (layout === 'carousel') {
    // Prostřední karta je celá, krajní jen vykukují, jako na telefonu.
    return (
      <div className="overflow-hidden">
        <ul className="-mx-[30%] grid grid-cols-3 gap-2 pt-3">
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id]
            const isSelected = selected === id
            const price = samplePrice(id)
            return (
              <li
                key={id}
                className={`relative rounded-xl border-2 p-3 ${
                  isSelected ? 'border-brand-700 bg-brand-50' : 'scale-95 border-slate-300 bg-white'
                }`}
              >
                {plan.recommended && <Badge />}
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  <SelectedMark selected={isSelected} />
                  {plan.label}
                  <span className="sr-only">{isSelected ? ', vybraný' : ', nevybraný'}</span>
                </span>
                {price !== null && (
                  <span className="mt-2 block text-slate-800 tabular-nums">{formatCzk(price)}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {PLAN_ORDER.map((id) => {
        const plan = PLANS[id]
        const isSelected = selected === id
        const price = samplePrice(id)
        return (
          <li
            key={id}
            className={`relative flex items-center gap-3 rounded-xl border-2 p-3 ${
              isSelected ? 'border-brand-700 bg-brand-50' : 'border-slate-300 bg-white'
            }`}
          >
            {plan.recommended && <Badge />}
            <SelectedMark selected={isSelected} />
            <span className="flex-1 font-semibold text-slate-900">
              {plan.label}
              <span className="sr-only">{isSelected ? ', vybraný' : ', nevybraný'}</span>
            </span>
            {price !== null && (
              <span className="text-slate-800 tabular-nums">{formatCzk(price)}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
