import {
  Bike,
  Dumbbell,
  Footprints,
  Gauge,
  Luggage,
  Mountain,
  MountainSnow,
  Snowflake,
  Ticket,
  Waves,
  Wind,
  X,
  Fish,
  type LucideIcon,
} from 'lucide-react'
import {
  ADDONS,
  CANCELLATION,
  LUGGAGE,
  PLANS,
  REGIONS,
  SPORT_ACTIVITIES,
  SPORT_ORDER,
  countTravelers,
  formatCzk,
  formatPieces,
  includedLuggagePieces,
  isAddonIncluded,
  todayIso,
  type SportId,
} from '../../pricing'
import {
  ChoiceChips,
  Counter,
  ErrorText,
  InfoNote,
  Section,
  TextField,
  ToggleCard,
  YesNo,
  type Tone,
} from '../components/ui'
import { type StepProps } from '../stepProps'

const SPORT_ICONS: Record<SportId, { icon: LucideIcon; tone: Tone }> = {
  ski: { icon: Snowflake, tone: 'sky' },
  climbing: { icon: Mountain, tone: 'amber' },
  water: { icon: Waves, tone: 'brand' },
  diving: { icon: Fish, tone: 'violet' },
  mtb: { icon: Bike, tone: 'lime' },
  air: { icon: Wind, tone: 'rose' },
  motor: { icon: Gauge, tone: 'accent' },
  other: { icon: Footprints, tone: 'slate' },
}

// Otázky na potřeby klienta jsou vložené přímo do výběru doplňků.
// Odpověď rovnou zapne nebo vypne odpovídající připojištění.
// Rozsah otázek na potřeby podle zákona o distribuci pojištění je nutné potvrdit s legal týmem.
export function StepExtras({ state, update, errors }: StepProps) {
  const plan = state.plan ? PLANS[state.plan] : null
  if (!plan || !state.region) return null

  const travelerCount = countTravelers(state.travelers)
  const included = includedLuggagePieces(plan.id, state.travelers)
  const pieces = state.luggagePieces ?? included
  const extraPerDay = Math.round(
    REGIONS[state.region].dailyRate * plan.multiplier * plan.extraLuggage.dailyRateMultiplier,
  )
  const cancellationIncluded = isAddonIncluded(plan.id, 'cancellation')
  const sportsPrice =
    ADDONS.winterSports.pricing.type === 'perPersonPerDay' ? ADDONS.winterSports.pricing.amount : 0
  const riskySelected = state.sportActivities.some((id) => SPORT_ACTIVITIES[id].risky)

  return (
    <div className="space-y-4">
      <Section title="Zavazadla" icon={Luggage} tone="accent">
        <p className="text-slate-700">
          V balíčku {plan.label} máte v ceně {formatPieces(included)}. Limit{' '}
          <strong className="text-ink">{formatCzk(plan.luggageLimit)}</strong> platí na jeden kufr
          včetně elektroniky.
        </p>
        <Counter
          id="luggagePieces"
          label="Kolik kufrů berete?"
          hint={`Další kufr ${formatCzk(extraPerDay)} za den`}
          unitLabel="kufr"
          icon={Luggage}
          tone="accent"
          value={pieces}
          min={1}
          max={travelerCount * LUGGAGE.maxPiecesPerTraveler}
          onChange={(luggagePieces) => update({ luggagePieces, luggageSharedConfirmed: false })}
        />
        <ErrorText id="luggagePieces-error" message={errors.luggagePieces} />
        {pieces < travelerCount && (
          <InfoNote>
            Jede vás {travelerCount} a pojišťujete {formatPieces(pieces)}. Limit{' '}
            {formatCzk(plan.luggageLimit)} platí na jeden kufr, ne na osobu.
          </InfoNote>
        )}
      </Section>

      <Section title="Sport" icon={MountainSnow} tone="sky">
        <YesNo
          name="sports"
          legend="Budete na cestě sportovat?"
          yesIcon={Dumbbell}
          noIcon={X}
          value={state.sports}
          onChange={(sports) => update({ sports })}
          error={errors.sports}
        />
        {state.sports && (
          <>
            <ChoiceChips<SportId>
              name="sportActivities"
              legend="Co plánujete?"
              values={state.sportActivities}
              onChange={(sportActivities) => update({ sportActivities })}
              error={errors.sportActivities}
              options={SPORT_ORDER.map((id) => ({
                value: id,
                label: SPORT_ACTIVITIES[id].label,
                description: SPORT_ACTIVITIES[id].examples,
                ...SPORT_ICONS[id],
              }))}
            />
            {riskySelected ? (
              <InfoNote>
                Přidali jsme připojištění {ADDONS.winterSports.label.toLowerCase()} za{' '}
                {formatCzk(sportsPrice)} na osobu a den.
              </InfoNote>
            ) : (
              state.sportActivities.includes('other') && (
                <InfoNote>Běžné sporty máte v ceně balíčku. Nic nepřiplácíte.</InfoNote>
              )
            )}
          </>
        )}
      </Section>

      <Section title="Storno zájezdu" icon={Ticket} tone="violet">
        {cancellationIncluded ? (
          <p className="text-slate-700">
            V balíčku {plan.label} máte storno v ceně, až do{' '}
            {formatCzk(CANCELLATION.includedLimitPerPerson)} na osobu. Nemusíte ho sjednat do žádné
            lhůty od koupě zájezdu.
          </p>
        ) : (
          <>
            <ToggleCard
              id="wantsCancellation"
              checked={state.wantsCancellation}
              onChange={(wantsCancellation) => update({ wantsCancellation })}
              title="Připojistit storno zájezdu"
              description={`Pro zaplacený zájezd, ubytování nebo letenky. ${(
                CANCELLATION.premiumRate * 100
              ).toLocaleString('cs-CZ')} % z ceny, nejméně ${formatCzk(CANCELLATION.minPremium)}.`}
            />
            {state.wantsCancellation && (
              <div className="animate-rise space-y-4 rounded-2xl bg-violet-50/60 p-3 ring-1 ring-violet-100">
                <p className="text-sm text-slate-700">{ADDONS.cancellation.description}</p>
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
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  )
}
