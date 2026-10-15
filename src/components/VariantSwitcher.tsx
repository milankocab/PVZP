import { useId, useState } from 'react'
import type { Variant } from '../analytics/experiment'

const LABELS: Record<Variant, string> = {
  a: 'A · bez předvolby',
  b: 'B · předvybraný Komfort',
}

/** Ladicí přepínač variant pro ukázku prototypu. Na ostrém webu by nebyl. */
export function VariantSwitcher({
  variant,
  onSwitch,
}: {
  variant: Variant
  onSwitch: (next: Variant) => void
}) {
  const [hintOpen, setHintOpen] = useState(false)
  const hintId = useId()
  const next: Variant = variant === 'a' ? 'b' : 'a'

  return (
    <div className="border-b border-dashed border-amber-400 bg-amber-50">
      <div className="relative mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1 text-sm text-slate-800">
        <span>
          Ladění. Varianta <strong>{LABELS[variant]}</strong>
        </span>
        <button
          type="button"
          onClick={() => onSwitch(next)}
          aria-describedby={hintId}
          className="min-h-11 rounded-lg border-2 border-slate-800 bg-white px-3 font-semibold"
        >
          Přepnout na {next.toUpperCase()}
        </button>
        <span
          className="group relative"
          onMouseEnter={() => setHintOpen(true)}
          onMouseLeave={() => setHintOpen(false)}
        >
          <button
            type="button"
            aria-label="Co je tento přepínač"
            aria-expanded={hintOpen}
            aria-controls={hintId}
            onClick={() => setHintOpen((open) => !open)}
            onBlur={() => setHintOpen(false)}
            className="flex size-11 items-center justify-center rounded-full font-bold text-slate-800"
          >
            <span
              aria-hidden="true"
              className="flex size-6 items-center justify-center rounded-full border-2 border-slate-800"
            >
              i
            </span>
          </button>
          <span
            id={hintId}
            role="tooltip"
            hidden={!hintOpen}
            className="absolute top-full right-0 z-30 w-72 max-w-[calc(100vw-2rem)] rounded-lg bg-slate-900 p-3 text-sm text-white shadow-lg sm:right-auto sm:left-0"
          >
            Ladicí přepínač pro ukázku obou variant. Na ostrém webu by nebyl, návštěvník by dostal
            jednu variantu náhodně a zůstal by u ní. Přepnutí začne sjednání znovu.
          </span>
        </span>
      </div>
    </div>
  )
}
