import { ArrowRight, ChevronUp } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type TouchEvent } from 'react'
import { formatCzk, type PriceBreakdown } from '../../pricing'
import { useAnimatedNumber } from './useAnimatedNumber'

interface PriceDisplayProps {
  price: PriceBreakdown | null
  /** Cena nejlevnějšího balíčku, dokud klient balíček nevybral. */
  fromPrice: number | null
}

/** Cena se při změně dopočítá plynule, takže je vidět, že se něco přičetlo nebo odečetlo. */
function AnimatedCzk({ value }: { value: number }) {
  const shown = useAnimatedNumber(value)
  // Čtečka dostane jen výslednou cenu, ne každé mezičíslo animace.
  return (
    <>
      <span aria-hidden="true" className="tabular-nums">
        {formatCzk(shown)}
      </span>
      <span className="sr-only">{formatCzk(value)}</span>
    </>
  )
}

function PriceValue({ price, fromPrice }: PriceDisplayProps) {
  if (price) return <AnimatedCzk value={price.total} />
  if (fromPrice !== null)
    return (
      <>
        od <AnimatedCzk value={fromPrice} />
      </>
    )
  return <span className="text-base font-semibold text-slate-500">Vyplňte cestu</span>
}

function Breakdown({ price }: { price: PriceBreakdown }) {
  return (
    <dl className="space-y-2.5 text-sm">
      {price.lines.map((line) => (
        <div key={line.id} className="flex justify-between gap-4">
          <dt>
            <span className="font-semibold text-ink">{line.label}</span>
            <span className="block text-slate-600">{line.detail}</span>
          </dt>
          <dd
            className={`shrink-0 font-bold tabular-nums ${
              line.amount < 0 ? 'text-brand-700' : 'text-ink'
            }`}
          >
            {line.kind === 'included' ? 'v ceně' : formatCzk(line.amount)}
          </dd>
        </div>
      ))}
      <div className="flex justify-between border-t border-dashed border-slate-200 pt-2.5 text-base font-extrabold text-ink">
        <dt>Celkem</dt>
        <dd className="tabular-nums">{formatCzk(price.total)}</dd>
      </div>
    </dl>
  )
}

interface PriceBarProps extends PriceDisplayProps {
  /** Rozpis ceny „od“ pro Základ, dokud klient nevybral balíček. */
  fromBreakdown: PriceBreakdown | null
  continueLabel: string
  onContinue: () => void
}

function ContinueButton({
  label,
  onClick,
  className = '',
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-5 font-bold text-white shadow-[0_10px_24px_-10px_rgb(11_122_112/0.9)] transition hover:brightness-110 active:scale-[0.96] ${className}`}
    >
      {label}
      <ArrowRight
        aria-hidden="true"
        className="size-5 transition-transform duration-200 group-hover:translate-x-1"
      />
    </button>
  )
}

/** Swipe nahoru nebo dolů o víc než tolik pixelů otevře nebo zavře rozpis. */
const SWIPE_THRESHOLD = 36

/**
 * Přilepená lišta s průběžnou cenou. Na mobilu je dole, aby hlavní tlačítko bylo v dosahu palce.
 * Rozpis ceny vyjede nahoru po kliknutí na úchyt se šipkou nebo po swipu nahoru.
 * Na širší obrazovce se místo ní ukazuje boční souhrn.
 */
export function MobilePriceBar({
  price,
  fromPrice,
  fromBreakdown,
  continueLabel,
  onContinue,
}: PriceBarProps) {
  const [open, setOpen] = useState(false)
  const sheet = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const breakdownRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  const showPrice = price !== null || fromPrice !== null
  const breakdown = price ?? fromBreakdown
  const canOpen = breakdown !== null
  const isOpen = open && canOpen

  // Výšku sbalené lišty pošleme patičce stránky, aby text pod ní šel doscrollovat.
  useLayoutEffect(() => {
    const element = sheet.current
    const root = document.documentElement
    if (!element) return
    // Rozbalený rozpis se nepočítá, patička se odsadí jen o sbalenou lištu.
    const write = () =>
      root.style.setProperty(
        '--price-bar-h',
        `${element.offsetHeight - (grid.current?.offsetHeight ?? 0)}px`,
      )
    write()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(write) : null
    observer?.observe(element)
    return () => {
      observer?.disconnect()
      root.style.removeProperty('--price-bar-h')
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const onTouchStart = (event: TouchEvent) => {
    touchStart.current = event.touches[0].clientY
  }
  const onTouchEnd = (event: TouchEvent) => {
    if (touchStart.current === null) return
    const delta = event.changedTouches[0].clientY - touchStart.current
    touchStart.current = null
    // Když je rozpis odscrollovaný, swipe dolů nejdřív scrolluje jeho obsah.
    const scrolled = (breakdownRef.current?.scrollTop ?? 0) > 0
    if (delta < -SWIPE_THRESHOLD && canOpen) setOpen(true)
    if (delta > SWIPE_THRESHOLD && !scrolled) setOpen(false)
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-20 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        ref={sheet}
        className="fixed inset-x-0 bottom-0 z-30 rounded-t-3xl bg-white shadow-[0_-8px_30px_-6px_rgb(16_41_45/0.25)] lg:hidden"
      >
        {canOpen && (
          // Celý úchyt včetně okolí je jedno tlačítko, ne jen ikona.
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-breakdown"
            aria-label={isOpen ? 'Skrýt rozpis ceny' : 'Ukázat rozpis ceny'}
            onClick={() => setOpen((value) => !value)}
            className="flex h-9 w-full items-center justify-center rounded-t-3xl"
          >
            <span className="flex h-6 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <ChevronUp
                aria-hidden="true"
                strokeWidth={3}
                className={`size-5 transition-transform duration-300 ease-[cubic-bezier(.34,1.56,.64,1)] ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </span>
          </button>
        )}
        <div
          id="mobile-breakdown"
          ref={grid}
          className={`grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden" inert={!isOpen}>
            <div ref={breakdownRef} className="max-h-[55vh] overflow-y-auto px-4 pt-1 pb-3">
              <p className="text-base font-extrabold text-ink">Rozpis ceny</p>
              {!price && (
                <p className="text-sm text-slate-600">Cena „od“ platí pro balíček Základ.</p>
              )}
              {breakdown && (
                <div className="mt-3">
                  <Breakdown price={breakdown} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={`flex items-center justify-between gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
            canOpen ? 'pt-0' : 'pt-3'
          } ${isOpen ? 'border-t border-slate-100 pt-3' : ''}`}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">Cena celkem</p>
            <p className="text-2xl font-extrabold whitespace-nowrap text-ink" aria-live="polite">
              <PriceValue price={price} fromPrice={fromPrice} />
            </p>
            {!showPrice && <span className="sr-only">Cena se zobrazí po vyplnění cesty.</span>}
          </div>
          <ContinueButton label={continueLabel} onClick={onContinue} />
        </div>
      </div>
    </>
  )
}

export function DesktopSummary({
  price,
  fromPrice,
  fromBreakdown,
  continueLabel,
  onContinue,
}: PriceBarProps) {
  const breakdown = price ?? fromBreakdown
  return (
    <aside
      aria-label="Souhrn ceny"
      className="sticky top-4 hidden rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgb(16_41_45/0.06),0_12px_32px_-12px_rgb(16_41_45/0.18)] lg:block"
    >
      <p className="text-sm font-semibold text-slate-500">Cena celkem</p>
      <p className="text-3xl font-extrabold text-ink" aria-live="polite">
        <PriceValue price={price} fromPrice={fromPrice} />
      </p>
      {breakdown && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          {!price && (
            <p className="mb-3 text-sm text-slate-600">Cena „od“ platí pro balíček Základ.</p>
          )}
          <Breakdown price={breakdown} />
        </div>
      )}
      <ContinueButton label={continueLabel} onClick={onContinue} className="mt-5 w-full" />
    </aside>
  )
}
