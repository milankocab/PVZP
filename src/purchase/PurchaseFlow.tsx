import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PLAN_ORDER,
  countTravelers,
  formatCzk,
  includedLuggagePieces,
  isLuggageShared,
  tryCalculatePrice,
  type PlanId,
  type PriceBreakdown,
} from '../pricing'
import { LuggageDialog } from './components/LuggageDialog'
import { DesktopSummary, MobilePriceBar } from './components/PriceBar'
import {
  STEPS,
  createInitialState,
  toBasePriceInput,
  toPriceInput,
  validateStep,
  type Errors,
  type FormState,
  type StepId,
} from './state'
import { StepDetails } from './steps/StepDetails'
import { StepExtras } from './steps/StepExtras'
import { StepPayment } from './steps/StepPayment'
import { StepPlan } from './steps/StepPlan'
import { StepSummary, type UpsellOffer } from './steps/StepSummary'
import { StepTrip } from './steps/StepTrip'

const STEP_TITLES: Record<StepId, string> = {
  trip: 'Kam a kdy jedete',
  plan: 'Vyberte balíček',
  extras: 'Doplňky a vaše potřeby',
  details: 'Údaje pojistníka a cestujících',
  summary: 'Shrnutí a souhlasy',
  payment: 'Platba',
}

function priceFor(state: FormState): PriceBreakdown | null {
  const input = toPriceInput(state)
  if (!input) return null
  // Dokud klient nedoplní údaje pro storno, ukazujeme cenu bez něj, aby cena nezmizela.
  return (
    tryCalculatePrice(input) ??
    tryCalculatePrice({ ...input, addons: input.addons.filter((a) => a !== 'cancellation') })
  )
}

function focusFirstError(errors: Errors) {
  const first = Object.keys(errors)[0]
  if (!first) return
  requestAnimationFrame(() => {
    const element =
      document.getElementById(first) ??
      document.querySelector<HTMLElement>(`[name="${first}"]`) ??
      document.getElementById(`${first}-error`)
    element?.focus()
    element?.scrollIntoView({ block: 'center' })
  })
}

interface PurchaseFlowProps {
  preselectedPlan: PlanId | null
  upsellEnabled: boolean
}

export function PurchaseFlow({ preselectedPlan, upsellEnabled }: PurchaseFlowProps) {
  const [state, setState] = useState<FormState>(() => createInitialState(preselectedPlan))
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [luggageDialogOpen, setLuggageDialogOpen] = useState(false)
  const [purchased, setPurchased] = useState<PriceBreakdown | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  const step = STEPS[stepIndex]
  const price = priceFor(state)
  const basicInput = toBasePriceInput(state, 'basic')
  const fromPrice =
    !state.plan && basicInput ? (tryCalculatePrice(basicInput)?.total ?? null) : null

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    headingRef.current?.focus()
  }, [stepIndex, purchased])

  const update = (patch: Partial<FormState>) => {
    setState((current) => ({ ...current, ...patch }))
    // Chyby u polí, která klient právě opravuje, schováme. Ostatní nechá další pokus o pokračování.
    setErrors((current) => {
      if (Object.keys(current).length === 0) return current
      const next = { ...current }
      for (const key of Object.keys(patch)) delete next[key]
      return next
    })
  }

  const goNext = () => {
    if (step.id === 'payment') {
      setPurchased(price)
      return
    }
    setStepIndex((index) => index + 1)
  }

  const handleContinue = () => {
    const stepErrors = validateStep(step.id, state)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
      focusFirstError(stepErrors)
      return
    }
    if (step.id === 'extras' && state.plan) {
      const input = toPriceInput(state)
      if (input && isLuggageShared(input) && !state.luggageSharedConfirmed) {
        setLuggageDialogOpen(true)
        return
      }
    }
    goNext()
  }

  const upsell = ((): UpsellOffer | null => {
    if (!upsellEnabled || !state.plan || state.plan === 'premium' || !price) return null
    const nextPlan = PLAN_ORDER[PLAN_ORDER.indexOf(state.plan) + 1]
    const nextPrice = priceFor({ ...state, plan: nextPlan, luggagePieces: null })
    if (!nextPrice) return null
    return { plan: nextPlan, difference: nextPrice.total - price.total }
  })()

  if (purchased) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-slate-900">
          Hotovo. Pojištění je sjednané.
        </h1>
        <p className="mt-3 text-slate-800">
          Tohle je simulace. Nic se nezaplatilo a žádná smlouva nevznikla.
        </p>
        <p className="mt-6 text-lg">
          Zaplaceno (simulace) <strong>{formatCzk(purchased.total)}</strong>
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/"
            className="flex min-h-12 items-center justify-center rounded-lg bg-brand-700 px-5 font-semibold text-white"
          >
            Zpět na case study
          </Link>
          <button
            type="button"
            onClick={() => {
              setState(createInitialState(preselectedPlan))
              setStepIndex(0)
              setPurchased(null)
            }}
            className="min-h-12 rounded-lg border-2 border-brand-700 px-5 font-semibold text-brand-700"
          >
            Sjednat znovu
          </button>
        </div>
      </div>
    )
  }

  const continueLabel =
    step.id === 'payment'
      ? `Zaplatit (simulace)${price ? ` ${formatCzk(price.total)}` : ''}`
      : 'Pokračovat'
  const stepProps = { state, update, errors }
  const travelerCount = countTravelers(state.travelers)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-36 lg:pb-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <div>
          <div className="flex items-center justify-between gap-4">
            {stepIndex > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setErrors({})
                  setStepIndex((index) => index - 1)
                }}
                className="min-h-12 font-medium text-brand-700 underline underline-offset-2"
              >
                ← Zpět
              </button>
            ) : (
              <span />
            )}
            <p className="text-sm text-slate-600">
              Krok {stepIndex + 1} z {STEPS.length} · {step.label}
            </p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label="Postup sjednání"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={stepIndex + 1}
          >
            <div
              className="h-full bg-brand-700 transition-all"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-5 mb-4 text-2xl font-bold text-slate-900 sm:text-3xl"
          >
            {STEP_TITLES[step.id]}
          </h1>

          {Object.keys(errors).length > 0 && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 font-medium text-red-700">
              Zkontrolujte, prosím, označená pole.
            </p>
          )}

          {step.id === 'trip' && <StepTrip {...stepProps} />}
          {step.id === 'plan' && <StepPlan {...stepProps} />}
          {step.id === 'extras' && <StepExtras {...stepProps} />}
          {step.id === 'details' && <StepDetails {...stepProps} />}
          {step.id === 'summary' && (
            <StepSummary
              {...stepProps}
              upsell={upsell}
              onAcceptUpsell={() => upsell && update({ plan: upsell.plan, luggagePieces: null })}
            />
          )}
          {step.id === 'payment' && <StepPayment {...stepProps} />}
        </div>

        <DesktopSummary
          price={price}
          fromPrice={fromPrice}
          continueLabel={continueLabel}
          onContinue={handleContinue}
        />
      </div>

      <MobilePriceBar
        price={price}
        fromPrice={fromPrice}
        continueLabel={continueLabel}
        onContinue={handleContinue}
      />

      {state.plan && (
        <LuggageDialog
          open={luggageDialogOpen}
          plan={state.plan}
          pieces={state.luggagePieces ?? includedLuggagePieces(state.plan, state.travelers)}
          travelerCount={travelerCount}
          onAddPiece={() => {
            const pieces =
              state.luggagePieces ?? includedLuggagePieces(state.plan!, state.travelers)
            update({ luggagePieces: pieces + 1 })
            setLuggageDialogOpen(false)
          }}
          onUpgrade={
            state.plan === 'basic'
              ? () => {
                  update({ plan: 'comfort', luggagePieces: null })
                  setLuggageDialogOpen(false)
                }
              : null
          }
          onConfirm={() => {
            update({ luggageSharedConfirmed: true })
            setLuggageDialogOpen(false)
            goNext()
          }}
          onClose={() => setLuggageDialogOpen(false)}
        />
      )}
    </div>
  )
}
