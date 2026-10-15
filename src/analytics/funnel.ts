import type { Segment, Variant } from './experiment'
import type { StoredEvent } from './track'

export interface FunnelStats {
  starts: number
  /** Počet průchodů, které viděly daný krok. Index 0 je krok 1. */
  stepViews: number[]
  purchases: number
  revenue: number
  /** Podíl dokončených z těch, kdo začali. */
  conversion: number | null
  /** Průměrná hodnota objednávky. */
  aov: number | null
  revenuePerStart: number | null
}

interface Run {
  variant: Variant | null
  segment: Segment
  steps: Set<number>
  started: boolean
  revenue: number | null
}

function groupRuns(events: StoredEvent[]): Run[] {
  const runs = new Map<string, Run>()
  for (const event of events) {
    const run = runs.get(event.run) ?? {
      variant: null,
      segment: 'other',
      steps: new Set<number>(),
      started: false,
      revenue: null,
    }
    if (event.params.variant) run.variant = event.params.variant
    // Segment se může během průchodu změnit (odpověď „Jedete pracovně?“), platí poslední.
    if (event.params.segment) run.segment = event.params.segment
    if (event.name === 'funnel_start') run.started = true
    if (event.name === 'step_view' && event.params.step_number) {
      run.steps.add(event.params.step_number)
    }
    if (event.name === 'purchase_simulated') run.revenue = event.params.price ?? 0
    runs.set(event.run, run)
  }
  return [...runs.values()]
}

export function funnelStats(
  events: StoredEvent[],
  variant: Variant,
  stepCount: number,
  segment?: Segment,
): FunnelStats {
  const runs = groupRuns(events).filter(
    (run) => run.started && run.variant === variant && (!segment || run.segment === segment),
  )
  const purchased = runs.filter((run) => run.revenue !== null)
  const revenue = purchased.reduce((sum, run) => sum + (run.revenue ?? 0), 0)
  const starts = runs.length
  return {
    starts,
    stepViews: Array.from(
      { length: stepCount },
      (_, index) => runs.filter((run) => run.steps.has(index + 1)).length,
    ),
    purchases: purchased.length,
    revenue,
    conversion: starts > 0 ? purchased.length / starts : null,
    aov: purchased.length > 0 ? revenue / purchased.length : null,
    revenuePerStart: starts > 0 ? revenue / starts : null,
  }
}
