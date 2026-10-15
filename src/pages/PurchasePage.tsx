import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readUtmAudience, resolveVariant, type Variant } from '../analytics/experiment'
import { VariantSwitcher } from '../components/VariantSwitcher'
import { PurchaseFlow } from '../purchase/PurchaseFlow'

export function PurchasePage() {
  const [params, setParams] = useSearchParams()
  const override = params.get('v')
  // Přidělení se vyhodnotí jednou za zobrazení stránky. Parametr ?v ho přepíše pro ukázku.
  const [assigned] = useState(() => resolveVariant(null))
  const variant = override === 'a' || override === 'b' ? override : assigned
  const upsellEnabled = params.get('upsell') === '1'

  const switchVariant = (next: Variant) => {
    const updated = new URLSearchParams(params)
    updated.set('v', next)
    setParams(updated)
  }

  return (
    <>
      <VariantSwitcher variant={variant} onSwitch={switchVariant} />
      <PurchaseFlow
        key={`${variant}-${upsellEnabled}`}
        variant={variant}
        upsellEnabled={upsellEnabled}
        segmentOverride={params.get('segment')}
        utmAudience={readUtmAudience()}
      />
    </>
  )
}
