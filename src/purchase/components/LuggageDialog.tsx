import { Luggage } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { PLANS, formatCzk, formatPieces, type PlanId } from '../../pricing'

interface LuggageDialogProps {
  open: boolean
  plan: PlanId
  pieces: number
  travelerCount: number
  onAddPiece: () => void
  onUpgrade: (() => void) | null
  onConfirm: () => void
  onClose: () => void
}

/**
 * Upozornění, když klient pojišťuje méně kufrů, než kolik lidí jede.
 * Limit platí na kufr, takže věci více lidí ve sdíleném kufru jsou pojištěné jen do jednoho limitu.
 */
export function LuggageDialog({
  open,
  plan,
  pieces,
  travelerCount,
  onAddPiece,
  onUpgrade,
  onConfirm,
  onClose,
}: LuggageDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal?.()
    if (!open && dialog.open) dialog.close?.()
  }, [open])

  const limit = formatCzk(PLANS[plan].luggageLimit)

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="luggage-dialog-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl p-0 shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="animate-rise space-y-4 p-5">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"
        >
          <Luggage className="size-6" />
        </span>
        <h2 id="luggage-dialog-title" className="text-xl font-extrabold text-ink">
          Pojišťujete méně kufrů, než kolik vás jede
        </h2>
        <p className="rounded-2xl bg-amber-50 p-3 font-semibold text-amber-950 ring-1 ring-amber-200">
          Jede vás {travelerCount} a pojišťujete {formatPieces(pieces)}. Limit {limit} platí na
          kufr. Věci více lidí v jednom kufru jsou tak pojištěné dohromady jen do {limit}.
        </p>
        <p className="text-slate-800">
          Doporučujeme zvážit, jakou hodnotu věci ve sdíleném kufru mají. Pokud vezete notebook nebo
          jinou dražší elektroniku, přidejte kufr nebo zvolte vyšší balíček.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onAddPiece}
            className="min-h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-4 font-bold text-white transition active:scale-[0.97]"
          >
            Přidat kufr
          </button>
          {onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className="min-h-12 rounded-2xl border-2 border-brand-600 px-4 font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.97]"
            >
              Přejít na Komfort s kufrem pro každého
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-2xl px-4 font-semibold text-slate-700 underline underline-offset-2"
          >
            Rozumím, pokračovat s {pieces === 1 ? '1 kufrem' : `${pieces} kufry`}
          </button>
        </div>
      </div>
    </dialog>
  )
}
