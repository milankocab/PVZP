import { Sparkles, UserRound, Users } from 'lucide-react'
import { TRAVELER_TYPES } from '../../pricing'
import { Checkbox, Section, TextField } from '../components/ui'
import {
  holderTravels,
  sampleDetails,
  travelerSlots,
  type PersonDetails,
  type StepProps,
} from '../stepProps'

function PersonFields({
  prefix,
  person,
  onChange,
  errors,
}: {
  prefix: string
  person: PersonDetails
  onChange: (patch: Partial<PersonDetails>) => void
  errors: StepProps['errors']
}) {
  return (
    <div className="ph-no-capture grid min-w-0 gap-4 sm:grid-cols-2">
      <TextField
        id={`${prefix}-firstName`}
        label="Jméno"
        autoComplete="off"
        value={person.firstName}
        onChange={(firstName) => onChange({ firstName })}
        error={errors[`${prefix}-firstName`]}
      />
      <TextField
        id={`${prefix}-lastName`}
        label="Příjmení"
        autoComplete="off"
        value={person.lastName}
        onChange={(lastName) => onChange({ lastName })}
        error={errors[`${prefix}-lastName`]}
      />
      <TextField
        id={`${prefix}-birthDate`}
        type="date"
        label="Datum narození"
        autoComplete="off"
        value={person.birthDate}
        onChange={(birthDate) => onChange({ birthDate })}
        error={errors[`${prefix}-birthDate`]}
      />
    </div>
  )
}

export function StepDetails({ state, update, errors }: StepProps) {
  const slots = travelerSlots(state.travelers)
  const canHolderTravel = slots[0] !== 'child'
  const holderIsTraveler = holderTravels(state)

  const updateTraveler = (index: number, patch: Partial<PersonDetails>) =>
    update({
      travelerDetails: state.travelerDetails.map((person, i) =>
        i === index ? { ...person, ...patch } : person,
      ),
    })

  return (
    <div className="space-y-4">
      <div className="animate-rise rounded-3xl bg-gradient-to-br from-brand-50 to-sky-50 p-4 text-sm text-slate-800 ring-1 ring-brand-100">
        <p>
          Prototyp. Údaje se nikam neodesílají a nejdou do analytiky. Pro rychlé vyzkoušení použijte
          smyšlená data.
        </p>
        <button
          type="button"
          onClick={() => update(sampleDetails(state))}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-4 font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 transition hover:bg-brand-50 active:scale-95"
        >
          <Sparkles aria-hidden="true" className="size-4" />
          Vyplnit ukázková data
        </button>
      </div>

      <Section title="Pojistník" icon={UserRound} tone="brand">
        <PersonFields
          prefix="policyholder"
          person={state.policyholder}
          onChange={(patch) => update({ policyholder: { ...state.policyholder, ...patch } })}
          errors={errors}
        />
        <div className="ph-no-capture grid min-w-0 gap-4 sm:grid-cols-2">
          <TextField
            id="policyholder-email"
            type="email"
            label="E-mail"
            hint="Pošleme na něj smlouvu."
            autoComplete="off"
            value={state.policyholder.email}
            onChange={(email) => update({ policyholder: { ...state.policyholder, email } })}
            error={errors['policyholder-email']}
          />
          <TextField
            id="policyholder-phone"
            type="tel"
            label="Telefon"
            hint="Pro asistenci v nouzi."
            autoComplete="off"
            value={state.policyholder.phone}
            onChange={(phone) => update({ policyholder: { ...state.policyholder, phone } })}
            error={errors['policyholder-phone']}
          />
        </div>
        {canHolderTravel && (
          <Checkbox
            id="policyholderTravels"
            checked={state.policyholderTravels}
            onChange={(policyholderTravels) => update({ policyholderTravels })}
          >
            Pojistník také cestuje
          </Checkbox>
        )}
      </Section>

      {slots.map((type, index) => {
        if (index === 0 && holderIsTraveler) return null
        return (
          <Section
            key={index}
            icon={Users}
            tone="amber"
            title={`Cestující ${index + 1} · ${TRAVELER_TYPES[type].label.toLowerCase()} (${
              TRAVELER_TYPES[type].ageHint
            })`}
          >
            <PersonFields
              prefix={`traveler-${index}`}
              person={state.travelerDetails[index]}
              onChange={(patch) => updateTraveler(index, patch)}
              errors={errors}
            />
          </Section>
        )
      })}
    </div>
  )
}
