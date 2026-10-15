import {
  Building2,
  Check,
  Clock,
  Crown,
  FileText,
  Headset,
  Laptop,
  Luggage,
  Scale,
  Sparkles,
  Star,
  Stethoscope,
  Ticket,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Tip } from '../../components/Tip'
import {
  COVERAGE_ROWS,
  PLAN_ORDER,
  PLANS,
  formatCzk,
  tryCalculatePrice,
  type CoverageRowId,
  type PlanId,
  type PriceBreakdown,
} from '../../pricing'
import { COVERAGE_EXPLANATIONS, COVERAGE_ICONS } from '../coverage'
import { ErrorText, IconBadge, YesNoMark, type Tone } from '../components/ui'
import { TONES } from '../components/tones'
import { toBasePriceInput, type FormState, type StepProps } from '../stepProps'

/** Jak se balíčky ukazují. Tohle je předmět A/B testu. */
export type PlanLayout = 'stacked' | 'carousel'

// Přínosy na kartách. Nahoře je to, co řeší manažeři s pracovní elektronikou.
const HIGHLIGHTS: Record<PlanId, { icon: LucideIcon; tone: Tone; text: string }[]> = {
  basic: [
    { icon: Luggage, tone: 'accent', text: '15 000 Kč na kufr, 1 kufr na smlouvu' },
    { icon: Stethoscope, tone: 'rose', text: 'Léčebné výlohy do 5 mil. Kč' },
    { icon: Scale, tone: 'lime', text: 'Odpovědnost do 3 mil. Kč' },
    { icon: Headset, tone: 'sky', text: 'Lékařská asistence nonstop' },
  ],
  comfort: [
    { icon: Laptop, tone: 'violet', text: '50 000 Kč na kufr, 40 000 Kč na kus elektroniky' },
    { icon: Luggage, tone: 'accent', text: 'Kufr v ceně pro každého' },
    { icon: Stethoscope, tone: 'rose', text: 'Léčebné výlohy do 25 mil. Kč' },
    { icon: FileText, tone: 'sky', text: 'Pomoc při ztrátě dokladů a právní pomoc' },
  ],
  premium: [
    { icon: Sparkles, tone: 'amber', text: 'Elektronika do 2 let za novou cenu' },
    { icon: Building2, tone: 'slate', text: 'Kryje i firemní notebook a telefon' },
    { icon: Ticket, tone: 'violet', text: 'Storno zájezdu v ceně, bez lhůty' },
    { icon: Clock, tone: 'amber', text: 'Zpoždění letu, léčebné výlohy 250 mil. Kč' },
  ],
}

// Vzhled hlavičky karty. Každý balíček má vlastní barvu, aby se daly rozlišit i při swipování.
const CARD_HEAD: Record<PlanId, string> = {
  basic: 'bg-gradient-to-br from-sky-100 to-brand-50 text-ink',
  comfort: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white',
  premium: 'bg-gradient-to-br from-ink to-brand-900 text-white',
}

const panelClass =
  'rounded-3xl bg-white shadow-[0_1px_2px_rgb(16_41_45/0.06),0_8px_24px_-12px_rgb(16_41_45/0.12)]'

/** Ikona bez barevného pozadí. Barva zůstává, aby šly parametry najít očima. */
function PlainIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) {
  return (
    <Icon
      aria-hidden="true"
      strokeWidth={2.2}
      className={`size-5 shrink-0 ${TONES[tone].split(' ')[1]}`}
    />
  )
}

function CoverageValue({ value }: { value: string | boolean }) {
  if (value === true) return <YesNoMark yes />
  if (value === false) return <YesNoMark yes={false} />
  return <>{value}</>
}

/** Název parametru, který po kliknutí vysvětlí, co znamená. */
export function CoverageLabel({ id, children }: { id: CoverageRowId; children: string }) {
  return (
    <Tip
      content={COVERAGE_EXPLANATIONS[id]}
      className="text-left underline decoration-slate-300 decoration-dotted decoration-2 underline-offset-4 transition-colors hover:decoration-brand-500 aria-expanded:decoration-brand-500"
    >
      {children}
    </Tip>
  )
}

function usePrices(state: FormState) {
  return Object.fromEntries(
    PLAN_ORDER.map((id) => {
      const input = toBasePriceInput(state, id)
      return [id, input ? tryCalculatePrice(input) : null]
    }),
  ) as Record<PlanId, PriceBreakdown | null>
}

function PriceTag({ price, light = false }: { price: PriceBreakdown | null; light?: boolean }) {
  if (!price) return <span className="text-sm opacity-80">Cena po vyplnění cesty</span>
  return (
    <span className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-2xl font-extrabold tracking-tight tabular-nums">
        {formatCzk(price.total)}
      </span>
      <span className={`text-sm ${light ? 'text-white/80' : 'text-slate-600'}`}>
        {formatCzk(Math.round(price.total / price.days))} za den
      </span>
    </span>
  )
}

/** Varianta A. Balíčky pod sebou, žádný není vybraný. */
function StackedPlans({ state, update, errors }: StepProps) {
  const prices = usePrices(state)
  return (
    <fieldset aria-describedby={errors.plan ? 'plan-error' : undefined} className="min-w-0">
      <legend className="sr-only">Balíček</legend>
      <div className="space-y-4 pt-2">
        {PLAN_ORDER.map((id, index) => {
          const plan = PLANS[id]
          const isSelected = state.plan === id
          return (
            <label
              key={id}
              style={{ animationDelay: `${index * 70}ms` }}
              className={`group relative block animate-rise cursor-pointer rounded-3xl p-4 shadow-[0_10px_30px_-16px_rgb(16_41_45/0.35)] ring-2 transition duration-200 active:scale-[0.99] has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-800 ${
                isSelected
                  ? 'bg-brand-50 ring-brand-500'
                  : errors.plan
                    ? 'bg-white ring-red-700'
                    : 'bg-white ring-transparent hover:ring-brand-200'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-extrabold text-ink shadow">
                  <Star aria-hidden="true" className="size-3.5 fill-current" />
                  Doporučujeme
                </span>
              )}
              <input
                type="radio"
                name="plan"
                value={id}
                checked={isSelected}
                onChange={() => update({ plan: id, luggageSharedConfirmed: false })}
                className="sr-only"
              />
              <span className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition duration-300 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  <Check
                    className={`size-4 transition duration-300 ${isSelected ? 'scale-100' : 'scale-50'}`}
                    strokeWidth={3.5}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="flex items-center gap-1.5 text-xl font-extrabold text-ink">
                      {plan.label}
                      {id === 'premium' && (
                        <Crown aria-hidden="true" className="size-5 text-amber-500" />
                      )}
                    </span>
                    <span className="text-ink">
                      <PriceTag price={prices[id]} />
                    </span>
                  </span>
                  <ul className="mt-3 space-y-2">
                    {HIGHLIGHTS[id].map((item) => (
                      <li
                        key={item.text}
                        className="flex items-center gap-2.5 text-sm text-slate-800"
                      >
                        <PlainIcon icon={item.icon} tone={item.tone} />
                        <span className="leading-snug">{item.text}</span>
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
  )
}

/** Varianta B. Balíčky vedle sebe na swipe, pod nimi detail aktivního balíčku. */
function CarouselPlans({ state, update, errors }: StepProps) {
  const scroller = useRef<HTMLDivElement>(null)
  const cards = useRef<Partial<Record<PlanId, HTMLLabelElement | null>>>({})
  // Posuvník začíná na vybraném balíčku, jinak na doporučeném Komfortu.
  const [active, setActive] = useState<PlanId>(state.plan ?? 'comfort')
  const prices = usePrices(state)

  const scrollTo = (id: PlanId, smooth = true) => {
    const container = scroller.current
    const card = cards.current[id]
    if (!container || !card) return
    const left = card.offsetLeft - (container.clientWidth - card.clientWidth) / 2
    if (typeof container.scrollTo === 'function') {
      container.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' })
    }
  }

  useLayoutEffect(() => {
    scrollTo(active, false)
    // Jen při prvním zobrazení. Dál posouvá klient.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aktivní je karta, jejíž střed je nejblíž středu posuvníku.
  useEffect(() => {
    const container = scroller.current
    if (!container) return
    const onScroll = () => {
      const center = container.scrollLeft + container.clientWidth / 2
      let nearest: PlanId = active
      let best = Infinity
      for (const id of PLAN_ORDER) {
        const card = cards.current[id]
        if (!card) continue
        const distance = Math.abs(card.offsetLeft + card.clientWidth / 2 - center)
        if (distance < best) {
          best = distance
          nearest = id
        }
      }
      setActive(nearest)
    }
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [active])

  const choose = (id: PlanId) => {
    setActive(id)
    scrollTo(id)
    update({ plan: id, luggageSharedConfirmed: false })
  }

  return (
    <>
      {/* Přepínač nad kartami. Stejná funkce jako swipe, jen pro ty, kdo neswipují. */}
      <div className="relative grid grid-cols-3 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200 lg:hidden">
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-ink transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ transform: `translateX(${PLAN_ORDER.indexOf(active) * 100}%)` }}
        />
        {PLAN_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            aria-current={active === id ? 'true' : undefined}
            aria-label={`Ukázat balíček ${PLANS[id].label}`}
            onClick={() => {
              setActive(id)
              scrollTo(id)
            }}
            className={`relative min-h-11 rounded-xl text-sm font-bold transition-colors duration-300 ${
              active === id ? 'text-white' : 'text-slate-600'
            }`}
          >
            {PLANS[id].label}
            {state.plan === id && (
              <Check
                aria-hidden="true"
                className="ml-1 inline size-4 text-brand-300"
                strokeWidth={3}
              />
            )}
          </button>
        ))}
      </div>

      <fieldset aria-describedby={errors.plan ? 'plan-error' : undefined} className="min-w-0">
        <legend className="sr-only">Balíček</legend>
        <div
          ref={scroller}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[9%] pt-4 pb-3 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
        >
          {PLAN_ORDER.map((id) => {
            const plan = PLANS[id]
            const isActive = active === id
            const isSelected = state.plan === id
            return (
              <label
                key={id}
                ref={(element) => {
                  cards.current[id] = element
                }}
                onFocus={() => {
                  setActive(id)
                  scrollTo(id)
                }}
                className={`relative flex w-[82%] shrink-0 cursor-pointer snap-center flex-col overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_-14px_rgb(16_41_45/0.35)] ring-2 transition duration-300 ease-out has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-800 sm:w-[60%] lg:w-auto lg:scale-100 lg:opacity-100 ${
                  isSelected ? 'ring-brand-500' : errors.plan ? 'ring-red-700' : 'ring-transparent'
                } ${isActive ? 'scale-100 opacity-100' : 'scale-[0.94] opacity-80'}`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={id}
                  checked={isSelected}
                  onChange={() => choose(id)}
                  className="sr-only"
                />
                <span className={`relative block p-4 pt-5 ${CARD_HEAD[id]}`}>
                  {plan.recommended && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-extrabold text-ink shadow">
                      <Star aria-hidden="true" className="size-3.5 fill-current" />
                      Doporučujeme
                    </span>
                  )}
                  {id === 'premium' && (
                    <Crown
                      aria-hidden="true"
                      className="absolute top-3 right-3 size-6 text-amber-300"
                    />
                  )}
                  <span className="block text-sm font-semibold opacity-80">Balíček</span>
                  <span className="block text-2xl font-extrabold tracking-tight">{plan.label}</span>
                  <span className="mt-3 block">
                    <PriceTag price={prices[id]} light={id !== 'basic'} />
                  </span>
                </span>
                <ul className="flex-1 space-y-2.5 p-4">
                  {HIGHLIGHTS[id].map((item) => (
                    <li key={item.text} className="flex items-center gap-3 text-sm text-slate-800">
                      <IconBadge icon={item.icon} tone={item.tone} size="sm" />
                      <span className="leading-snug">{item.text}</span>
                    </li>
                  ))}
                </ul>
                <span className="px-4 pb-4">
                  <span
                    aria-hidden="true"
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl font-bold transition duration-300 ${
                      isSelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 text-ink hover:bg-brand-100'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check key="check" className="size-5 animate-pop" strokeWidth={3} />
                        Vybráno
                      </>
                    ) : (
                      `Vybrat ${plan.label}`
                    )}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
        <div aria-hidden="true" className="flex justify-center gap-1.5 lg:hidden">
          {PLAN_ORDER.map((id) => (
            <span
              key={id}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === id ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
        <ErrorText id="plan-error" message={errors.plan} />
      </fieldset>

      <section aria-labelledby="plan-detail-title" className={`${panelClass} p-4 sm:p-5`}>
        <h2 id="plan-detail-title" className="text-lg font-extrabold tracking-tight text-ink">
          Co je v balíčku {PLANS[active].label}
        </h2>
        <p className="text-sm text-slate-600">Klepnutím na parametr zobrazíte vysvětlení.</p>
        <ul key={active} className="mt-2 divide-y divide-slate-100">
          {COVERAGE_ROWS.map((row, index) => {
            const value = row.values[active]
            return (
              <li
                key={row.id}
                style={{ animationDelay: `${index * 30}ms` }}
                className={`flex min-h-13 animate-rise items-center gap-3 py-3 ${
                  value === false ? 'opacity-50' : ''
                }`}
              >
                <PlainIcon
                  icon={COVERAGE_ICONS[row.id].icon}
                  tone={value === false ? 'slate' : COVERAGE_ICONS[row.id].tone}
                />
                <span className="min-w-0 flex-1 text-sm text-slate-800">
                  <CoverageLabel id={row.id}>{row.label}</CoverageLabel>
                </span>
                <span className="shrink-0 text-right text-sm font-bold text-ink">
                  <CoverageValue value={value} />
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </>
  )
}

/** Srovnání všech balíčků. Je v obou variantách stejné. */
function Comparison({ selected }: { selected: PlanId | null }) {
  return (
    <details className={`group ${panelClass}`}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 font-bold text-ink sm:px-5 [&::-webkit-details-marker]:hidden">
        Porovnat všechny balíčky
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition-transform duration-300 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <table className="w-full animate-fade border-separate border-spacing-0 text-sm">
        <caption className="sr-only">Srovnání krytí balíčků</caption>
        <thead>
          <tr>
            {PLAN_ORDER.map((id) => (
              <th
                key={id}
                id={`compare-${id}`}
                scope="col"
                className={`w-1/3 border-b-2 border-slate-200 px-2 pt-1 pb-3 text-center font-extrabold ${
                  selected === id ? 'text-brand-700' : 'text-ink'
                }`}
              >
                {PLANS[id].label}
              </th>
            ))}
          </tr>
        </thead>
        {/* Každý parametr je samostatný blok se střídavým pozadím a čárou. Název je nad hodnotami
            přes celou šířku, hodnoty mají třetinu šířky a vejdou se i na 375 px. */}
        {COVERAGE_ROWS.map((row, index) => (
          <tbody key={row.id} className={index % 2 === 1 ? 'bg-slate-50/80' : ''}>
            <tr>
              <th
                id={`compare-row-${row.id}`}
                colSpan={3}
                scope="colgroup"
                className="border-t border-slate-200 px-4 pt-4 pb-2.5 text-left text-xs font-bold tracking-wide text-slate-600 uppercase sm:px-5"
              >
                <span className="flex items-center gap-2">
                  <PlainIcon {...COVERAGE_ICONS[row.id]} />
                  <CoverageLabel id={row.id}>{row.label}</CoverageLabel>
                </span>
              </th>
            </tr>
            <tr>
              {PLAN_ORDER.map((id) => (
                <td
                  key={id}
                  headers={`compare-${id} compare-row-${row.id}`}
                  className={`px-1 pt-1 pb-4 text-center text-[15px] leading-tight font-bold text-balance ${
                    selected === id ? 'text-brand-700' : 'text-ink'
                  }`}
                >
                  <CoverageValue value={row.values[id]} />
                </td>
              ))}
            </tr>
          </tbody>
        ))}
      </table>
    </details>
  )
}

export function StepPlan({ layout, ...props }: StepProps & { layout: PlanLayout }) {
  return (
    <div className="space-y-5">
      {layout === 'stacked' ? <StackedPlans {...props} /> : <CarouselPlans {...props} />}
      <Comparison selected={props.state.plan} />
    </div>
  )
}
