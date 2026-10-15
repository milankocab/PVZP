import {
  ADDON_ORDER,
  ADDONS,
  CANCELLATION,
  FAMILY_DISCOUNT,
  MAX_TRAVELERS,
  MAX_TRIP_DAYS,
  PLANS,
  REGIONS,
  TRAVELER_TYPES,
  type AddonId,
  type AddonPricing,
  type PlanId,
  type RegionId,
  type TravelerType,
} from './config'

export type TravelerCounts = Record<TravelerType, number>

export interface PriceInput {
  region: RegionId
  /** Datum odjezdu ve formátu YYYY-MM-DD. */
  departure: string
  /** Datum návratu ve formátu YYYY-MM-DD. */
  return: string
  travelers: TravelerCounts
  plan: PlanId
  addons: AddonId[]
  /** Počet pojištěných zavazadel. Výchozí je počet cestujících. Může být nižší, když lidé sdílí kufr. */
  luggagePieces?: number
  /** Údaje o zájezdu. Povinné jen pro připojištění storna. */
  trip?: TripInfo
  /** Dnešní datum (YYYY-MM-DD). Kvůli testům jde předat zvenku. */
  today?: string
}

export interface TripInfo {
  /** Celková cena zájezdu za všechny cestující v Kč. */
  price: number
  /** Datum zakoupení zájezdu ve formátu YYYY-MM-DD. */
  bookedOn: string
}

export type PriceLineKind = 'base' | 'discount' | 'addon' | 'included'

export interface PriceLine {
  id: string
  kind: PriceLineKind
  label: string
  detail: string
  amount: number
}

export interface PriceBreakdown {
  days: number
  travelerCount: number
  lines: PriceLine[]
  basePremium: number
  discount: number
  addonsTotal: number
  total: number
}

export type ValidationField =
  | 'region'
  | 'departure'
  | 'return'
  | 'travelers'
  | 'plan'
  | 'addons'
  | 'luggagePieces'
  | 'tripPrice'
  | 'tripBookedOn'

export interface ValidationIssue {
  field: ValidationField
  message: string
}

export class InvalidPriceInputError extends Error {
  readonly issues: ValidationIssue[]

  constructor(issues: ValidationIssue[]) {
    super(issues.map((issue) => issue.message).join(' '))
    this.name = 'InvalidPriceInputError'
    this.issues = issues
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

/** Převede YYYY-MM-DD na počet dní od epochy v UTC. Neplatné datum vrátí null. */
function toDayNumber(value: string): number | null {
  if (!DATE_PATTERN.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const time = Date.UTC(year, month - 1, day)
  const date = new Date(time)
  // Odhalí neexistující data jako 2026-02-30.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null
  return time / DAY_MS
}

export function todayIso(now: Date = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Počet dní pojištění. Počítá se včetně dne odjezdu i návratu,
 * takže odjezd a návrat ve stejný den je 1 den.
 */
export function tripDays(departure: string, returnDate: string): number | null {
  const start = toDayNumber(departure)
  const end = toDayNumber(returnDate)
  if (start === null || end === null || end < start) return null
  return end - start + 1
}

export function countTravelers(travelers: TravelerCounts): number {
  return travelers.adult + travelers.child + travelers.senior
}

export function isFamilyDiscountEligible(travelers: TravelerCounts): boolean {
  return (
    travelers.adult + travelers.senior === FAMILY_DISCOUNT.requiredAdults &&
    travelers.child >= FAMILY_DISCOUNT.minChildren
  )
}

/** Připojištění je v ceně zvolené varianty, takže se neúčtuje zvlášť. */
export function isAddonIncluded(plan: PlanId, addon: AddonId): boolean {
  return PLANS[plan]?.includedAddons.includes(addon) ?? false
}

/** Klient chce storno jako placené připojištění (ne jako součást varianty). */
function needsPaidCancellation(input: PriceInput): boolean {
  return input.addons.includes('cancellation') && !isAddonIncluded(input.plan, 'cancellation')
}

export function effectiveLuggagePieces(input: PriceInput): number {
  return input.luggagePieces ?? countTravelers(input.travelers)
}

/** Pojistí se méně zavazadel než je cestujících. UI má klienta upozornit a chtít potvrzení. */
export function isLuggageShared(input: PriceInput): boolean {
  return (
    input.addons.includes('luggage') &&
    effectiveLuggagePieces(input) < countTravelers(input.travelers)
  )
}

/**
 * Jestli jde storno ještě sjednat. Lhůta se počítá v kalendářních dnech
 * od zakoupení zájezdu včetně. Zájezd koupený 1. 11. jde pojistit do 8. 11.
 */
export function isWithinCancellationWindow(bookedOn: string, today: string = todayIso()): boolean {
  const booked = toDayNumber(bookedOn)
  const now = toDayNumber(today)
  if (booked === null || now === null || booked > now) return false
  return now - booked <= CANCELLATION.purchaseWindowDays
}

export function validatePriceInput(input: PriceInput): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  if (!(input.region in REGIONS)) {
    issues.push({ field: 'region', message: 'Vyberte oblast.' })
  }

  const start = toDayNumber(input.departure)
  const end = toDayNumber(input.return)
  const today = toDayNumber(input.today ?? todayIso())

  if (start === null) {
    issues.push({ field: 'departure', message: 'Zadejte platné datum odjezdu.' })
  } else if (today !== null && start < today) {
    issues.push({ field: 'departure', message: 'Datum odjezdu nemůže být v minulosti.' })
  }

  if (end === null) {
    issues.push({ field: 'return', message: 'Zadejte platné datum návratu.' })
  } else if (start !== null) {
    if (end < start) {
      issues.push({ field: 'return', message: 'Návrat musí být stejný den nebo po odjezdu.' })
    } else if (end - start + 1 > MAX_TRIP_DAYS) {
      issues.push({
        field: 'return',
        message: `Online jde pojistit cestu nejvýše na ${MAX_TRIP_DAYS} dní.`,
      })
    }
  }

  const counts = Object.values(input.travelers)
  const total = countTravelers(input.travelers)
  if (counts.some((count) => !Number.isInteger(count) || count < 0)) {
    issues.push({ field: 'travelers', message: 'Počet cestujících musí být celé číslo od 0.' })
  } else if (total < 1) {
    issues.push({ field: 'travelers', message: 'Přidejte alespoň jednoho cestujícího.' })
  } else if (total > MAX_TRAVELERS) {
    issues.push({
      field: 'travelers',
      message: `Online jde pojistit nejvýše ${MAX_TRAVELERS} cestujících.`,
    })
  }

  if (!(input.plan in PLANS)) {
    issues.push({ field: 'plan', message: 'Vyberte variantu pojištění.' })
  }

  if (input.addons.some((addon) => !(addon in ADDONS))) {
    issues.push({ field: 'addons', message: 'Neznámé připojištění.' })
  }

  if (input.addons.includes('luggage') && total >= 1) {
    const pieces = effectiveLuggagePieces(input)
    if (!Number.isInteger(pieces) || pieces < 1 || pieces > total) {
      issues.push({
        field: 'luggagePieces',
        message: `Počet zavazadel musí být od 1 do ${total}.`,
      })
    }
  }

  if (needsPaidCancellation(input)) {
    const price = input.trip?.price
    const bookedOn = input.trip?.bookedOn ?? ''
    const booked = toDayNumber(bookedOn)
    if (price === undefined || !Number.isFinite(price) || price <= 0) {
      issues.push({ field: 'tripPrice', message: 'Zadejte cenu zájezdu.' })
    } else if (total >= 1 && price > CANCELLATION.maxTripPricePerPerson * total) {
      issues.push({
        field: 'tripPrice',
        message: `Storno jde online sjednat pro zájezd do ${CANCELLATION.maxTripPricePerPerson.toLocaleString('cs-CZ')} Kč na osobu.`,
      })
    }
    if (booked === null) {
      issues.push({ field: 'tripBookedOn', message: 'Zadejte datum zakoupení zájezdu.' })
    } else if (today !== null && booked > today) {
      issues.push({
        field: 'tripBookedOn',
        message: 'Datum zakoupení nemůže být v budoucnosti.',
      })
    } else if (!isWithinCancellationWindow(bookedOn, input.today ?? todayIso())) {
      issues.push({
        field: 'tripBookedOn',
        message: `Storno jde sjednat do ${CANCELLATION.purchaseWindowDays} dní od zakoupení zájezdu. Tato lhůta už uplynula.`,
      })
    }
  }

  return issues
}

function formatDays(days: number): string {
  if (days === 1) return '1 den'
  if (days >= 2 && days <= 4) return `${days} dny`
  return `${days} dní`
}

function addonPrice(
  pricing: AddonPricing,
  input: PriceInput,
  days: number,
  travelerCount: number,
): { amount: number; detail: string } {
  switch (pricing.type) {
    case 'perPersonPerDay':
      return {
        amount: pricing.amount * travelerCount * days,
        detail: `${pricing.amount} Kč × ${travelerCount} os. × ${formatDays(days)}`,
      }
    case 'perPiece': {
      const pieces = effectiveLuggagePieces(input)
      return {
        amount: pricing.amount * pieces,
        detail: `${pricing.amount} Kč × ${pieces} ${pieces === 1 ? 'zavazadlo' : pieces <= 4 ? 'zavazadla' : 'zavazadel'}`,
      }
    }
    case 'tripPricePercent': {
      const tripPrice = input.trip!.price
      const amount = Math.max(pricing.minPremium, Math.round(tripPrice * pricing.rate))
      return {
        amount,
        detail: `${(pricing.rate * 100).toLocaleString('cs-CZ')} % z ceny zájezdu ${formatCzk(tripPrice)}, nejméně ${formatCzk(pricing.minPremium)}`,
      }
    }
  }
}

/**
 * Spočítá cenu pojištění a rozpad po položkách.
 * Každá položka se zaokrouhlí na celé koruny a celková cena je jejich součet,
 * aby rozpad vždy seděl s výslednou cenou.
 * Při neplatném vstupu vyhodí InvalidPriceInputError.
 */
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const issues = validatePriceInput(input)
  if (issues.length > 0) throw new InvalidPriceInputError(issues)

  const days = tripDays(input.departure, input.return)!
  const travelerCount = countTravelers(input.travelers)
  const region = REGIONS[input.region]
  const plan = PLANS[input.plan]
  const lines: PriceLine[] = []

  for (const type of Object.keys(TRAVELER_TYPES) as TravelerType[]) {
    const count = input.travelers[type]
    if (count === 0) continue
    const amount = Math.round(
      region.dailyRate * plan.multiplier * TRAVELER_TYPES[type].multiplier * count * days,
    )
    lines.push({
      id: `base-${type}`,
      kind: 'base',
      label: `${TRAVELER_TYPES[type].label} × ${count}`,
      detail: `${plan.label}, ${region.label}, ${formatDays(days)}`,
      amount,
    })
  }

  const basePremium = lines.reduce((sum, line) => sum + line.amount, 0)

  let discount = 0
  if (isFamilyDiscountEligible(input.travelers)) {
    discount = Math.round(basePremium * FAMILY_DISCOUNT.rate)
    lines.push({
      id: 'discount-family',
      kind: 'discount',
      label: FAMILY_DISCOUNT.label,
      detail: `${Math.round(FAMILY_DISCOUNT.rate * 100)} % ze základního pojistného`,
      amount: -discount,
    })
  }

  let addonsTotal = 0
  for (const addonId of ADDON_ORDER) {
    const addon = ADDONS[addonId]
    if (isAddonIncluded(input.plan, addonId)) {
      lines.push({
        id: `included-${addonId}`,
        kind: 'included',
        label: addon.label,
        detail: `V ceně varianty ${plan.label}`,
        amount: 0,
      })
      continue
    }
    if (!input.addons.includes(addonId)) continue

    const { amount, detail } = addonPrice(addon.pricing, input, days, travelerCount)
    addonsTotal += amount
    lines.push({ id: `addon-${addonId}`, kind: 'addon', label: addon.label, detail, amount })
  }

  return {
    days,
    travelerCount,
    lines,
    basePremium,
    discount,
    addonsTotal,
    total: basePremium - discount + addonsTotal,
  }
}

/** Vrátí cenu, nebo null, když vstup ještě není kompletní či platný. Pro průběžnou cenu v UI. */
export function tryCalculatePrice(input: PriceInput): PriceBreakdown | null {
  return validatePriceInput(input).length === 0 ? calculatePrice(input) : null
}

const czkFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency',
  currency: 'CZK',
  maximumFractionDigits: 0,
})

export function formatCzk(amount: number): string {
  return czkFormatter.format(amount)
}
