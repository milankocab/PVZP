import {
  ADDONS,
  CANCELLATION,
  LUGGAGE,
  PLANS,
  REGIONS,
  formatCzk,
  formatPieces,
  includedLuggagePieces,
  isAddonIncluded,
  todayIso,
} from '../../pricing'
import { Checkbox, Counter, ErrorText, Section, TextField, YesNo } from '../components/ui'
import { type StepProps } from '../stepProps'

// Otázky na potřeby klienta jsou vložené přímo do výběru doplňků.
// Odpověď rovnou zapne nebo vypne odpovídající připojištění.
// Rozsah otázek na potřeby podle zákona o distribuci pojištění je nutné potvrdit s legal týmem.
export function StepExtras({ state, update, errors }: StepProps) {
  const plan = state.plan ? PLANS[state.plan] : null
  if (!plan || !state.region) return null

  const travelerCount = state.travelers.adult + state.travelers.child + state.travelers.senior
  const included = includedLuggagePieces(plan.id, state.travelers)
  const pieces = state.luggagePieces ?? included
  const extraPerDay = Math.round(
    REGIONS[state.region].dailyRate * plan.multiplier * plan.extraLuggage.dailyRateMultiplier,
  )
  const cancellationIncluded = isAddonIncluded(plan.id, 'cancellation')

  return (
    <div className="space-y-4">
      <Section title="Zavazadla">
        <p className="text-slate-800">
          V balíčku {plan.label} máte v ceně {formatPieces(included)}. Limit je{' '}
          {formatCzk(plan.luggageLimit)} na kufr včetně elektroniky.
        </p>
        <Counter
          id="luggagePieces"
          label="Kolik kufrů s sebou berete?"
          hint={`Každý další kufr ${formatCzk(extraPerDay)} za den`}
          unitLabel="kufr"
          value={pieces}
          min={1}
          max={travelerCount * LUGGAGE.maxPiecesPerTraveler}
          onChange={(luggagePieces) => update({ luggagePieces, luggageSharedConfirmed: false })}
        />
        <ErrorText id="luggagePieces-error" message={errors.luggagePieces} />
        {pieces < travelerCount && (
          <p className="text-sm font-medium text-red-700">
            Pojišťujete méně kufrů, než kolik vás jede. Limit {formatCzk(plan.luggageLimit)} platí
            na kufr, ne na osobu.
          </p>
        )}
      </Section>

      <Section title="Hory a sporty">
        <YesNo
          name="skiing"
          legend="Pojedete lyžovat nebo na hory?"
          hint={`Zapneme připojištění ${ADDONS.winterSports.label.toLowerCase()} za ${formatCzk(
            ADDONS.winterSports.pricing.type === 'perPersonPerDay'
              ? ADDONS.winterSports.pricing.amount
              : 0,
          )} na osobu a den.`}
          value={state.skiing}
          onChange={(skiing) => update({ skiing })}
          error={errors.skiing}
        />
      </Section>

      <Section title="Storno">
        {cancellationIncluded ? (
          <p className="text-slate-800">
            Storno zájezdu máte v balíčku {plan.label} v ceně, až do{' '}
            {formatCzk(CANCELLATION.includedLimitPerPerson)} na osobu. Nemusíte ho sjednat do žádné
            lhůty od koupě zájezdu.
          </p>
        ) : (
          <>
            <YesNo
              name="hasBookedTrip"
              legend="Máte už zaplacený zájezd, ubytování nebo letenky?"
              value={state.hasBookedTrip}
              onChange={(hasBookedTrip) =>
                update({
                  hasBookedTrip,
                  wantsCancellation: hasBookedTrip && state.wantsCancellation,
                })
              }
              error={errors.hasBookedTrip}
            />
            {state.hasBookedTrip && (
              <div className="space-y-4 rounded-lg bg-slate-50 p-3">
                <Checkbox
                  id="wantsCancellation"
                  checked={state.wantsCancellation}
                  onChange={(wantsCancellation) => update({ wantsCancellation })}
                >
                  <span className="font-semibold">Chci připojistit storno zájezdu</span>
                  <span className="block text-sm text-slate-600">
                    {ADDONS.cancellation.description} Cena{' '}
                    {(CANCELLATION.premiumRate * 100).toLocaleString('cs-CZ')} % z ceny zájezdu,
                    nejméně {formatCzk(CANCELLATION.minPremium)}.
                  </span>
                </Checkbox>
                {state.wantsCancellation && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      id="tripPrice"
                      label="Cena zájezdu za všechny (Kč)"
                      inputMode="numeric"
                      autoComplete="off"
                      value={state.tripPrice}
                      onChange={(tripPrice) =>
                        update({ tripPrice: tripPrice.replace(/[^\d ]/g, '') })
                      }
                      error={errors.tripPrice}
                    />
                    <TextField
                      id="tripBookedOn"
                      type="date"
                      label="Kdy jste zájezd zaplatili"
                      max={todayIso()}
                      value={state.tripBookedOn}
                      onChange={(tripBookedOn) => update({ tripBookedOn })}
                      error={errors.tripBookedOn}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  )
}
