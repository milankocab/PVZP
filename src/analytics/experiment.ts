import type { TripPurpose } from '../purchase/state'

export type Variant = 'a' | 'b'
export type Segment = 'manager' | 'other'
export type SegmentSource = 'utm' | 'question' | 'override' | 'none'

const VARIANT_KEY = 'odjezd-ab-variant'

function isVariant(value: string | null): value is Variant {
  return value === 'a' || value === 'b'
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Bez úložiště (anonymní okno, zablokované cookies) se varianta přidělí při každé návštěvě znovu.
  }
}

/**
 * Varianta A/B testu. Při první návštěvě se přidělí náhodně 50/50 a uloží se.
 * Parametr ?v=a nebo ?v=b ji vynutí pro ukázku, ale uložené přidělení nepřepíše.
 */
export function resolveVariant(
  override: string | null,
  random: () => number = Math.random,
): Variant {
  if (isVariant(override)) return override
  const stored = readStorage(VARIANT_KEY)
  if (isVariant(stored)) return stored
  const assigned: Variant = random() < 0.5 ? 'a' : 'b'
  writeStorage(VARIANT_KEY, assigned)
  return assigned
}

/**
 * UTM parametry z kampaní jsou v reálném odkazu před # (…/?utm_audience=manazer#/sjednani).
 * Kvůli HashRouteru je hledáme i v části za #.
 */
export function readUtmAudience(location: Pick<Location, 'search' | 'hash'> = window.location) {
  const fromSearch = new URLSearchParams(location.search).get('utm_audience')
  const hashQuery = location.hash.split('?')[1] ?? ''
  return fromSearch ?? new URLSearchParams(hashQuery).get('utm_audience')
}

/**
 * Segment manažerů. Návštěva z kampaně na manažery, nebo odpověď „Jedete pracovně?“ ano.
 * Parametr ?segment=manazer segment vynutí pro ukázku.
 */
export function resolveSegment(
  override: string | null,
  utmAudience: string | null,
  tripPurpose: TripPurpose | null,
): { segment: Segment; source: SegmentSource } {
  if (override === 'manazer') return { segment: 'manager', source: 'override' }
  if (utmAudience === 'manazer') return { segment: 'manager', source: 'utm' }
  if (tripPurpose === 'business') return { segment: 'manager', source: 'question' }
  return { segment: 'other', source: 'none' }
}
