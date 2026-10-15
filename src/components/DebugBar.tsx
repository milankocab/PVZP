import { ChevronDown, FlaskConical, Info } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import type { Variant } from '../analytics/experiment'

const VARIANT_LABELS: Record<Variant, string> = {
  a: 'A · bez předvolby',
  b: 'B · předvybraný Komfort',
}

function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <span
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
        }}
        className="flex size-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-amber-100 active:scale-90"
      >
        <Info aria-hidden="true" className="size-5" />
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className="absolute top-full right-0 z-40 w-72 max-w-[calc(100vw-2rem)] animate-fade rounded-xl bg-ink p-3 text-sm font-normal text-white shadow-xl"
      >
        {children}
      </span>
    </span>
  )
}

function Row({
  label,
  badge,
  badgeClass,
  value,
  action,
  tip,
}: {
  label: string
  badge: string
  badgeClass: string
  value: string
  action: ReactNode
  tip: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-white/80 py-1 pr-1 pl-3 text-sm ring-1 ring-amber-200"
    >
      <span className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wide ${badgeClass}`}>
        {badge}
      </span>
      <span className="font-semibold text-slate-800">{value}</span>
      <span className="ml-auto flex items-center">
        {action}
        {tip}
      </span>
    </div>
  )
}

/**
 * Ladicí lišta pro ukázku prototypu. Na ostrém webu by nebyla.
 * Je sbalená, aby nepřekážela. Pruhované pozadí ji odliší od samotného sjednání.
 */
export function DebugBar({
  variant,
  segmentForced,
  onSwitchVariant,
  onToggleSegment,
}: {
  variant: Variant
  segmentForced: boolean
  onSwitchVariant: (next: Variant) => void
  onToggleSegment: (forced: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const next: Variant = variant === 'a' ? 'b' : 'a'
  const buttonClass =
    'min-h-11 rounded-lg bg-ink px-3 font-semibold text-white transition hover:bg-brand-800 active:scale-95'

  return (
    <div className="border-b-2 border-dashed border-amber-400 bg-amber-50 bg-[repeating-linear-gradient(135deg,transparent_0_12px,rgb(253_230_138/0.35)_12px_24px)]">
      <div className="mx-auto max-w-5xl px-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-11 w-full items-center gap-2 py-1 text-left text-sm text-slate-800"
        >
          <FlaskConical aria-hidden="true" className="size-4 shrink-0 text-amber-700" />
          <span className="font-bold">Režim ukázky</span>
          <span className="rounded-md bg-amber-400 px-1.5 text-xs font-bold text-slate-900">
            {variant.toUpperCase()}
          </span>
          {segmentForced && (
            <span className="rounded-md bg-violet-700 px-1.5 text-xs font-bold text-white">
              Manažer
            </span>
          )}
          <ChevronDown
            aria-hidden="true"
            className={`ml-auto size-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>
        <div
          id={panelId}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden" inert={!open}>
            <div className="grid gap-2 pb-3 sm:grid-cols-2">
              <Row
                label="A/B test"
                badge="A/B"
                badgeClass="bg-amber-400 text-slate-900"
                value={VARIANT_LABELS[variant]}
                action={
                  <button
                    type="button"
                    onClick={() => onSwitchVariant(next)}
                    className={buttonClass}
                  >
                    Přepnout na {next.toUpperCase()}
                  </button>
                }
                tip={
                  <InfoTip label="Co je přepínač variant">
                    Ukáže obě varianty testu. Na ostrém webu by návštěvník dostal jednu variantu
                    náhodně a zůstal by u ní. Přepnutí začne sjednání znovu.
                  </InfoTip>
                }
              />
              <Row
                label="Segment"
                badge="SEGMENT"
                badgeClass="bg-violet-700 text-white"
                value={segmentForced ? 'Manažer, vynucený' : 'Podle odpovědi a UTM'}
                action={
                  <button
                    type="button"
                    aria-pressed={segmentForced}
                    onClick={() => onToggleSegment(!segmentForced)}
                    className={buttonClass}
                  >
                    {segmentForced ? 'Zrušit vynucení' : 'Vynutit manažera'}
                  </button>
                }
                tip={
                  <InfoTip label="Co je přepínač segmentu">
                    Segment se nepromítá do toho, co návštěvník vidí. Přínosy pro manažery dostávají
                    všichni. Přepínač mění jen to, pod jakým segmentem se sjednání změří. Výsledek
                    je vidět ve filtru Manažeři na stránce Měření. Na ostrém webu segment určí
                    kampaň nebo odpověď „Jedete pracovně?“. Přepnutí začne sjednání znovu.
                  </InfoTip>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
