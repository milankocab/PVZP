// Všechny ceny, limity a podmínky jsou smyšlené. Nejde o ceník žádné pojišťovny.
// Částky jsou v Kč. Úpravou tohoto souboru se změní ceny v celém prototypu.
// Testy v calculatePrice.test.ts mají pevná očekávaná čísla, po změně cen je uprav.

export type RegionId = 'europe' | 'world-no-us-ca' | 'world'
export type TravelerType = 'adult' | 'child' | 'senior'
export type PlanId = 'basic' | 'comfort' | 'premium'
export type AddonId = 'winterSports' | 'cancellation'

export const MAX_TRIP_DAYS = 90
export const MAX_TRAVELERS = 9

export const REGIONS: Record<RegionId, { label: string; description: string; dailyRate: number }> =
  {
    europe: {
      label: 'Evropa',
      description:
        'Všechny státy Evropy a evropská část Ruska, Maroko, Alžírsko, Tunisko, Libye, Turecko, Izrael, Jordánsko a Kypr',
      dailyRate: 18,
    },
    'world-no-us-ca': {
      label: 'Svět bez USA a Kanady',
      description: 'Všechny státy světa kromě USA a Kanady',
      dailyRate: 32,
    },
    world: {
      label: 'Celý svět',
      description: 'Všechny státy světa',
      dailyRate: 52,
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

export type ExtraLuggagePricing =
  /** Pevná cena za kufr na celou cestu. */
  | { type: 'fixed'; amount: number }
  /**
   * Cena za kufr jako násobek denní sazby dospělého v tomto balíčku a počtu dní.
   * Doplatek za kufry ale nikdy nezvedne cenu balíčku nad podíl ceny jiného balíčku.
   */
  | {
      type: 'dailyRate'
      dailyRateMultiplier: number
      cap: { plan: PlanId; share: number }
    }

export interface Plan {
  id: PlanId
  label: string
  /** Násobek denní sazby. Komfort je o 150 % dražší než Základ, Prémium o 20 % dražší než Komfort. */
  multiplier: number
  medicalLimit: number
  /** Limit na jedno pojištěné zavazadlo včetně elektroniky v něm. */
  luggageLimit: number
  /** Kolik zavazadel je v ceně. Jedno na celou smlouvu, nebo jedno na každého cestujícího. */
  includedLuggage: 'perPolicy' | 'perTraveler'
  /** Cena za každý kufr navíc. Je o něco vyšší, než kolik kufr stojí v balíčku. */
  extraLuggage: ExtraLuggagePricing
  /**
   * Nejvyšší plnění za jeden kus elektroniky. Null znamená bez sublimitu (platí limit kufru).
   * 40 tis. Kč odpovídá 80. percentilu hodnoty nahlášené elektroniky u manažerů
   * v (fiktivních) historických datech. Zdůvodnění je v zadání.
   */
  electronicsItemLimit: number | null
  recommended: boolean
  shortDescription: string
  /** Připojištění, která jsou v ceně balíčku a neúčtují se zvlášť. */
  includedAddons: AddonId[]
}

// Obchodní cíl: dnes se nejvíc prodává nejnižší tarif a firma chce zvýšit průměrnou hodnotu
// objednávky. Velký cenový skok mezi Základem a Komfortem a malý mezi Komfortem a Prémiem
// má posunout volbu k vyšším balíčkům. Hlavní cílový segment jsou manažeři.
export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    label: 'Základ',
    multiplier: 1,
    medicalLimit: 2_000_000,
    luggageLimit: 15_000,
    includedLuggage: 'perPolicy',
    // Základ s kufry navíc musí být vždy levnější než Komfort, ale ne o moc.
    // Kufr navíc stojí 1,5násobek ceny dospělého v Základu, takže Základ s kufrem pro
    // každého vyjde na 70 až 90 % ceny Komfortu. Strop 90 % to hlídá i pro velké skupiny.
    extraLuggage: {
      type: 'dailyRate',
      dailyRateMultiplier: 1.5,
      cap: { plan: 'comfort', share: 0.9 },
    },
    electronicsItemLimit: null,
    recommended: false,
    shortDescription: 'Léčebné výlohy a jeden kufr do 15 tis. Kč',
    includedAddons: [],
  },
  comfort: {
    id: 'comfort',
    label: 'Komfort',
    multiplier: 2.5,
    medicalLimit: 5_000_000,
    luggageLimit: 50_000,
    includedLuggage: 'perTraveler',
    extraLuggage: { type: 'fixed', amount: 320 },
    electronicsItemLimit: 40_000,
    recommended: true,
    shortDescription: 'Pracovní notebook i telefon, odpovědnost a rozšířená asistence',
    includedAddons: [],
  },
  premium: {
    id: 'premium',
    label: 'Prémium',
    multiplier: 3,
    medicalLimit: 10_000_000,
    luggageLimit: 80_000,
    includedLuggage: 'perTraveler',
    extraLuggage: { type: 'fixed', amount: 380 },
    electronicsItemLimit: 40_000,
    recommended: false,
    shortDescription: 'Nová cena elektroniky, storno bez lhůty a zpoždění letu',
    includedAddons: ['cancellation'],
  },
}

export const PLAN_ORDER: PlanId[] = ['basic', 'comfort', 'premium']

// Řádky srovnávací tabulky krytí. Hodnota true znamená „kryto“, false „nekryto“.
// Pořadí řádků je záměrné. Na mobilu se nahoře ukazuje to, čím se balíčky liší nejvíc.
export const COVERAGE_ROWS: { label: string; values: Record<PlanId, CoverageValue> }[] = [
  {
    label: 'Zavazadla a elektronika',
    values: {
      basic: '15 tis. Kč na kufr',
      comfort: '50 tis. Kč na kufr',
      premium: '80 tis. Kč na kufr',
    },
  },
  {
    label: 'Kufry v ceně',
    values: { basic: '1 na smlouvu', comfort: '1 na osobu', premium: '1 na osobu' },
  },
  {
    label: 'Jeden kus elektroniky',
    values: {
      basic: 'do limitu kufru',
      comfort: 'nejvýše 40 tis. Kč',
      premium: 'nejvýše 40 tis. Kč',
    },
  },
  {
    label: 'Plnění za elektroniku',
    values: {
      basic: 'Časová cena',
      comfort: 'Časová cena',
      premium: 'Nová cena u věcí do 2 let',
    },
  },
  {
    // Vlastnictví se dokládá až při škodě (faktura na firmu), plnění jde majiteli věci.
    // TODO(Milan): ověřit s právníky pojištění věci, kterou pojištěný nevlastní.
    label: 'Firemní elektronika, kterou používáte',
    values: { basic: false, comfort: false, premium: true },
  },
  {
    label: 'Léčebné výlohy',
    values: { basic: '2 mil. Kč', comfort: '5 mil. Kč', premium: '10 mil. Kč' },
  },
  {
    label: 'Lékařská asistence nonstop',
    values: { basic: true, comfort: true, premium: true },
  },
  {
    label: 'Rozšířená asistence (ztráta dokladů, právní pomoc)',
    values: { basic: false, comfort: true, premium: true },
  },
  {
    label: 'Převoz zpět do ČR',
    values: { basic: true, comfort: true, premium: true },
  },
  {
    label: 'Odpovědnost za škodu na zdraví',
    values: { basic: false, comfort: '1 mil. Kč', premium: '3 mil. Kč' },
  },
  {
    label: 'Odpovědnost za škodu na věci',
    values: { basic: false, comfort: '500 tis. Kč', premium: '1 mil. Kč' },
  },
  {
    label: 'Trvalé následky úrazu',
    values: { basic: false, comfort: '200 tis. Kč', premium: '400 tis. Kč' },
  },
  {
    label: 'Storno zájezdu',
    values: {
      basic: 'Jako připojištění',
      comfort: 'Jako připojištění',
      premium: 'V ceně, bez lhůty od koupě',
    },
  },
  {
    label: 'Zpoždění letu nad 6 hodin',
    values: { basic: false, comfort: false, premium: '3 tis. Kč' },
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
  /** Limit storna, které je v ceně balíčku Prémium. V Prémiu neplatí lhůta od koupě zájezdu. */
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
}

export const ADDON_ORDER: AddonId[] = ['winterSports', 'cancellation']

// Zavazadla jsou v každém balíčku. Klient zadá, kolik kufrů veze.
// Kufry nad počet v ceně se doplácí podle extraLuggage zvoleného balíčku.
export const LUGGAGE = {
  maxPiecesPerTraveler: 2,
}
