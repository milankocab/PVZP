import {
  ArrowRight,
  Backpack,
  BadgePercent,
  Briefcase,
  CalendarDays,
  Earth,
  Glasses,
  HeartPulse,
  Landmark,
  MapPin,
  Palmtree,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import {
  MAX_TRAVELERS,
  REGIONS,
  TRAVELER_TYPES,
  countTravelers,
  todayIso,
  tripDays,
  type RegionId,
  type TravelerType,
} from '../../pricing'
import {
  ChoiceCards,
  Counter,
  ErrorText,
  Section,
  TextField,
  ToggleCard,
  type Tone,
} from '../components/ui'
import { resizeTravelerDetails, sampleTrip, type StepProps } from '../stepProps'

const UNIT_LABELS = { adult: 'dospělého', child: 'dítě', senior: 'seniora' } as const
const TRAVELER_ICONS: Record<TravelerType, { icon: typeof User; tone: Tone }> = {
  adult: { icon: User, tone: 'brand' },
  child: { icon: Backpack, tone: 'amber' },
  senior: { icon: Glasses, tone: 'violet' },
}
const REGION_ICONS: Record<RegionId, { icon: typeof User; tone: Tone }> = {
  europe: { icon: Landmark, tone: 'sky' },
  world: { icon: Earth, tone: 'lime' },
}

function daysLabel(days: number): string {
  if (days === 1) return '1 den'
  if (days < 5) return `${days} dny`
  return `${days} dní`
}

export function StepTrip({ state, update, errors }: StepProps) {
  const today = todayIso()
  const total = countTravelers(state.travelers)
  const days = state.departure && state.return ? tripDays(state.departure, state.return) : null

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => {
          const sample = sampleTrip(today)
          update({
            ...sample,
            travelerDetails: resizeTravelerDetails(state.travelerDetails, sample.travelers!),
            luggagePieces: null,
            luggageSharedConfirmed: false,
          })
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 transition hover:bg-brand-50 active:scale-95"
      >
        <Sparkles aria-hidden="true" className="size-4" />
        Vyplnit ukázkovou cestu
      </button>

      <Section title="Kam" icon={MapPin} tone="sky">
        <ChoiceCards<RegionId>
          name="region"
          legend="Kam jedete"
          legendHidden
          columns={2}
          stacked
          value={state.region}
          onChange={(region) => update({ region })}
          error={errors.region}
          options={(Object.keys(REGIONS) as RegionId[]).map((id) => ({
            value: id,
            label: REGIONS[id].label,
            description: REGIONS[id].shortDescription,
            ...REGION_ICONS[id],
          }))}
        />
        {state.region && (
          <p key={state.region} className="animate-fade text-sm text-slate-600">
            {REGIONS[state.region].description}.
          </p>
        )}
      </Section>

      <Section
        title="Kdy"
        icon={CalendarDays}
        tone="violet"
        aside={
          days !== null && (
            <span
              key={days}
              className="inline-flex animate-pop rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-800"
            >
              {daysLabel(days)}
            </span>
          )
        }
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
          <TextField
            id="departure"
            type="date"
            label="Odjezd"
            min={today}
            value={state.departure}
            onChange={(departure) =>
              update(
                state.return && departure > state.return
                  ? { departure, return: departure }
                  : { departure },
              )
            }
            error={errors.departure}
          />
          <ArrowRight aria-hidden="true" className="mt-11 size-4 text-slate-400" />
          <TextField
            id="return"
            type="date"
            label="Návrat"
            min={state.departure || today}
            value={state.return}
            onChange={(value) => update({ return: value })}
            error={errors.return}
          />
        </div>
      </Section>

      <Section
        title="Kdo jede"
        icon={Users}
        tone="amber"
        aside={
          <span
            key={total}
            className="inline-flex animate-pop rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-900"
          >
            {total} {total === 1 ? 'osoba' : total < 5 ? 'osoby' : 'osob'}
          </span>
        }
      >
        <div className="-my-1 divide-y divide-slate-100">
          {(Object.keys(TRAVELER_TYPES) as TravelerType[]).map((type) => (
            <Counter
              key={type}
              id={`travelers-${type}`}
              label={TRAVELER_TYPES[type].labelPlural}
              hint={TRAVELER_TYPES[type].ageHint}
              unitLabel={UNIT_LABELS[type]}
              {...TRAVELER_ICONS[type]}
              value={state.travelers[type]}
              min={0}
              max={state.travelers[type] + (MAX_TRAVELERS - total)}
              onChange={(count) => {
                const travelers = { ...state.travelers, [type]: count }
                update({
                  travelers,
                  travelerDetails: resizeTravelerDetails(state.travelerDetails, travelers),
                  // Počet kufrů se odvíjí od cestujících. Po změně začínáme znovu od kufrů v ceně.
                  luggagePieces: null,
                  luggageSharedConfirmed: false,
                })
              }}
            />
          ))}
        </div>
        <ErrorText id="travelers-error" message={errors.travelers} />

        <ChoiceCards
          name="tripPurpose"
          legend="Jedete pracovně?"
          columns={2}
          value={state.tripPurpose}
          onChange={(tripPurpose) => update({ tripPurpose })}
          options={[
            { value: 'business', label: 'Pracovně', icon: Briefcase, tone: 'violet' },
            { value: 'leisure', label: 'Na dovolenou', icon: Palmtree, tone: 'lime' },
          ]}
        />
      </Section>

      <Section title="Slevy" icon={BadgePercent} tone="accent">
        <ToggleCard
          id="healthInsurer"
          checked={state.memberDiscounts.healthInsurer}
          onChange={(healthInsurer) =>
            update({
              memberDiscounts: {
                healthInsurer,
                healthClub: healthInsurer && state.memberDiscounts.healthClub,
              },
            })
          }
          title="Jsem pojištěnec VZP"
          icon={BadgePercent}
          tone="accent"
          badge="−20 %"
        />
        <ToggleCard
          id="healthClub"
          checked={state.memberDiscounts.healthClub}
          disabled={!state.memberDiscounts.healthInsurer}
          onChange={(healthClub) =>
            update({ memberDiscounts: { ...state.memberDiscounts, healthClub } })
          }
          error={errors.memberDiscounts}
          title="Jsem člen Klubu pevného zdraví"
          description={
            state.memberDiscounts.healthInsurer ? undefined : 'Platí jen pro pojištěnce VZP.'
          }
          icon={HeartPulse}
          tone="rose"
          badge="dalších −10 %"
        />
      </Section>
    </div>
  )
}
