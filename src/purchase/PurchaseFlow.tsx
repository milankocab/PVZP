import { ArrowLeft, Check, CircleAlert } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
import { resolveSegment, type Variant } from '../analytics/experiment'
import { track, type EventName } from '../analytics/track'
import { LuggageDialog } from './components/LuggageDialog'
import { DesktopSummary, MobilePriceBar } from './components/PriceBar'
import { ProgressRing } from './components/ProgressRing'
import { UpsellNudge, type UpsellOffer } from './components/UpsellNudge'
import {
  STEPS,
  createInitialState,
  selectedAddons,
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
import { StepSummary } from './steps/StepSummary'
import { StepTrip } from './steps/StepTrip'

// Nadpis kroku je krátký. Sekce uvnitř kroku mají vlastní nadpisy, které ho neopakují.
const STEP_TITLES: Record<StepId, string> = {
  trip: 'Vaše cesta',
  plan: 'Vyberte balíček',
  extras: 'Doplňky',
  details: 'Vaše údaje',
  summary: 'Shrnutí',
  payment: 'Platba',
}

/** Konfety kolem fajfky po zaplacení. Každá tečka letí jiným směrem. */
const BURST = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2
  const distance = 64 + (index % 3) * 14
  return {
    dx: `${Math.round(Math.cos(angle) * distance)}px`,
    dy: `${Math.round(Math.sin(angle) * distance)}px`,
    color: ['bg-accent-500', 'bg-brand-400', 'bg-amber-300', 'bg-violet-400'][index % 4],
  }
})

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
  variant: Variant
  upsellEnabled: boolean
  segmentOverride?: string | null
  utmAudience?: string | null
}

/** Varianta A nemá předvybraný balíček, varianta B má předvybraný Komfort. Jinak jsou stejné. */
function preselectedPlanFor(variant: Variant): PlanId | null {
  return variant === 'b' ? 'comfort' : null
}

export function PurchaseFlow({
  variant,
  upsellEnabled,
  segmentOverride = null,
  utmAudience = null,
}: PurchaseFlowProps) {
  const preselectedPlan = preselectedPlanFor(variant)
  const [state, setState] = useState<FormState>(() => createInitialState(preselectedPlan))
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [luggageDialogOpen, setLuggageDialogOpen] = useState(false)
  const [purchased, setPurchased] = useState<PriceBreakdown | null>(null)
  // Po přijetí nabídka zmizí natrvalo, splnila účel. „Teď ne“ ji schová jen v daném kroku.
  const [upsellAccepted, setUpsellAccepted] = useState(false)
  const [upsellDismissed, setUpsellDismissed] = useState<StepId[]>([])
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)
  const tracked = useRef({
    started: false,
    lastStep: -1,
    priceShown: false,
    upsellSteps: [] as StepId[],
  })

  const step = STEPS[stepIndex]
  const nextStep = STEPS[stepIndex + 1] ?? null
  const price = priceFor(state)
  const basicInput = toBasePriceInput(state, 'basic')
  const fromPrice =
    !state.plan && basicInput ? (tryCalculatePrice(basicInput)?.total ?? null) : null

  // Kontext, který jde s každým eventem. Žádné osobní údaje, jen parametry z whitelistu track().
  const trackEvent = (name: EventName, extra: Record<string, unknown> = {}, from = state) => {
    const { segment, source } = resolveSegment(segmentOverride, utmAudience, from.tripPurpose)
    track(name, {
      variant,
      segment,
      segment_source: source,
      trip_purpose: from.tripPurpose ?? 'unknown',
      region: from.region ?? undefined,
      traveler_count: countTravelers(from.travelers),
      plan: from.plan ?? undefined,
      price: priceFor(from)?.total,
      ...extra,
    })
  }

  useEffect(() => {
    if (purchased) return
    if (!tracked.current.started) {
      tracked.current.started = true
      trackEvent('funnel_start')
    }
    if (tracked.current.lastStep !== stepIndex) {
      tracked.current.lastStep = stepIndex
      trackEvent('step_view', { step_number: stepIndex + 1, step_name: STEPS[stepIndex].id })
    }
    // Eventy se mají odeslat jen při změně kroku, ne při každé změně stavu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, purchased])

  useEffect(() => {
    if (tracked.current.priceShown || (price === null && fromPrice === null)) return
    tracked.current.priceShown = true
    trackEvent('price_shown', { price: price?.total ?? fromPrice })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price?.total, fromPrice])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0 })
    headingRef.current?.focus()
  }, [stepIndex, purchased])

  const update = (patch: Partial<FormState>) => {
    const next = { ...state, ...patch }
    if (patch.plan && patch.plan !== state.plan) trackEvent('plan_selected', {}, next)
    const before = selectedAddons(state)
    const after = selectedAddons(next)
    for (const addon of new Set([...before, ...after])) {
      if (before.includes(addon) !== after.includes(addon)) {
        trackEvent('addon_toggled', { addon, enabled: after.includes(addon) }, next)
      }
    }
    if (patch.paymentMethod && !state.paymentMethod) {
      trackEvent('payment_started', { payment_method: patch.paymentMethod }, next)
    }
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
    trackEvent('step_complete', { step_number: stepIndex + 1, step_name: step.id })
    if (step.id === 'summary') trackEvent('checkout_click')
    if (step.id === 'payment') {
      trackEvent('purchase_simulated', { payment_method: state.paymentMethod ?? undefined })
      setPurchased(price)
      return
    }
    setStepIndex((index) => index + 1)
  }

  const handleContinue = () => {
    const stepErrors = validateStep(step.id, state)
    setErrors(stepErrors)
    if (Object.keys(stepErrors).length > 0) {
      for (const field of Object.keys(stepErrors)) {
        // Posílá se jen název pole, nikdy jeho hodnota.
        trackEvent('validation_error', {
          step_number: stepIndex + 1,
          step_name: step.id,
          field: field.replace(/^traveler-\d+-/, 'traveler-'),
        })
      }
      focusFirstError(stepErrors)
      return
    }
    if (step.id === 'extras' && state.plan) {
      const input = toPriceInput(state)
      if (input && isLuggageShared(input) && !state.luggageSharedConfirmed) {
        trackEvent('luggage_warning_shown')
        setLuggageDialogOpen(true)
        return
      }
    }
    goNext()
  }

  const upsell = ((): UpsellOffer | null => {
    if (!upsellEnabled || upsellAccepted || !state.plan || state.plan === 'premium' || !price) {
      return null
    }
    const nextPlan = PLAN_ORDER[PLAN_ORDER.indexOf(state.plan) + 1]
    const nextPrice = priceFor({ ...state, plan: nextPlan, luggagePieces: null })
    if (!nextPrice) return null
    return { plan: nextPlan, from: state.plan, difference: nextPrice.total - price.total }
  })()

  // Nabídka je v každém kroku od výběru balíčku. V kroku Cesta ještě není co nabízet.
  const upsellVisible = step.id !== 'trip' && upsell !== null && !upsellDismissed.includes(step.id)
  useEffect(() => {
    if (!upsellVisible || tracked.current.upsellSteps.includes(step.id)) return
    tracked.current.upsellSteps.push(step.id)
    trackEvent('upsell_shown', { step_number: stepIndex + 1, step_name: step.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upsellVisible, step.id])

  if (purchased) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10 text-center">
        <div className="relative mx-auto size-24" aria-hidden="true">
          {BURST.map((dot, index) => (
            <span
              key={index}
              style={{ '--dx': dot.dx, '--dy': dot.dy } as CSSProperties}
              className={`absolute top-1/2 left-1/2 -mt-1.5 -ml-1.5 size-3 animate-burst rounded-full ${dot.color}`}
            />
          ))}
          <span className="absolute inset-0 flex animate-pop items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 shadow-[0_12px_32px_-8px_rgb(18_160_145/0.7)]">
            <svg viewBox="0 0 24 24" className="size-12 text-white">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="48"
                className="animate-draw"
              />
            </svg>
          </span>
        </div>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-8 animate-rise text-3xl font-extrabold tracking-tight text-ink"
        >
          Hotovo. Pojištění je sjednané.
        </h1>
        <p className="mt-3 animate-rise text-slate-700 [animation-delay:80ms]">
          Tohle je simulace. Nic se nezaplatilo a žádná smlouva nevznikla.
        </p>
        <p className="mx-auto mt-6 inline-flex animate-rise items-center gap-2 rounded-full bg-white px-5 py-2 text-lg shadow-sm [animation-delay:160ms]">
          <Check aria-hidden="true" className="size-5 text-brand-600" strokeWidth={3} />
          Zaplaceno (simulace){' '}
          <strong className="tabular-nums">{formatCzk(purchased.total)}</strong>
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-ink px-6 font-bold text-white transition hover:bg-brand-800 active:scale-[0.97]"
          >
            Zpět na case study
          </Link>
          <button
            type="button"
            onClick={() => {
              tracked.current = {
                started: false,
                lastStep: -1,
                priceShown: false,
                upsellSteps: [] as StepId[],
              }
              setState(createInitialState(preselectedPlan))
              setStepIndex(0)
              setPurchased(null)
              setUpsellAccepted(false)
              setUpsellDismissed([])
            }}
            className="min-h-12 rounded-2xl border-2 border-brand-600 bg-white px-6 font-bold text-brand-700 transition hover:bg-brand-50 active:scale-[0.97]"
          >
            Sjednat znovu
          </button>
        </div>
      </div>
    )
  }

  // Cena je vidět hned vedle tlačítka, proto ji popisek neopakuje. Na 375 px by se nevešla.
  const continueLabel = step.id === 'payment' ? 'Zaplatit (simulace)' : 'Pokračovat'
  const stepProps = { state, update, errors }
  const travelerCount = countTravelers(state.travelers)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-5 pb-10 lg:pb-12">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {stepIndex > 0 && (
              <button
                type="button"
                aria-label="Zpět na předchozí krok"
                onClick={() => {
                  setErrors({})
                  setStepIndex((index) => index - 1)
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm ring-1 ring-slate-200 transition hover:bg-brand-50 active:scale-90"
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
              </button>
            )}
            <ProgressRing step={stepIndex + 1} total={STEPS.length} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-600">
                Krok {stepIndex + 1} z {STEPS.length}
                {nextStep && (
                  <span className="text-slate-500"> · dál {nextStep.label.toLowerCase()}</span>
                )}
              </p>
              <h1
                ref={headingRef}
                tabIndex={-1}
                key={step.id}
                className="animate-rise text-2xl font-extrabold tracking-tight text-ink outline-none sm:text-3xl"
              >
                {STEP_TITLES[step.id]}
              </h1>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {Object.keys(errors).length > 0 && (
              <p
                role="alert"
                className="flex animate-rise items-center gap-2 rounded-2xl bg-red-50 p-3 font-semibold text-red-800 ring-1 ring-red-200"
              >
                <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
                Zkontrolujte, prosím, označená pole.
              </p>
            )}

            {step.id === 'trip' && <StepTrip {...stepProps} />}
            {step.id === 'plan' && <StepPlan {...stepProps} />}
            {step.id === 'extras' && <StepExtras {...stepProps} />}
            {step.id === 'details' && <StepDetails {...stepProps} />}
            {step.id === 'summary' && <StepSummary {...stepProps} />}
            {step.id === 'payment' && <StepPayment {...stepProps} />}

            {upsellVisible && upsell && (
              <UpsellNudge
                key={upsell.plan}
                offer={upsell}
                onAccept={() => {
                  trackEvent('upsell_accepted', {
                    plan: upsell.plan,
                    step_number: stepIndex + 1,
                    step_name: step.id,
                  })
                  update({ plan: upsell.plan, luggagePieces: null, luggageSharedConfirmed: false })
                  setUpsellAccepted(true)
                }}
                onDismiss={() => setUpsellDismissed((steps) => [...steps, step.id])}
              />
            )}
          </div>
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
            trackEvent('luggage_warning_choice', { choice: 'add_piece' })
            update({ luggagePieces: pieces + 1 })
            setLuggageDialogOpen(false)
          }}
          onUpgrade={
            state.plan === 'basic'
              ? () => {
                  trackEvent('luggage_warning_choice', { choice: 'upgrade' })
                  update({ plan: 'comfort', luggagePieces: null })
                  setLuggageDialogOpen(false)
                }
              : null
          }
          onConfirm={() => {
            trackEvent('luggage_warning_choice', { choice: 'confirm' })
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
