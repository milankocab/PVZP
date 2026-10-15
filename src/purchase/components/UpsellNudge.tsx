import { ArrowRight, Crown, TrendingUp } from 'lucide-react'
import { PLANS, formatCzk, type PlanId } from '../../pricing'
import { COVERAGE_ICONS, upgradeDiffs } from '../coverage'
import { IconBadge } from './ui'

export interface UpsellOffer {
  plan: PlanId
  /** Balíček, který má klient teď. */
  from: PlanId
  difference: number
}

function DiffValue({ value }: { value: string | boolean }) {
  if (value === true) return <>v ceně</>
  if (value === false) return <>není</>
  return <>{value}</>
}

/**
 * Nabídka vyššího balíčku. Ukazuje se v každém kroku od výběru balíčku, dokud ji klient
 * nepřijme. Neříká jen „lepší krytí“, ale konkrétně co se změní a za kolik.
 */
export function UpsellNudge({
  offer,
  onAccept,
  onDismiss,
}: {
  offer: UpsellOffer
  onAccept: () => void
  onDismiss: () => void
}) {
  const target = PLANS[offer.plan]
  const diffs = upgradeDiffs(offer.from, offer.plan).slice(0, 3)
  const priceText = offer.difference > 0 ? `+${formatCzk(offer.difference)}` : 'stejná cena'

  return (
    <section
      aria-labelledby="upsell-title"
      className="relative animate-rise overflow-hidden rounded-3xl bg-gradient-to-br from-accent-50 via-white to-brand-50 p-4 ring-2 ring-accent-400/70 sm:p-5"
    >
      <span
        aria-hidden="true"
        className="absolute -top-10 -right-10 size-32 rounded-full bg-accent-400/15 blur-2xl"
      />
      <div className="relative flex items-start gap-3">
        <IconBadge icon={offer.plan === 'premium' ? Crown : TrendingUp} tone="accent" />
        <div className="min-w-0">
          <h2 id="upsell-title" className="text-lg leading-tight font-extrabold text-ink">
            Za {priceText} máte {target.label}
          </h2>
          <p className="text-sm text-slate-700">Oproti balíčku {PLANS[offer.from].label} získáte</p>
        </div>
      </div>
      <ul className="relative mt-3 space-y-2">
        {diffs.map((diff, index) => (
          <li
            key={diff.id}
            style={{ animationDelay: `${120 + index * 70}ms` }}
            className="flex animate-rise items-center gap-3 rounded-2xl bg-white/90 p-2.5 ring-1 ring-slate-100"
          >
            <IconBadge {...COVERAGE_ICONS[diff.id]} size="sm" />
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-semibold text-ink">{diff.label}</span>
              <span className="text-slate-500 line-through decoration-slate-400">
                <DiffValue value={diff.from} />
              </span>
              <ArrowRight aria-label="nově" className="mx-1 inline size-3.5 text-accent-700" />
              <strong className="text-brand-700">
                <DiffValue value={diff.to} />
              </strong>
            </span>
          </li>
        ))}
      </ul>
      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="group inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-500 px-5 font-bold text-ink shadow-[0_8px_20px_-8px_rgb(244_124_44/0.8)] transition hover:bg-accent-400 active:scale-[0.97]"
        >
          Změnit na {target.label}
          <ArrowRight
            aria-hidden="true"
            className="size-5 transition-transform group-hover:translate-x-1"
          />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-12 rounded-2xl px-4 text-sm font-semibold text-slate-600 underline-offset-2 hover:underline"
        >
          Teď ne
        </button>
      </div>
    </section>
  )
}
