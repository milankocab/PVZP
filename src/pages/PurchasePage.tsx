import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { readUtmAudience, resolveVariant, type Variant } from '../analytics/experiment'
import { DebugBar } from '../components/DebugBar'
import { PurchaseFlow } from '../purchase/PurchaseFlow'

export function PurchasePage() {
  const [params, setParams] = useSearchParams()
  const override = params.get('v')
  // Přidělení se vyhodnotí jednou za zobrazení stránky. Parametr ?v ho přepíše pro ukázku.
  const [assigned] = useState(() => resolveVariant(null))
  const variant = override === 'a' || override === 'b' ? override : assigned
  // Nabídka vyššího balíčku je zapnutá ve výchozím stavu. Parametr ?upsell=0 ji vypne.
  const upsellEnabled = params.get('upsell') !== '0'
  const segmentOverride = params.get('segment')
  const segmentForced = segmentOverride === 'manazer'

  const setParam = (name: string, value: string | null) => {
    const updated = new URLSearchParams(params)
    if (value === null) updated.delete(name)
    else updated.set(name, value)
    setParams(updated)
  }

  return (
    <>
      <DebugBar
        variant={variant}
        segmentForced={segmentForced}
        onSwitchVariant={(next: Variant) => setParam('v', next)}
        onToggleSegment={(forced) => setParam('segment', forced ? 'manazer' : null)}
      />
      <PurchaseFlow
        key={`${variant}-${upsellEnabled}-${segmentForced}`}
        variant={variant}
        upsellEnabled={upsellEnabled}
        segmentOverride={segmentOverride}
        utmAudience={readUtmAudience()}
      />
    </>
  )
}
