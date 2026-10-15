import { ChevronDown, FlaskConical, Info } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import type { Variant } from '../analytics/experiment'
import { Tip } from './Tip'

function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tip
      label={label}
      content={children}
      className="flex size-11 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-amber-100 active:scale-90"
    >
      <Info aria-hidden="true" className="size-5" />
    </Tip>
  )
}

/** Jeden řádek lišty. Na 375 px se vejde stav, tlačítko i vysvětlivka vedle sebe. */
function Row({
  label,
  value,
  action,
  tip,
}: {
  label: string
  value: ReactNode
  action: ReactNode
  tip: ReactNode
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex items-center gap-2 rounded-xl bg-white/85 py-1 pr-0.5 pl-3 text-sm ring-1 ring-amber-200"
    >
      <span className="min-w-0 flex-1 truncate font-semibold text-slate-800">{value}</span>
      {action}
      {tip}
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
    'min-h-11 shrink-0 rounded-lg bg-ink px-3 text-sm font-bold whitespace-nowrap text-white transition hover:bg-brand-800 active:scale-95'

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
                value={`Varianta ${variant.toUpperCase()}`}
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
                    Ukáže obě varianty testu. Varianta A má balíčky pod sebou a žádný není vybraný.
                    Varianta B má balíčky vedle sebe a vybraný Komfort. Na ostrém webu by návštěvník
                    dostal jednu variantu náhodně a zůstal by u ní. Přepnutí začne sjednání znovu.
                  </InfoTip>
                }
              />
              <Row
                label="Segment"
                value={
                  <>
                    Segment{' '}
                    <span
                      className={`ml-1 rounded-md px-1.5 py-0.5 text-xs font-bold ${
                        segmentForced ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {segmentForced ? 'manažer' : 'auto'}
                    </span>
                  </>
                }
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
