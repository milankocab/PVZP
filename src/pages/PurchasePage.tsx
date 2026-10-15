import { useSearchParams } from 'react-router-dom'
import { PurchaseFlow } from '../purchase/PurchaseFlow'

export function PurchasePage() {
  const [params] = useSearchParams()
  // Přidělení varianty A/B testu doplní fáze 3. Zatím se chová jako varianta A (bez předvolby),
  // parametr ?v=b předvybere Komfort.
  const preselectedPlan = params.get('v') === 'b' ? 'comfort' : null
  const upsellEnabled = params.get('upsell') === '1'

  return (
    <PurchaseFlow
      key={`${preselectedPlan}-${upsellEnabled}`}
      preselectedPlan={preselectedPlan}
      upsellEnabled={upsellEnabled}
    />
  )
}
