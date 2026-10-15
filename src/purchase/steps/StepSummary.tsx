import { PLANS, REGIONS, TRAVELER_TYPES, formatCzk, type PlanId } from '../../pricing'
import { Checkbox, Section } from '../components/ui'
import { formatDate, holderTravels, travelerSlots, type StepProps } from '../stepProps'

export interface UpsellOffer {
  plan: PlanId
  difference: number
}

interface StepSummaryProps extends StepProps {
  upsell: UpsellOffer | null
  onAcceptUpsell: () => void
}

export function StepSummary({ state, update, errors, upsell, onAcceptUpsell }: StepSummaryProps) {
  if (!state.region || !state.plan) return null
  const slots = travelerSlots(state.travelers)
  const people = slots.map((type, index) => {
    const person =
      index === 0 && holderTravels(state) ? state.policyholder : state.travelerDetails[index]
    return { type, name: `${person.firstName} ${person.lastName}`, birthDate: person.birthDate }
  })

  return (
    <div className="space-y-4">
      {upsell && (
        <section
          aria-labelledby="upsell-title"
          className="rounded-xl border-2 border-accent-500 bg-orange-50 p-4"
        >
          <h2 id="upsell-title" className="text-lg font-bold text-slate-900">
            Za {formatCzk(upsell.difference)} navíc máte {PLANS[upsell.plan].label}
          </h2>
          <p className="mt-1 text-slate-800">{PLANS[upsell.plan].shortDescription}.</p>
          <button
            type="button"
            onClick={onAcceptUpsell}
            className="mt-3 min-h-12 rounded-lg bg-brand-700 px-4 font-semibold text-white hover:bg-brand-800"
          >
            Změnit na {PLANS[upsell.plan].label}
          </button>
        </section>
      )}

      <Section title="Cesta">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-slate-800">
          <dt className="font-medium">Oblast</dt>
          <dd>{REGIONS[state.region].label}</dd>
          <dt className="font-medium">Termín</dt>
          <dd>
            {formatDate(state.departure)} až {formatDate(state.return)}
          </dd>
          <dt className="font-medium">Balíček</dt>
          <dd>{PLANS[state.plan].label}</dd>
        </dl>
      </Section>

      <Section title="Pojištění">
        {/* ph-no-capture: měření kliků z tohoto seznamu nic nebere, jsou v něm osobní údaje. */}
        <ul className="ph-no-capture space-y-1 text-slate-800">
          <li>Pojistník {`${state.policyholder.firstName} ${state.policyholder.lastName}`}</li>
          {people.map((person, index) => (
            <li key={index}>
              {person.name}, {TRAVELER_TYPES[person.type].label.toLowerCase()}, nar.{' '}
              {formatDate(person.birthDate)}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Souhlasy">
        {/* Znění souhlasů a povinné dokumenty je nutné potvrdit s legal týmem. */}
        <Checkbox
          id="terms"
          checked={state.consents.terms}
          onChange={(terms) => update({ consents: { ...state.consents, terms } })}
          error={errors.terms}
        >
          Seznámil(a) jsem se s pojistnými podmínkami a informačním dokumentem o pojistném produktu.
          V prototypu dokumenty nejsou.
        </Checkbox>
        <Checkbox
          id="privacy"
          checked={state.consents.privacy}
          onChange={(privacy) => update({ consents: { ...state.consents, privacy } })}
          error={errors.privacy}
        >
          Beru na vědomí, jak Odjezd zpracovává osobní údaje kvůli sjednání pojištění.
        </Checkbox>
        <Checkbox
          id="marketing"
          checked={state.consents.marketing}
          onChange={(marketing) => update({ consents: { ...state.consents, marketing } })}
        >
          Chci dostávat nabídky a tipy na cesty (nepovinné).
        </Checkbox>
      </Section>
    </div>
  )
}
