import { useEffect, useState } from 'react'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Kroužek s číslem kroku. Při přechodu na další krok se dotočí z předchozí hodnoty na novou,
 * takže klient vidí, že se posunul. Při prvním zobrazení se dotočí od nuly.
 */
export function ProgressRing({ step, total }: { step: number; total: number }) {
  const target = step / total
  const [shown, setShown] = useState(0)

  useEffect(() => {
    // Hodnota se nastaví až po vykreslení, jinak by prohlížeč přechod přeskočil.
    const frame = requestAnimationFrame(() => setShown(target))
    return () => cancelAnimationFrame(frame)
  }, [target])

  return (
    <div
      role="progressbar"
      aria-label="Postup sjednání"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-valuetext={`Krok ${step} z ${total}`}
      className="relative size-14 shrink-0"
    >
      <svg viewBox="0 0 56 56" className="size-14 -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-400)" />
            <stop offset="100%" stopColor="var(--color-brand-700)" />
          </linearGradient>
        </defs>
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="white"
          stroke="var(--color-brand-100)"
          strokeWidth="6"
        />
        <circle
          cx="28"
          cy="28"
          r={RADIUS}
          fill="none"
          stroke="url(#progress-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - shown)}
          className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
        />
      </svg>
      <span
        key={step}
        aria-hidden="true"
        className="absolute inset-0 flex animate-pop items-center justify-center text-lg font-extrabold text-ink"
      >
        {step}
        <span className="text-xs font-bold text-slate-500">/{total}</span>
      </span>
    </div>
  )
}
