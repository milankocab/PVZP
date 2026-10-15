import { resolveSegment, resolveVariant, readUtmAudience } from './experiment'
import { clearStoredEvents, getStoredEvents, sanitize, track } from './track'

describe('sanitize', () => {
  it('pustí jen povolené parametry a zahodí osobní údaje', () => {
    const clean = sanitize({
      variant: 'a',
      price: 399,
      plan: 'comfort',
      firstName: 'Jana',
      email: 'jana@example.com',
      birthDate: '1986-04-12',
      phone: '+420 777 000 000',
    })
    expect(clean).toEqual({ variant: 'a', price: 399, plan: 'comfort' })
  })

  it('zahodí objekty a pole i u povolených klíčů', () => {
    expect(sanitize({ field: { value: 'Jana' }, plan: ['x'] })).toEqual({})
  })
})

describe('track', () => {
  beforeEach(() => clearStoredEvents())

  it('ukládá eventy lokálně a nový průchod začíná funnel_start', () => {
    track('funnel_start', { variant: 'b' })
    track('step_view', { variant: 'b', step_number: 1, email: 'x@y.cz' })
    track('funnel_start', { variant: 'b' })
    const events = getStoredEvents()
    expect(events.map((event) => event.name)).toEqual(['funnel_start', 'step_view', 'funnel_start'])
    expect(events[1].params).toEqual({ variant: 'b', step_number: 1 })
    expect(events[0].run).toBe(events[1].run)
    expect(events[2].run).not.toBe(events[0].run)
  })
})

describe('resolveVariant', () => {
  beforeEach(() => window.localStorage.clear())

  it('přidělí variantu náhodně a příště použije uloženou', () => {
    expect(resolveVariant(null, () => 0.7)).toBe('b')
    expect(resolveVariant(null, () => 0.1)).toBe('b')
  })

  it('parametr ?v vynutí variantu a uložené přidělení nepřepíše', () => {
    expect(resolveVariant(null, () => 0.1)).toBe('a')
    expect(resolveVariant('b')).toBe('b')
    expect(resolveVariant(null, () => 0.9)).toBe('a')
  })

  it('neznámá hodnota parametru se ignoruje', () => {
    expect(resolveVariant('c', () => 0.2)).toBe('a')
  })
})

describe('resolveSegment', () => {
  it('manažer z kampaně, z odpovědi, nebo vynucený', () => {
    expect(resolveSegment(null, 'manazer', null)).toEqual({ segment: 'manager', source: 'utm' })
    expect(resolveSegment(null, null, 'business')).toEqual({
      segment: 'manager',
      source: 'question',
    })
    expect(resolveSegment('manazer', null, 'leisure')).toEqual({
      segment: 'manager',
      source: 'override',
    })
    expect(resolveSegment(null, null, 'leisure')).toEqual({ segment: 'other', source: 'none' })
  })

  it('čte UTM z odkazu před # i za #', () => {
    expect(readUtmAudience({ search: '?utm_audience=manazer', hash: '#/sjednani' })).toBe('manazer')
    expect(readUtmAudience({ search: '', hash: '#/sjednani?utm_audience=manazer' })).toBe('manazer')
    expect(readUtmAudience({ search: '', hash: '#/sjednani' })).toBeNull()
  })
})
