import {
  Bandage,
  Building2,
  Clock,
  FileText,
  Headset,
  Laptop,
  Luggage,
  Plane,
  Scale,
  Sparkles,
  Stethoscope,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { COVERAGE_ROWS, PLAN_ORDER, type CoverageRowId, type PlanId } from '../pricing'
import type { Tone } from './components/ui'

/** Ikona a barva pro každý řádek krytí. Stejná ikona znamená stejnou věc ve všech krocích. */
export const COVERAGE_ICONS: Record<CoverageRowId, { icon: LucideIcon; tone: Tone }> = {
  luggage: { icon: Luggage, tone: 'accent' },
  luggageIncluded: { icon: Users, tone: 'accent' },
  electronicsItem: { icon: Laptop, tone: 'violet' },
  electronicsSettlement: { icon: Sparkles, tone: 'amber' },
  companyElectronics: { icon: Building2, tone: 'slate' },
  medical: { icon: Stethoscope, tone: 'rose' },
  medicalAssistance: { icon: Headset, tone: 'sky' },
  extendedAssistance: { icon: FileText, tone: 'sky' },
  repatriation: { icon: Plane, tone: 'sky' },
  liability: { icon: Scale, tone: 'lime' },
  injury: { icon: Bandage, tone: 'rose' },
  cancellation: { icon: Ticket, tone: 'violet' },
  flightDelay: { icon: Clock, tone: 'amber' },
}

// Pořadí, ve kterém nabídka vyššího balíčku ukazuje rozdíly. Nahoře je to, co nejvíc zajímá
// manažery s drahou elektronikou, tedy hlavní cílový segment.
const UPGRADE_PRIORITY: CoverageRowId[] = [
  'luggage',
  'electronicsSettlement',
  'companyElectronics',
  'cancellation',
  'electronicsItem',
  'luggageIncluded',
  'medical',
  'extendedAssistance',
  'flightDelay',
  'liability',
  'injury',
]

export interface CoverageDiff {
  id: CoverageRowId
  label: string
  from: string | boolean
  to: string | boolean
}

/** Co vyšší balíček přidá oproti nižšímu. Seřazené podle důležitosti pro klienta. */
export function upgradeDiffs(from: PlanId, to: PlanId): CoverageDiff[] {
  return UPGRADE_PRIORITY.flatMap((id) => {
    const row = COVERAGE_ROWS.find((item) => item.id === id)
    if (!row || row.values[from] === row.values[to] || row.values[to] === false) return []
    return [{ id, label: row.label, from: row.values[from], to: row.values[to] }]
  })
}

/** Řádek je v balíčku lepší než v nejbližším nižším balíčku. */
export function isUpgradeOverLower(id: CoverageRowId, plan: PlanId): boolean {
  const index = PLAN_ORDER.indexOf(plan)
  if (index === 0) return false
  const row = COVERAGE_ROWS.find((item) => item.id === id)
  if (!row) return false
  const lower = row.values[PLAN_ORDER[index - 1]]
  return row.values[plan] !== false && row.values[plan] !== lower
}
