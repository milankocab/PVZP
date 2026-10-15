import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** Plynule dopočítá číslo z předchozí hodnoty na novou. Cena tak „dojede“, místo aby skočila. */
export function useAnimatedNumber(value: number, duration = 450): number {
  const [shown, setShown] = useState(value)
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    if (start === value) return
    // Bez animace dojede číslo v prvním snímku.
    const length = prefersReducedMotion() ? 0 : duration
    let frame = 0
    const began = performance.now()
    const tick = (now: number) => {
      const t = length === 0 ? 1 : Math.min(1, (now - began) / length)
      const eased = 1 - Math.pow(1 - t, 3)
      const current = Math.round(start + (value - start) * eased)
      from.current = current
      setShown(current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return shown
}
