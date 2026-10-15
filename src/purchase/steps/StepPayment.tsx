import { ChoiceCards, Section } from '../components/ui'
import { type PaymentMethod, type StepProps } from '../stepProps'

// Apple Pay a Google Pay jsou na mobilu nejrychlejší. Odpadá ruční přepisování karty.
// V prototypu je všechno jen simulace, žádné platební údaje se nesbírají.
export function StepPayment({ state, update, errors }: StepProps) {
  return (
    <div className="space-y-4">
      <Section title="Způsob platby">
        <ChoiceCards<PaymentMethod>
          name="paymentMethod"
          legend="Jak chcete zaplatit?"
          hint="Platba je jen simulace. Nic se neodesílá a nic se nezaplatí."
          value={state.paymentMethod}
          onChange={(paymentMethod) => update({ paymentMethod })}
          error={errors.paymentMethod}
          options={[
            { value: 'applePay', label: 'Apple Pay', description: 'Simulace' },
            { value: 'googlePay', label: 'Google Pay', description: 'Simulace' },
            {
              value: 'card',
              label: 'Platební karta',
              description: 'Simulace, číslo karty se nezadává',
            },
          ]}
        />
      </Section>
    </div>
  )
}
