import { MAX_TRAVELERS, REGIONS, TRAVELER_TYPES, todayIso, type RegionId } from '../../pricing'
import { Checkbox, ChoiceCards, Counter, ErrorText, Section, TextField } from '../components/ui'
import { resizeTravelerDetails, sampleTrip, type StepProps } from '../stepProps'

const UNIT_LABELS = { adult: 'dospělého', child: 'dítě', senior: 'seniora' } as const

export function StepTrip({ state, update, errors }: StepProps) {
  const today = todayIso()
  const total = state.travelers.adult + state.travelers.child + state.travelers.senior

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
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand-700 underline underline-offset-2"
      >
        Vyplnit ukázkovou cestu
      </button>

      <Section title="Kam jedete">
        <ChoiceCards<RegionId>
          name="region"
          legend="Oblast"
          value={state.region}
          onChange={(region) => update({ region })}
          error={errors.region}
          options={(Object.keys(REGIONS) as RegionId[]).map((id) => ({
            value: id,
            label: REGIONS[id].label,
            description: REGIONS[id].description,
          }))}
        />
      </Section>

      <Section title="Kdy">
        <div className="grid gap-4 sm:grid-cols-2">
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

      <Section title="Kdo jede">
        <div className="divide-y divide-slate-200">
          {(Object.keys(TRAVELER_TYPES) as (keyof typeof TRAVELER_TYPES)[]).map((type) => (
            <Counter
              key={type}
              id={`travelers-${type}`}
              label={TRAVELER_TYPES[type].labelPlural}
              hint={TRAVELER_TYPES[type].ageHint}
              unitLabel={UNIT_LABELS[type]}
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
          legend="Jedete pracovně? (nepovinné)"
          hint="Pomůže nám ukázat, co je pro vás v balíčcích důležité."
          columns={2}
          value={state.tripPurpose}
          onChange={(tripPurpose) => update({ tripPurpose })}
          options={[
            { value: 'business', label: 'Ano, pracovně' },
            { value: 'leisure', label: 'Ne, na dovolenou' },
          ]}
        />
      </Section>

      <Section title="Slevy">
        <Checkbox
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
        >
          Jsem pojištěnec VZP (sleva 20 %)
        </Checkbox>
        <Checkbox
          id="healthClub"
          checked={state.memberDiscounts.healthClub}
          disabled={!state.memberDiscounts.healthInsurer}
          onChange={(healthClub) =>
            update({ memberDiscounts: { ...state.memberDiscounts, healthClub } })
          }
          error={errors.memberDiscounts}
        >
          Jsem člen Klubu pevného zdraví (dalších 10 %)
        </Checkbox>
      </Section>
    </div>
  )
}
