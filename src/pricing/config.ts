// Všechny ceny, limity a podmínky jsou smyšlené. Ceny jsou v řádu trhu
// (desítky korun za den v Evropě).
// Částky jsou v Kč. Úpravou tohoto souboru se změní ceny v celém prototypu.
// Testy v calculatePrice.test.ts mají pevná očekávaná čísla, po změně cen je uprav.

export type RegionId = 'europe' | 'world'
export type TravelerType = 'adult' | 'child' | 'senior'
export type PlanId = 'basic' | 'comfort' | 'premium'
export type AddonId = 'winterSports' | 'cancellation'

export const MAX_TRIP_DAYS = 90
export const MAX_TRAVELERS = 9

// Denní sazba dospělého v balíčku Základ. Evropa odpovídá řádu trhu.
// Svět je jedna oblast včetně USA a Kanady, aby klient na mobilu řešil o jedno rozhodnutí méně.
// Sazba 70 Kč (1,84× Evropa) leží mezi cenou cest do Asie a cest do USA. Předpoklad z dat
// smyšlené firmy o škodách mimo Evropu.
export const REGIONS: Record<
  RegionId,
  { label: string; shortDescription: string; description: string; dailyRate: number }
> = {
  europe: {
    label: 'Evropa',
    shortDescription: 'včetně Turecka a Maroka',
    description:
      'Všechny státy Evropy a evropská část Ruska, Maroko, Alžírsko, Tunisko, Libye, Turecko, Izrael, Jordánsko a Kypr',
    dailyRate: 38,
  },
  world: {
    label: 'Svět',
    shortDescription: 'včetně USA a Kanady',
    description: 'Všechny státy světa',
    dailyRate: 70,
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
// Všechny slevy se počítají jen ze základního pojistného, ne z připojištění,
// a řetězí se za sebou (každá z ceny po předchozí slevě).
export const FAMILY_DISCOUNT = {
  label: 'Rodinná sleva',
  requiredAdults: 2,
  minChildren: 1,
  rate: 0.15,
}

// Sleva pro členy Klubu pevného zdraví je dodatečná a platí jen pro pojištěnce VZP.
// Prototyp je bere za celou smlouvu, ne po jednotlivých cestujících.
export const MEMBER_DISCOUNTS = {
  healthInsurer: { label: 'Sleva pro pojištěnce VZP', rate: 0.2 },
  healthClub: { label: 'Sleva pro členy Klubu pevného zdraví', rate: 0.1 },
}

export type CoverageValue = string | boolean

/**
 * Cena za kufr navíc za každý den cesty jako násobek denní sazby dospělého v balíčku.
 * Volitelný strop: doplatek za kufry nikdy nezvedne cenu balíčku nad podíl ceny jiného balíčku.
 */
export interface ExtraLuggagePricing {
  dailyRateMultiplier: number
  cap?: { plan: PlanId; share: number }
}

export interface Plan {
  id: PlanId
  label: string
  /** Násobek denní sazby. Komfort je o 50 % dražší než Základ, Prémium o 20 % dražší než Komfort. */
  multiplier: number
  medicalLimit: number
  liabilityLimit: number
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
// objednávky. Hlavní cílový segment jsou manažeři. Cenový skok mezi balíčky je menší než
// skok v hodnotě (limity rostou několikanásobně, cena o 50 % a 20 %), aby vyšší balíček
// působil jako výhodná volba. Velký cenový skok by naopak držel lidi u Základu.
export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    label: 'Základ',
    multiplier: 1,
    medicalLimit: 5_000_000,
    liabilityLimit: 3_000_000,
    luggageLimit: 15_000,
    includedLuggage: 'perPolicy',
    // Základ s kufry navíc musí být vždy levnější než Komfort, ale ne o moc.
    // Kufr navíc stojí polovinu denní ceny dospělého v Základu, takže Základ s kufrem pro
    // každého vyjde na 80 až 90 % ceny Komfortu. Strop 90 % to hlídá i pro velké skupiny.
    extraLuggage: { dailyRateMultiplier: 0.5, cap: { plan: 'comfort', share: 0.9 } },
    electronicsItemLimit: null,
    recommended: false,
    shortDescription: 'Léčebné výlohy a jeden kufr do 15 tis. Kč',
    includedAddons: [],
  },
  comfort: {
    id: 'comfort',
    label: 'Komfort',
    multiplier: 1.5,
    medicalLimit: 25_000_000,
    liabilityLimit: 10_000_000,
    luggageLimit: 50_000,
    includedLuggage: 'perTraveler',
    extraLuggage: { dailyRateMultiplier: 0.5 },
    electronicsItemLimit: 40_000,
    recommended: true,
    shortDescription: 'Pracovní notebook i telefon, odpovědnost a rozšířená asistence',
    includedAddons: [],
  },
  premium: {
    id: 'premium',
    label: 'Prémium',
    multiplier: 1.8,
    medicalLimit: 250_000_000,
    liabilityLimit: 25_000_000,
    luggageLimit: 80_000,
    includedLuggage: 'perTraveler',
    extraLuggage: { dailyRateMultiplier: 0.5 },
    electronicsItemLimit: 40_000,
    recommended: false,
    shortDescription: 'Nová cena elektroniky, storno bez lhůty a zpoždění letu',
    includedAddons: ['cancellation'],
  },
}

export const PLAN_ORDER: PlanId[] = ['basic', 'comfort', 'premium']

// Řádky srovnávací tabulky krytí. Hodnota true znamená „kryto“, false „nekryto“.
// Pořadí řádků je záměrné. Na mobilu se nahoře ukazuje to, čím se balíčky liší nejvíc.
// Hodnoty jsou krátké, aby se na 375 px vešly do třetiny šířky na jeden řádek.
export type CoverageRowId =
  | 'luggage'
  | 'luggageIncluded'
  | 'electronicsItem'
  | 'electronicsSettlement'
  | 'companyElectronics'
  | 'medical'
  | 'medicalAssistance'
  | 'extendedAssistance'
  | 'repatriation'
  | 'liability'
  | 'injury'
  | 'cancellation'
  | 'flightDelay'

export const COVERAGE_ROWS: {
  id: CoverageRowId
  label: string
  values: Record<PlanId, CoverageValue>
}[] = [
  {
    id: 'luggage',
    label: 'Zavazadla a elektronika na jeden kufr',
    values: { basic: '15 tis. Kč', comfort: '50 tis. Kč', premium: '80 tis. Kč' },
  },
  {
    id: 'luggageIncluded',
    label: 'Kufry v ceně',
    values: { basic: '1 na smlouvu', comfort: '1 na osobu', premium: '1 na osobu' },
  },
  {
    id: 'electronicsItem',
    label: 'Jeden kus elektroniky',
    values: { basic: 'do limitu kufru', comfort: '40 tis. Kč', premium: '40 tis. Kč' },
  },
  {
    id: 'electronicsSettlement',
    label: 'Plnění za elektroniku',
    values: { basic: 'časová cena', comfort: 'časová cena', premium: 'nová cena do 2 let' },
  },
  {
    // Vlastnictví se dokládá až při škodě (faktura na firmu), plnění jde majiteli věci.
    // Pojištění věci, kterou pojištěný nevlastní, je nutné potvrdit s legal týmem.
    id: 'companyElectronics',
    label: 'Firemní elektronika, kterou používáte',
    values: { basic: false, comfort: false, premium: true },
  },
  {
    id: 'medical',
    label: 'Léčebné výlohy',
    values: { basic: '5 mil. Kč', comfort: '25 mil. Kč', premium: '250 mil. Kč' },
  },
  {
    id: 'medicalAssistance',
    label: 'Lékařská asistence nonstop',
    values: { basic: true, comfort: true, premium: true },
  },
  {
    id: 'extendedAssistance',
    label: 'Ztráta dokladů a právní pomoc',
    values: { basic: false, comfort: true, premium: true },
  },
  {
    id: 'repatriation',
    label: 'Převoz zpět do ČR',
    values: { basic: true, comfort: true, premium: true },
  },
  {
    id: 'liability',
    label: 'Odpovědnost za škodu',
    values: { basic: '3 mil. Kč', comfort: '10 mil. Kč', premium: '25 mil. Kč' },
  },
  {
    id: 'injury',
    label: 'Trvalé následky úrazu',
    values: { basic: false, comfort: '200 tis. Kč', premium: '400 tis. Kč' },
  },
  {
    id: 'cancellation',
    label: 'Storno zájezdu',
    values: { basic: 'připojištění', comfort: 'připojištění', premium: 'v ceně, bez lhůty' },
  },
  {
    id: 'flightDelay',
    label: 'Zpoždění letu nad 6 hodin',
    values: { basic: false, comfort: false, premium: '3 tis. Kč' },
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
    description: 'Lyže, lezení, potápění, divoká voda, létání a další rizikové sporty',
    // Zhruba polovina denní ceny Základu v Evropě. TODO(Milan): ověřit řád ceny na trhu.
    pricing: { type: 'perPersonPerDay', amount: 20 },
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

export type SportId = 'ski' | 'climbing' | 'diving' | 'water' | 'mtb' | 'air' | 'motor' | 'other'

/**
 * Sporty, na které se ptám v kroku Doplňky. Rizikové zapnou připojištění sportů.
 * Rizikové jsou sloučené do skupin, aby klient na mobilu nečetl dlouhý seznam.
 * Běžné sporty (plavání, turistika po značených cestách, kolo po silnici) jsou v ceně
 * a schovávají se pod jednu volbu „Jiné sporty“.
 * TODO(Milan): ověřit, které sporty trh běžně řadí mezi rizikové.
 */
export const SPORT_ACTIVITIES: Record<
  SportId,
  { label: string; examples: string; risky: boolean }
> = {
  ski: { label: 'Lyže a snowboard', examples: 'sjezd, běžky, skialpinismus', risky: true },
  climbing: { label: 'Lezení a vysoké hory', examples: 'ferraty, horolezectví', risky: true },
  diving: { label: 'Potápění', examples: 's přístrojem', risky: true },
  water: { label: 'Divoká voda a vítr', examples: 'rafting, surf, kite, wakeboard', risky: true },
  mtb: { label: 'Horské kolo', examples: 'enduro, downhill', risky: true },
  air: { label: 'Létání a skoky', examples: 'paragliding, bungee', risky: true },
  motor: { label: 'Motorové sporty', examples: 'čtyřkolka, sněžný skútr', risky: true },
  other: { label: 'Jiné sporty', examples: 'plavání, turistika, kolo, běh', risky: false },
}

export const SPORT_ORDER: SportId[] = [
  'ski',
  'climbing',
  'water',
  'diving',
  'mtb',
  'air',
  'motor',
  'other',
]

export const ADDON_ORDER: AddonId[] = ['winterSports', 'cancellation']

// Zavazadla jsou v každém balíčku. Klient zadá, kolik kufrů veze.
// Kufry nad počet v ceně se doplácí podle extraLuggage zvoleného balíčku.
export const LUGGAGE = {
  maxPiecesPerTraveler: 2,
}
