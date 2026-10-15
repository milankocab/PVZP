// Všechny ceny, limity a podmínky jsou smyšlené. Nejde o ceník žádné pojišťovny.
// Částky jsou v Kč. Úpravou tohoto souboru se změní ceny v celém prototypu.
// Testy v calculatePrice.test.ts mají pevná očekávaná čísla, po změně cen je uprav.

export type RegionId = 'europe' | 'world-no-us-ca' | 'world'
export type TravelerType = 'adult' | 'child' | 'senior'
export type PlanId = 'basic' | 'standard' | 'comfort'
export type AddonId = 'winterSports' | 'cancellation' | 'luggage'

export const MAX_TRIP_DAYS = 90
export const MAX_TRAVELERS = 9

export const REGIONS: Record<RegionId, { label: string; description: string; dailyRate: number }> =
  {
    europe: {
      label: 'Evropa',
      description:
        'Všechny státy Evropy a evropská část Ruska, Maroko, Alžírsko, Tunisko, Libye, Turecko, Izrael, Jordánsko a Kypr',
      dailyRate: 24,
    },
    'world-no-us-ca': {
      label: 'Svět bez USA a Kanady',
      description: 'Všechny státy světa kromě USA a Kanady',
      dailyRate: 42,
    },
    world: {
      label: 'Celý svět',
      description: 'Všechny státy světa',
      dailyRate: 68,
    },
  }

export const TRAVELER_TYPES: Record<
  TravelerType,
  { label: string; labelPlural: string; ageHint: string; multiplier: number }
> = {
  adult: { label: 'Dospělý', labelPlural: 'Dospělí', ageHint: '18 až 69 let', multiplier: 1 },
  child: { label: 'Dítě', labelPlural: 'Děti', ageHint: 'do 18 let', multiplier: 0.5 },
  senior: { label: 'Senior', labelPlural: 'Senioři', ageHint: '70 let a více', multiplier: 2 },
}

// Rodinná sleva platí při 2 dospělých (dospělý nebo senior) a alespoň 1 dítěti.
// Sleva se počítá jen ze základního pojistného, ne z připojištění.
export const FAMILY_DISCOUNT = {
  label: 'Rodinná sleva',
  requiredAdults: 2,
  minChildren: 1,
  rate: 0.15,
}

export type CoverageValue = string | boolean

export interface Plan {
  id: PlanId
  label: string
  multiplier: number
  medicalLimit: number
  recommended: boolean
  shortDescription: string
  /** Připojištění, která jsou v ceně varianty a neúčtují se zvlášť. */
  includedAddons: AddonId[]
}

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    label: 'Základ',
    multiplier: 0.75,
    medicalLimit: 2_000_000,
    recommended: false,
    shortDescription: 'Léčebné výlohy a asistence',
    includedAddons: [],
  },
  standard: {
    id: 'standard',
    label: 'Standard',
    multiplier: 1,
    medicalLimit: 5_000_000,
    recommended: true,
    shortDescription: 'Navíc odpovědnost a úraz',
    includedAddons: [],
  },
  comfort: {
    id: 'comfort',
    label: 'Komfort',
    multiplier: 1.6,
    medicalLimit: 10_000_000,
    recommended: false,
    shortDescription: 'Vyšší limity a storno zájezdu v ceně',
    includedAddons: ['cancellation'],
  },
}

export const PLAN_ORDER: PlanId[] = ['basic', 'standard', 'comfort']

// Řádky srovnávací tabulky krytí. Hodnota true znamená „kryto“, false „nekryto“.
export const COVERAGE_ROWS: { label: string; values: Record<PlanId, CoverageValue> }[] = [
  {
    label: 'Léčebné výlohy',
    values: { basic: '2 mil. Kč', standard: '5 mil. Kč', comfort: '10 mil. Kč' },
  },
  {
    label: 'Asistenční služba nonstop',
    values: { basic: true, standard: true, comfort: true },
  },
  {
    label: 'Převoz zpět do ČR',
    values: { basic: true, standard: true, comfort: true },
  },
  {
    label: 'Odpovědnost za škodu na zdraví',
    values: { basic: false, standard: '1 mil. Kč', comfort: '3 mil. Kč' },
  },
  {
    label: 'Odpovědnost za škodu na věci',
    values: { basic: false, standard: '500 tis. Kč', comfort: '1 mil. Kč' },
  },
  {
    label: 'Trvalé následky úrazu',
    values: { basic: false, standard: '200 tis. Kč', comfort: '400 tis. Kč' },
  },
  {
    label: 'Storno zájezdu',
    values: {
      basic: 'Jako připojištění',
      standard: 'Jako připojištění',
      comfort: '20 tis. Kč na osobu',
    },
  },
  {
    label: 'Zpoždění letu nad 6 hodin',
    values: { basic: false, standard: false, comfort: '3 tis. Kč' },
  },
]

// Storno zájezdu. Na trhu se storno obvykle musí sjednat do 3 pracovních dnů od zaplacení
// zájezdu. Odjezd nabízí delší lhůtu 7 kalendářních dní. TODO(Milan): ověřit před publikací.
export const CANCELLATION = {
  /** Kolik kalendářních dní od zakoupení zájezdu jde storno sjednat. */
  purchaseWindowDays: 7,
  /** Cena připojištění jako podíl z ceny zájezdu. */
  premiumRate: 0.035,
  minPremium: 190,
  /** Nejvyšší pojistitelná cena zájezdu na osobu u připojištění. */
  maxTripPricePerPerson: 60_000,
  /** Limit storna, které je v ceně varianty Komfort. */
  includedLimitPerPerson: 20_000,
  /** Podíl storno poplatku, který se vrátí při doloženém důvodu (nemoc, úraz a podobně). */
  documentedReasonShare: 0.8,
  /** Podíl storno poplatku, který se vrátí při zrušení z jakéhokoli důvodu bez dokládání. */
  anyReasonShare: 0.5,
  /** Zrušení z jakéhokoli důvodu platí jen nejpozději tolik dní před odjezdem. */
  anyReasonMinDaysBeforeDeparture: 30,
}

export type AddonPricing =
  /** Násobí se počtem cestujících a dní. */
  | { type: 'perPersonPerDay'; amount: number }
  /** Násobí se počtem pojištěných zavazadel. */
  | { type: 'perPiece'; amount: number; limitPerPiece: number }
  /** Podíl z ceny zájezdu, nejméně minPremium. */
  | { type: 'tripPricePercent'; rate: number; minPremium: number }

export interface Addon {
  id: AddonId
  label: string
  description: string
  pricing: AddonPricing
}

export const ADDONS: Record<AddonId, Addon> = {
  winterSports: {
    id: 'winterSports',
    label: 'Zimní a rizikové sporty',
    description: 'Lyžování, snowboard, skialpinismus a další sporty na horách',
    pricing: { type: 'perPersonPerDay', amount: 18 },
  },
  cancellation: {
    id: 'cancellation',
    label: 'Storno zájezdu',
    description: `Vrátí ${CANCELLATION.documentedReasonShare * 100} % storno poplatku při doloženém důvodu. Při zrušení z jakéhokoli důvodu nejpozději ${CANCELLATION.anyReasonMinDaysBeforeDeparture} dní před odjezdem vrátí ${CANCELLATION.anyReasonShare * 100} % bez dokládání. Sjednat jde do ${CANCELLATION.purchaseWindowDays} dní od zakoupení zájezdu.`,
    pricing: {
      type: 'tripPricePercent',
      rate: CANCELLATION.premiumRate,
      minPremium: CANCELLATION.minPremium,
    },
  },
  luggage: {
    id: 'luggage',
    label: 'Zavazadla',
    description: 'Krádež nebo poškození zavazadla až do 20 tis. Kč za každé pojištěné zavazadlo',
    pricing: { type: 'perPiece', amount: 140, limitPerPiece: 20_000 },
  },
}

export const ADDON_ORDER: AddonId[] = ['winterSports', 'cancellation', 'luggage']
