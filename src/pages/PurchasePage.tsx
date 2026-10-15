import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readUtmAudience, resolveVariant } from '../analytics/experiment'
import { PurchaseFlow } from '../purchase/PurchaseFlow'

export function PurchasePage() {
  const [params] = useSearchParams()
  const override = params.get('v')
  // Přidělení se vyhodnotí jednou za zobrazení stránky. Parametr ?v ho přepíše pro ukázku.
  const [assigned] = useState(() => resolveVariant(null))
  const variant = override === 'a' || override === 'b' ? override : assigned
  const upsellEnabled = params.get('upsell') === '1'

  return (
    <PurchaseFlow
      key={`${variant}-${upsellEnabled}`}
      variant={variant}
      upsellEnabled={upsellEnabled}
      segmentOverride={params.get('segment')}
      utmAudience={readUtmAudience()}
    />
  )
}
