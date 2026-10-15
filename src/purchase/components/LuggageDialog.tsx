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
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-0 backdrop:bg-slate-900/60"
    >
      <div className="space-y-4 p-5">
        <h2 id="luggage-dialog-title" className="text-xl font-bold text-red-700">
          Pojišťujete méně kufrů, než kolik vás jede
        </h2>
        <p className="font-semibold text-red-700">
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
            className="min-h-12 rounded-lg bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800"
          >
            Přidat kufr
          </button>
          {onUpgrade && (
            <button
              type="button"
              onClick={onUpgrade}
              className="min-h-12 rounded-lg border-2 border-brand-700 px-4 font-semibold text-brand-700"
            >
              Přejít na Komfort s kufrem pro každého
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-12 rounded-lg px-4 font-semibold text-slate-800 underline underline-offset-2"
          >
            Rozumím, pokračovat s {pieces === 1 ? '1 kufrem' : `${pieces} kufry`}
          </button>
        </div>
      </div>
    </dialog>
  )
}
