import {
  PLANS,
  SPORT_ACTIVITIES,
  TRAVELER_TYPES,
  isAddonIncluded,
  todayIso,
  validatePriceInput,
  type AddonId,
  type PlanId,
  type PriceInput,
  type RegionId,
  type SportId,
  type TravelerCounts,
  type TravelerType,
} from '../pricing'

export type TripPurpose = 'business' | 'leisure'
export type PaymentMethod = 'applePay' | 'googlePay' | 'card'

export interface PersonDetails {
  firstName: string
  lastName: string
  birthDate: string
}

export interface Policyholder extends PersonDetails {
  email: string
  phone: string
}

/**
 * Stav celého formuláře. Drží se jen v paměti prohlížeče, nikam se neodesílá
 * a osobní údaje nikdy nejdou do analytiky.
 */
export interface FormState {
  region: RegionId | null
  departure: string
  return: string
  travelers: TravelerCounts
  tripPurpose: TripPurpose | null
  memberDiscounts: { healthInsurer: boolean; healthClub: boolean }
  plan: PlanId | null
  /** Null znamená počet kufrů v ceně balíčku. */
  luggagePieces: number | null
  /** Klient potvrdil, že chce pojistit méně kufrů, než je cestujících. */
  luggageSharedConfirmed: boolean
  /** Budete na cestě sportovat? Null znamená bez odpovědi. */
  sports: boolean | null
  sportActivities: SportId[]
  wantsCancellation: boolean
  tripPrice: string
  tripBookedOn: string
  policyholder: Policyholder
  policyholderTravels: boolean
  travelerDetails: PersonDetails[]
  consents: { terms: boolean; privacy: boolean; marketing: boolean }
  paymentMethod: PaymentMethod | null
}

const emptyPerson: PersonDetails = { firstName: '', lastName: '', birthDate: '' }

export function createInitialState(preselectedPlan: PlanId | null): FormState {
  return {
    region: null,
    departure: '',
    return: '',
    travelers: { adult: 1, child: 0, senior: 0 },
    tripPurpose: null,
    memberDiscounts: { healthInsurer: false, healthClub: false },
    plan: preselectedPlan,
    luggagePieces: null,
    luggageSharedConfirmed: false,
    sports: null,
    sportActivities: [],
    wantsCancellation: false,
    tripPrice: '',
    tripBookedOn: '',
    policyholder: { ...emptyPerson, email: '', phone: '' },
    policyholderTravels: true,
    travelerDetails: [{ ...emptyPerson }],
    consents: { terms: false, privacy: false, marketing: false },
    paymentMethod: null,
  }
}

/** Pořadí cestujících ve formuláři: dospělí, děti, senioři. */
export function travelerSlots(travelers: TravelerCounts): TravelerType[] {
  return (Object.keys(TRAVELER_TYPES) as TravelerType[]).flatMap((type) =>
    Array<TravelerType>(travelers[type]).fill(type),
  )
}

/** Přizpůsobí seznam údajů cestujících novému počtu a zachová už vyplněné údaje. */
export function resizeTravelerDetails(
  details: PersonDetails[],
  travelers: TravelerCounts,
): PersonDetails[] {
  const count = travelerSlots(travelers).length
  return Array.from({ length: count }, (_, index) => details[index] ?? { ...emptyPerson })
}

export function selectedAddons(state: FormState): AddonId[] {
  const addons: AddonId[] = []
  if (state.sports && state.sportActivities.some((id) => SPORT_ACTIVITIES[id].risky)) {
    addons.push('winterSports')
  }
  if (state.wantsCancellation) addons.push('cancellation')
  return addons
}

/** Převede stav formuláře na vstup cenového modelu. Bez oblasti vrátí null. */
export function toPriceInput(
  state: FormState,
  plan: PlanId | null = state.plan,
): PriceInput | null {
  if (!state.region || !plan) return null
  const addons = selectedAddons(state)
  const needsTrip = addons.includes('cancellation') && !isAddonIncluded(plan, 'cancellation')
  return {
    region: state.region,
    departure: state.departure,
    return: state.return,
    travelers: state.travelers,
    plan,
    addons,
    luggagePieces: state.luggagePieces ?? undefined,
    trip: needsTrip
      ? { price: Number(state.tripPrice.replace(/\s/g, '')), bookedOn: state.tripBookedOn }
      : undefined,
    memberDiscounts: state.memberDiscounts,
  }
}

/** Vstup pro cenu cesty bez doplňků. Slouží k cenám na kartách balíčků a k ceně „od“. */
export function toBasePriceInput(state: FormState, plan: PlanId): PriceInput | null {
  if (!state.region) return null
  return {
    region: state.region,
    departure: state.departure,
    return: state.return,
    travelers: state.travelers,
    plan,
    addons: [],
    memberDiscounts: state.memberDiscounts,
  }
}

export type Errors = Record<string, string>

export type StepId = 'trip' | 'plan' | 'extras' | 'details' | 'summary' | 'payment'

export const STEPS: { id: StepId; label: string }[] = [
  { id: 'trip', label: 'Cesta' },
  { id: 'plan', label: 'Balíček' },
  { id: 'extras', label: 'Doplňky' },
  { id: 'details', label: 'Údaje' },
  { id: 'summary', label: 'Shrnutí' },
  { id: 'payment', label: 'Platba' },
]

function priceIssues(state: FormState, fields: string[]): Errors {
  const input = toPriceInput(state, state.plan ?? 'basic')
  if (!input) return {}
  const errors: Errors = {}
  for (const issue of validatePriceInput(input)) {
    if (fields.includes(issue.field) && !errors[issue.field]) errors[issue.field] = issue.message
  }
  return errors
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9 ]{9,16}$/

/** Věk v celých letech k danému dni. Data jsou ve formátu YYYY-MM-DD. */
export function ageAt(birthDate: string, date: string): number | null {
  const birth = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  const on = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!birth || !on) return null
  const [, by, bm, bd] = birth.map(Number)
  const [, y, m, d] = on.map(Number)
  let age = y - by
  if (m < bm || (m === bm && d < bd)) age -= 1
  return age
}

function validatePerson(
  person: PersonDetails,
  prefix: string,
  type: TravelerType | 'policyholder',
  departure: string,
  today: string,
): Errors {
  const errors: Errors = {}
  if (!person.firstName.trim()) errors[`${prefix}-firstName`] = 'Zadejte jméno.'
  if (!person.lastName.trim()) errors[`${prefix}-lastName`] = 'Zadejte příjmení.'

  const age = ageAt(person.birthDate, departure || today)
  if (age === null || ageAt(person.birthDate, today)! < 0) {
    errors[`${prefix}-birthDate`] = 'Zadejte platné datum narození.'
  } else if (type === 'policyholder' && ageAt(person.birthDate, today)! < 18) {
    errors[`${prefix}-birthDate`] = 'Pojistníkovi musí být alespoň 18 let.'
  } else if (type === 'adult' && (age < 18 || age >= 70)) {
    errors[`${prefix}-birthDate`] = 'Věk neodpovídá dospělému (18 až 69 let v den odjezdu).'
  } else if (type === 'child' && age >= 18) {
    errors[`${prefix}-birthDate`] = 'Věk neodpovídá dítěti (do 18 let v den odjezdu).'
  } else if (type === 'senior' && age < 70) {
    errors[`${prefix}-birthDate`] = 'Věk neodpovídá seniorovi (70 let a více v den odjezdu).'
  }
  return errors
}

/** Pojistník může být prvním cestujícím, jen když první cestující není dítě. */
export function holderTravels(state: FormState): boolean {
  return state.policyholderTravels && travelerSlots(state.travelers)[0] !== 'child'
}

export function validateStep(step: StepId, state: FormState, today: string = todayIso()): Errors {
  switch (step) {
    case 'trip': {
      const errors: Errors = {}
      if (!state.region) errors.region = 'Vyberte, kam jedete.'
      if (!state.departure) errors.departure = 'Zadejte datum odjezdu.'
      if (!state.return) errors.return = 'Zadejte datum návratu.'
      return {
        ...priceIssues(state, ['departure', 'return', 'travelers', 'memberDiscounts']),
        ...errors,
      }
    }
    case 'plan':
      return state.plan ? {} : { plan: 'Vyberte balíček.' }
    case 'extras': {
      const errors: Errors = priceIssues(state, ['luggagePieces'])
      if (state.sports === null) errors.sports = 'Odpovězte, prosím, jestli budete sportovat.'
      if (state.sports && state.sportActivities.length === 0) {
        errors.sportActivities = 'Vyberte, jaké sporty plánujete.'
      }
      return { ...errors, ...priceIssues(state, ['tripPrice', 'tripBookedOn']) }
    }
    case 'details': {
      let errors: Errors = validatePerson(
        state.policyholder,
        'policyholder',
        'policyholder',
        state.departure,
        today,
      )
      if (!EMAIL_PATTERN.test(state.policyholder.email.trim())) {
        errors['policyholder-email'] = 'Zadejte e-mail ve tvaru jmeno@domena.cz.'
      }
      if (!PHONE_PATTERN.test(state.policyholder.phone.trim())) {
        errors['policyholder-phone'] = 'Zadejte telefon, alespoň 9 číslic.'
      }
      travelerSlots(state.travelers).forEach((type, index) => {
        if (index === 0 && holderTravels(state)) {
          // Údaje prvního cestujícího se berou od pojistníka, zkontroluje se jen věk.
          const ageErrors = validatePerson(
            { ...state.policyholder },
            'policyholder',
            type,
            state.departure,
            today,
          )
          if (ageErrors['policyholder-birthDate'] && !errors['policyholder-birthDate']) {
            errors['policyholder-birthDate'] = ageErrors['policyholder-birthDate']
          }
          return
        }
        errors = {
          ...errors,
          ...validatePerson(
            state.travelerDetails[index] ?? emptyPerson,
            `traveler-${index}`,
            type,
            state.departure,
            today,
          ),
        }
      })
      return errors
    }
    case 'summary': {
      const errors: Errors = {}
      if (!state.consents.terms) {
        errors.terms = 'Bez seznámení s podmínkami nejde pojištění sjednat.'
      }
      if (!state.consents.privacy) {
        errors.privacy = 'Potvrďte, že berete na vědomí zpracování osobních údajů.'
      }
      return errors
    }
    case 'payment':
      return state.paymentMethod ? {} : { paymentMethod: 'Vyberte způsob platby.' }
  }
}

/** Smyšlená ukázková cesta, aby šel prototyp rychle projít. */
export function sampleTrip(today: string = todayIso()): Partial<FormState> {
  const start = new Date(`${today}T00:00:00`)
  start.setDate(start.getDate() + 21)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return {
    region: 'europe',
    departure: todayIso(start),
    return: todayIso(end),
    travelers: { adult: 2, child: 0, senior: 0 },
    tripPurpose: 'business',
  }
}

const SAMPLE_PEOPLE: Record<TravelerType, PersonDetails[]> = {
  adult: [
    { firstName: 'Jana', lastName: 'Ukázková', birthDate: '1986-04-12' },
    { firstName: 'Petr', lastName: 'Ukázkový', birthDate: '1984-09-03' },
    { firstName: 'Eva', lastName: 'Smyšlená', birthDate: '1990-01-25' },
  ],
  child: [
    { firstName: 'Ema', lastName: 'Ukázková', birthDate: '2015-06-18' },
    { firstName: 'Adam', lastName: 'Ukázkový', birthDate: '2018-11-02' },
  ],
  senior: [{ firstName: 'Marie', lastName: 'Ukázková', birthDate: '1950-03-30' }],
}

/** Smyšlené osobní údaje pro tlačítko „Vyplnit ukázková data“. */
export function sampleDetails(
  state: FormState,
): Pick<FormState, 'policyholder' | 'travelerDetails' | 'policyholderTravels'> {
  const used: Record<TravelerType, number> = { adult: 0, child: 0, senior: 0 }
  const travelerDetails = travelerSlots(state.travelers).map((type) => {
    const pool = SAMPLE_PEOPLE[type]
    const person = pool[used[type] % pool.length]
    used[type] += 1
    return { ...person }
  })
  const firstIsAdult = travelerSlots(state.travelers)[0] !== 'child'
  const holder = firstIsAdult ? travelerDetails[0] : SAMPLE_PEOPLE.adult[0]
  return {
    policyholder: { ...holder, email: 'jana@example.com', phone: '+420 777 000 000' },
    travelerDetails,
    policyholderTravels: firstIsAdult,
  }
}

export function planLabel(plan: PlanId): string {
  return PLANS[plan].label
}

/** Datum YYYY-MM-DD jako „1. 11. 2026“. */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  return `${day}. ${month}. ${year}`
}
