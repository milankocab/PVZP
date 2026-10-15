import { CalendarDays, FileCheck2, MapPin, Package, UserRound, Users } from 'lucide-react'
import { PLANS, REGIONS, TRAVELER_TYPES } from '../../pricing'
import { Checkbox, IconBadge, Section } from '../components/ui'
import { formatDate, holderTravels, travelerSlots, type StepProps } from '../stepProps'

export function StepSummary({ state, update, errors }: StepProps) {
  if (!state.region || !state.plan) return null
  const slots = travelerSlots(state.travelers)
  const people = slots.map((type, index) => {
    const person =
      index === 0 && holderTravels(state) ? state.policyholder : state.travelerDetails[index]
    return { type, name: `${person.firstName} ${person.lastName}`, birthDate: person.birthDate }
  })

  const facts = [
    { icon: MapPin, tone: 'sky' as const, label: 'Oblast', value: REGIONS[state.region].label },
    {
      icon: CalendarDays,
      tone: 'violet' as const,
      label: 'Termín',
      value: `${formatDate(state.departure)} až ${formatDate(state.return)}`,
    },
    { icon: Package, tone: 'brand' as const, label: 'Balíček', value: PLANS[state.plan].label },
  ]

  return (
    <div className="space-y-4">
      <Section title="Cesta" icon={MapPin} tone="sky">
        <dl className="grid gap-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex items-center gap-3 rounded-2xl bg-canvas p-2.5">
              <IconBadge icon={fact.icon} tone={fact.tone} size="sm" />
              <dt className="text-sm text-slate-600">{fact.label}</dt>
              <dd className="ml-auto text-right font-bold text-ink">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Pojištění" icon={Users} tone="amber">
        {/* ph-no-capture: měření kliků z tohoto seznamu nic nebere, jsou v něm osobní údaje. */}
        <ul className="ph-no-capture space-y-2 text-slate-800">
          <li className="flex items-center gap-3">
            <IconBadge icon={UserRound} tone="brand" size="sm" />
            <span>
              <span className="block font-bold text-ink">
                {`${state.policyholder.firstName} ${state.policyholder.lastName}`}
              </span>
              <span className="text-sm text-slate-600">Pojistník</span>
            </span>
          </li>
          {people.map((person, index) => (
            <li key={index} className="flex items-center gap-3">
              <IconBadge icon={UserRound} tone="slate" size="sm" />
              <span>
                <span className="block font-bold text-ink">{person.name}</span>
                <span className="text-sm text-slate-600">
                  {TRAVELER_TYPES[person.type].label}, nar. {formatDate(person.birthDate)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Souhlasy" icon={FileCheck2} tone="lime">
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
          Chci dostávat nabídky a tipy na cesty.
        </Checkbox>
      </Section>
    </div>
  )
}
