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
        className="flex size-11 items-center justify-center rounded-full"
      >
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-full border-2 border-slate-800 text-sm font-bold"
        >
          i
        </span>
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className="absolute top-full right-0 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900 p-3 text-sm font-normal text-white shadow-lg"
      >
        {children}
      </span>
    </span>
  )
}

/**
 * Ladicí lišta pro ukázku prototypu. Na ostrém webu by nebyla.
 * A/B test a segment jsou dvě oddělené věci, proto má každá vlastní rámeček a barvu.
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
  const next: Variant = variant === 'a' ? 'b' : 'a'

  return (
    <div className="border-b border-dashed border-slate-400 bg-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <p className="text-sm font-semibold text-slate-800">
          Ladění pro ukázku. Na ostrém webu by nebylo.
        </p>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          <div
            role="group"
            aria-label="A/B test"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border-2 border-amber-500 bg-amber-50 py-1 pr-1 pl-3 text-sm text-slate-800"
          >
            <span className="rounded bg-amber-500 px-2 py-0.5 font-bold text-slate-900">
              A/B test
            </span>
            <span>
              Varianta <strong>{VARIANT_LABELS[variant]}</strong>
            </span>
            <span className="ml-auto flex items-center">
              <button
                type="button"
                onClick={() => onSwitchVariant(next)}
                className="min-h-11 rounded-lg border-2 border-slate-800 bg-white px-3 font-semibold"
              >
                Přepnout na {next.toUpperCase()}
              </button>
              <InfoTip label="Co je přepínač variant">
                Ukáže obě varianty testu. Na ostrém webu by návštěvník dostal jednu variantu náhodně
                a zůstal by u ní. Přepnutí začne sjednání znovu.
              </InfoTip>
            </span>
          </div>

          <div
            role="group"
            aria-label="Segment"
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border-2 border-violet-600 bg-violet-50 py-1 pr-1 pl-3 text-sm text-slate-800"
          >
            <span className="rounded bg-violet-700 px-2 py-0.5 font-bold text-white">Segment</span>
            <span>
              <strong>{segmentForced ? 'Manažer, vynucený' : 'Podle odpovědi a UTM'}</strong>
            </span>
            <span className="ml-auto flex items-center">
              <button
                type="button"
                aria-pressed={segmentForced}
                onClick={() => onToggleSegment(!segmentForced)}
                className="min-h-11 rounded-lg border-2 border-slate-800 bg-white px-3 font-semibold"
              >
                {segmentForced ? 'Zrušit vynucení' : 'Vynutit manažera'}
              </button>
              <InfoTip label="Co je přepínač segmentu">
                Segment se nepromítá do toho, co návštěvník vidí. Přínosy pro manažery dostávají
                všichni. Přepínač mění jen to, pod jakým segmentem se sjednání změří. Výsledek je
                vidět ve filtru Manažeři na stránce Měření. Na ostrém webu segment určí kampaň nebo
                odpověď „Jedete pracovně?“. Přepnutí začne sjednání znovu.
              </InfoTip>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
