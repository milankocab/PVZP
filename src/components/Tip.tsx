import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const MARGIN = 8
/** Otevřená bublina dá ostatním vědět, ať se zavřou. Vždy je otevřená nejvýš jedna. */
const OPEN_EVENT = 'odjezd-tip-open'

/** Výška spodní lišty s cenou. Bublina pod ni nesmí zajet. */
function bottomBarHeight(): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--price-bar-h')
  return parseFloat(value) || 0
}

/**
 * Klikací prvek, který otevře bublinu s vysvětlením.
 * Bublina se vykreslí nad celou stránkou (portál do body), takže ji nic neořízne.
 * Výchozí místo je pod prvkem. Když se tam nevejde, ukáže se nad ním.
 * Vodorovně se vždy posune tak, aby zůstala celá na obrazovce.
 */
export function Tip({
  content,
  children,
  label,
  className = '',
}: {
  content: ReactNode
  children: ReactNode
  /** Popis tlačítka pro čtečky, když obsah tlačítka není text (např. ikona). */
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const arrow = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect()
      const element = bubble.current
      if (!anchor || !element) return
      const size = element.getBoundingClientRect()
      const bottomLimit = window.innerHeight - bottomBarHeight() - MARGIN
      let top = anchor.bottom + MARGIN
      let placement: 'bottom' | 'top' = 'bottom'
      if (top + size.height > bottomLimit && anchor.top - MARGIN - size.height >= MARGIN) {
        placement = 'top'
        top = anchor.top - MARGIN - size.height
      }
      const center = anchor.left + anchor.width / 2
      const left = Math.max(
        MARGIN,
        Math.min(center - size.width / 2, window.innerWidth - size.width - MARGIN),
      )
      element.style.top = `${Math.round(top)}px`
      element.style.left = `${Math.round(left)}px`
      element.style.visibility = 'visible'
      element.dataset.placement = placement
      if (arrow.current) {
        arrow.current.style.left = `${Math.round(Math.min(Math.max(center - left, 16), size.width - 16))}px`
      }
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (trigger.current?.contains(target) || bubble.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, onOther)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_EVENT, onOther)
    }
  }, [open, id])

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (!open) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }))
          setOpen((value) => !value)
        }}
        className={className}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            ref={bubble}
            id={id}
            role="tooltip"
            style={{ visibility: 'hidden', top: 0, left: 0 }}
            className="group/tip fixed z-50 w-max max-w-[min(20rem,calc(100vw-1rem))] animate-fade rounded-2xl bg-white p-3.5 text-left text-sm leading-relaxed font-normal text-slate-800 shadow-[0_12px_40px_-8px_rgb(16_41_45/0.35)] ring-1 ring-slate-200"
          >
            <span
              ref={arrow}
              aria-hidden="true"
              className="absolute -top-1.5 size-3 -translate-x-1/2 rotate-45 bg-white ring-1 ring-slate-200 [clip-path:polygon(0_0,100%_0,0_100%)] group-data-[placement=top]/tip:top-auto group-data-[placement=top]/tip:-bottom-1.5 group-data-[placement=top]/tip:[clip-path:polygon(100%_0,100%_100%,0_100%)]"
            />
            {content}
          </div>,
          document.body,
        )}
    </>
  )
}
