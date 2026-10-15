import { funnelStats } from './funnel'
import type { StoredEvent, TrackParams } from './track'

let ts = 0
function event(run: string, name: StoredEvent['name'], params: TrackParams = {}): StoredEvent {
  ts += 1
  return { run, name, params, ts }
}

function journey(run: string, variant: 'a' | 'b', lastStep: number, price?: number) {
  const events = [event(run, 'funnel_start', { variant, segment: 'other' })]
  for (let step = 1; step <= lastStep; step++) {
    events.push(event(run, 'step_view', { variant, step_number: step }))
  }
  if (price !== undefined) events.push(event(run, 'purchase_simulated', { variant, price }))
  return events
}

describe('funnelStats', () => {
  const events = [
    ...journey('r1', 'a', 6, 400),
    ...journey('r2', 'a', 3),
    ...journey('r3', 'a', 1),
    ...journey('r4', 'b', 6, 600),
    ...journey('r5', 'b', 6, 800),
  ]

  it('počítá odpad po krocích, konverzi a AOV pro variantu A', () => {
    const stats = funnelStats(events, 'a', 6)
    expect(stats.starts).toBe(3)
    expect(stats.stepViews).toEqual([3, 2, 2, 1, 1, 1])
    expect(stats.purchases).toBe(1)
    expect(stats.conversion).toBeCloseTo(1 / 3)
    expect(stats.aov).toBe(400)
    expect(stats.revenuePerStart).toBeCloseTo(400 / 3)
  })

  it('počítá variantu B zvlášť', () => {
    const stats = funnelStats(events, 'b', 6)
    expect(stats.starts).toBe(2)
    expect(stats.aov).toBe(700)
    expect(stats.conversion).toBe(1)
  })

  it('opakované zobrazení kroku se počítá jednou', () => {
    const repeated = [...journey('r6', 'a', 2), event('r6', 'step_view', { step_number: 2 })]
    expect(funnelStats(repeated, 'a', 6).stepViews.slice(0, 2)).toEqual([1, 1])
  })

  it('filtruje podle segmentu, platí poslední známý segment průchodu', () => {
    const withSegment = [
      ...journey('r7', 'a', 2),
      event('r7', 'step_view', { variant: 'a', segment: 'manager', step_number: 2 }),
    ]
    expect(funnelStats(withSegment, 'a', 6, 'manager').starts).toBe(1)
    expect(funnelStats(withSegment, 'a', 6, 'other').starts).toBe(0)
  })

  it('bez dat vrací prázdné metriky', () => {
    const stats = funnelStats([], 'a', 6)
    expect(stats.starts).toBe(0)
    expect(stats.conversion).toBeNull()
    expect(stats.aov).toBeNull()
  })
})
