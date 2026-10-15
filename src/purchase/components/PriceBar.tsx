import { useState } from 'react'
import { formatCzk, type PriceBreakdown } from '../../pricing'

interface PriceDisplayProps {
  price: PriceBreakdown | null
  /** Cena nejlevnějšího balíčku, dokud klient balíček nevybral. */
  fromPrice: number | null
}

function PriceValue({ price, fromPrice }: PriceDisplayProps) {
  if (price) return <>{formatCzk(price.total)}</>
  if (fromPrice !== null) return <>od {formatCzk(fromPrice)}</>
  return <span className="text-base font-normal">Vyplňte cestu</span>
}

function Breakdown({ price }: { price: PriceBreakdown }) {
  return (
    <dl className="space-y-2 text-sm">
      {price.lines.map((line) => (
        <div key={line.id} className="flex justify-between gap-4">
          <dt>
            <span className="font-medium text-slate-900">{line.label}</span>
            <span className="block text-slate-600">{line.detail}</span>
          </dt>
          <dd className="shrink-0 font-medium text-slate-900">
            {line.kind === 'included' ? 'v ceně' : formatCzk(line.amount)}
          </dd>
        </div>
      ))}
      <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
        <dt>Celkem</dt>
        <dd>{formatCzk(price.total)}</dd>
      </div>
    </dl>
  )
}

interface PriceBarProps extends PriceDisplayProps {
  continueLabel: string
  onContinue: () => void
  onBack?: () => void
}

/**
 * Přilepená lišta s průběžnou cenou. Na mobilu je dole, aby hlavní tlačítko bylo v dosahu palce.
 * Na širší obrazovce se místo ní ukazuje boční souhrn.
 */
export function MobilePriceBar({ price, fromPrice, continueLabel, onContinue }: PriceBarProps) {
  const [open, setOpen] = useState(false)
  const showPrice = price !== null || fromPrice !== null

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
      {open && price && (
        <div id="mobile-breakdown" className="max-h-[50vh] overflow-y-auto px-4 pt-4">
          <Breakdown price={price} />
        </div>
      )}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-600">Cena celkem</p>
          <p className="text-xl font-bold text-slate-900" aria-live="polite">
            <PriceValue price={price} fromPrice={fromPrice} />
          </p>
          {price && (
            <button
              type="button"
              className="text-sm font-medium text-brand-700 underline underline-offset-2"
              aria-expanded={open}
              aria-controls="mobile-breakdown"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? 'Skrýt rozpis' : 'Rozpis ceny'}
            </button>
          )}
          {!showPrice && <span className="sr-only">Cena se zobrazí po vyplnění cesty.</span>}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="min-h-12 shrink-0 rounded-lg bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
        >
          {continueLabel}
        </button>
      </div>
    </div>
  )
}

export function DesktopSummary({ price, fromPrice, continueLabel, onContinue }: PriceBarProps) {
  return (
    <aside
      aria-label="Souhrn ceny"
      className="sticky top-4 hidden rounded-xl border border-slate-200 bg-white p-5 lg:block"
    >
      <p className="text-sm text-slate-600">Cena celkem</p>
      <p className="text-3xl font-bold text-slate-900" aria-live="polite">
        <PriceValue price={price} fromPrice={fromPrice} />
      </p>
      {price && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <Breakdown price={price} />
        </div>
      )}
      <button
        type="button"
        onClick={onContinue}
        className="mt-5 min-h-12 w-full rounded-lg bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
      >
        {continueLabel}
      </button>
    </aside>
  )
}
