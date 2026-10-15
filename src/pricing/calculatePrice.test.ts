import {
  calculatePrice,
  formatCzk,
  InvalidPriceInputError,
  isFamilyDiscountEligible,
  isLuggageShared,
  isWithinCancellationWindow,
  tripDays,
  tryCalculatePrice,
  validatePriceInput,
  type PriceInput,
} from './calculatePrice'

// Očekávané částky vycházejí z config.ts: Evropa 24 Kč, Svět bez USA a Kanady 42 Kč,
// Celý svět 68 Kč za osobu a den. Základ 0,75×, Standard 1×, Komfort 1,6× (storno v ceně).
// Dítě 0,5×, senior 2×. Rodinná sleva 15 %. Zimní sporty 18 Kč/os./den,
// storno 3,5 % z ceny zájezdu (nejméně 190 Kč, sjednat do 7 dní od koupě), zavazadla 140 Kč/kus.

const TODAY = '2026-10-14'

function input(overrides: Partial<PriceInput> = {}): PriceInput {
  return {
    region: 'europe',
    departure: '2026-11-01',
    return: '2026-11-01',
    travelers: { adult: 1, child: 0, senior: 0 },
    plan: 'standard',
    addons: [],
    today: TODAY,
    ...overrides,
  }
}

function fieldsOf(overrides: Partial<PriceInput>) {
  return validatePriceInput(input(overrides)).map((issue) => issue.field)
}

describe('tripDays', () => {
  it('počítá den odjezdu i návratu', () => {
    expect(tripDays('2026-11-01', '2026-11-01')).toBe(1)
    expect(tripDays('2026-11-01', '2026-11-07')).toBe(7)
  })

  it('zvládne přestupný rok a přelom roku', () => {
    expect(tripDays('2028-02-28', '2028-03-01')).toBe(3)
    expect(tripDays('2026-12-30', '2027-01-02')).toBe(4)
  })

  it('nepočítá s přechodem na zimní čas jako s půldnem', () => {
    expect(tripDays('2026-10-24', '2026-10-26')).toBe(3)
  })

  it('vrátí null pro návrat před odjezdem a neplatná data', () => {
    expect(tripDays('2026-11-05', '2026-11-04')).toBeNull()
    expect(tripDays('2026-02-30', '2026-03-01')).toBeNull()
    expect(tripDays('1.11.2026', '2026-11-02')).toBeNull()
  })
})

describe('calculatePrice', () => {
  it('jednodenní cesta jednoho dospělého', () => {
    const price = calculatePrice(input())
    expect(price.days).toBe(1)
    expect(price.total).toBe(24)
  })

  it('cesta na maximálních 90 dní je platná', () => {
    const price = calculatePrice(input({ return: '2027-01-29' }))
    expect(price.days).toBe(90)
    expect(price.total).toBe(2160)
  })

  it('cesta na 91 dní je neplatná', () => {
    expect(fieldsOf({ return: '2027-01-30' })).toEqual(['return'])
    expect(() => calculatePrice(input({ return: '2027-01-30' }))).toThrow(InvalidPriceInputError)
  })

  it('rodinná sleva se odečte ze základního pojistného', () => {
    const price = calculatePrice(
      input({ return: '2026-11-10', travelers: { adult: 2, child: 1, senior: 0 } }),
    )
    // Dospělí 24 × 2 × 10 = 480, dítě 24 × 0,5 × 10 = 120, sleva 15 % z 600 = 90.
    expect(price.basePremium).toBe(600)
    expect(price.discount).toBe(90)
    expect(price.total).toBe(510)
    expect(price.lines.find((line) => line.kind === 'discount')?.amount).toBe(-90)
  })

  it('rodinná sleva se nepočítá z připojištění', () => {
    const price = calculatePrice(
      input({
        return: '2026-11-10',
        travelers: { adult: 2, child: 1, senior: 0 },
        addons: ['winterSports'],
      }),
    )
    // Základ 600, sleva 90, zimní sporty 18 × 3 × 10 = 540.
    expect(price.addonsTotal).toBe(540)
    expect(price.total).toBe(1050)
  })

  it('senior platí dvojnásobek a cena se zaokrouhlí na koruny', () => {
    const price = calculatePrice(
      input({
        region: 'world',
        plan: 'comfort',
        return: '2026-11-07',
        travelers: { adult: 0, child: 0, senior: 1 },
      }),
    )
    // 68 × 1,6 × 2 × 7 = 1523,2.
    expect(price.total).toBe(1523)
  })

  it('kombinace všech připojištění', () => {
    const price = calculatePrice(
      input({
        return: '2026-11-07',
        travelers: { adult: 2, child: 0, senior: 0 },
        addons: ['winterSports', 'cancellation', 'luggage'],
        trip: { price: 30_000, bookedOn: '2026-10-10' },
      }),
    )
    // Základ 24 × 2 × 7 = 336, zimní sporty 18 × 2 × 7 = 252,
    // storno 3,5 % z 30 000 = 1050, zavazadla 140 × 2 = 280.
    expect(price.basePremium).toBe(336)
    expect(price.addonsTotal).toBe(1582)
    expect(price.total).toBe(1918)
    expect(price.lines.map((line) => line.id)).toEqual([
      'base-adult',
      'addon-winterSports',
      'addon-cancellation',
      'addon-luggage',
    ])
  })

  it('duplicitní připojištění se počítá jednou', () => {
    const price = calculatePrice(input({ addons: ['luggage', 'luggage'] }))
    expect(price.total).toBe(24 + 140)
  })

  it('dítě v základní variantě', () => {
    const price = calculatePrice(
      input({
        plan: 'basic',
        return: '2026-11-03',
        travelers: { adult: 0, child: 1, senior: 0 },
      }),
    )
    // 24 × 0,75 × 0,5 × 3 = 27.
    expect(price.total).toBe(27)
  })

  it('varianty jsou seřazené podle ceny', () => {
    const totals = (['basic', 'standard', 'comfort'] as const).map(
      (plan) => calculatePrice(input({ plan, return: '2026-11-10' })).total,
    )
    expect(totals).toEqual([180, 240, 384])
  })

  it('součet položek rozpadu odpovídá celkové ceně', () => {
    const price = calculatePrice(
      input({
        region: 'world-no-us-ca',
        plan: 'comfort',
        return: '2026-11-23',
        travelers: { adult: 1, child: 2, senior: 1 },
        addons: ['winterSports', 'luggage'],
        luggagePieces: 2,
      }),
    )
    expect(price.lines.reduce((sum, line) => sum + line.amount, 0)).toBe(price.total)
  })
})

describe('storno zájezdu', () => {
  const withCancellation = (overrides: Partial<PriceInput> = {}) =>
    input({
      addons: ['cancellation'],
      trip: { price: 20_000, bookedOn: '2026-10-14' },
      ...overrides,
    })

  it('cena je 3,5 % z ceny zájezdu', () => {
    const price = calculatePrice(withCancellation())
    expect(price.addonsTotal).toBe(700)
  })

  it('u levného zájezdu platí minimální cena', () => {
    const price = calculatePrice(withCancellation({ trip: { price: 2_000, bookedOn: TODAY } }))
    // 3,5 % z 2 000 = 70, minimum je 190.
    expect(price.addonsTotal).toBe(190)
  })

  it('lhůta pro sjednání je 7 kalendářních dní od koupě včetně', () => {
    expect(isWithinCancellationWindow('2026-10-14', TODAY)).toBe(true)
    expect(isWithinCancellationWindow('2026-10-07', TODAY)).toBe(true)
    expect(isWithinCancellationWindow('2026-10-06', TODAY)).toBe(false)
    expect(isWithinCancellationWindow('2026-10-15', TODAY)).toBe(false)
  })

  it('po uplynutí lhůty nejde storno sjednat', () => {
    expect(
      validatePriceInput(withCancellation({ trip: { price: 20_000, bookedOn: '2026-10-06' } })),
    ).toEqual([expect.objectContaining({ field: 'tripBookedOn' })])
  })

  it('chybějící cena a datum zakoupení', () => {
    expect(
      validatePriceInput(withCancellation({ trip: undefined })).map((issue) => issue.field),
    ).toEqual(['tripPrice', 'tripBookedOn'])
    expect(
      validatePriceInput(withCancellation({ trip: { price: 0, bookedOn: '2026-10-20' } })).map(
        (issue) => issue.field,
      ),
    ).toEqual(['tripPrice', 'tripBookedOn'])
  })

  it('cena zájezdu nad limit 60 000 Kč na osobu', () => {
    expect(
      fieldsOf({ addons: ['cancellation'], trip: { price: 60_001, bookedOn: TODAY } }),
    ).toEqual(['tripPrice'])
    expect(
      fieldsOf({ addons: ['cancellation'], trip: { price: 60_000, bookedOn: TODAY } }),
    ).toEqual([])
  })

  it('v Komfortu je storno v ceně a nepotřebuje údaje o zájezdu', () => {
    const price = calculatePrice(input({ plan: 'comfort', addons: ['cancellation'] }))
    // 24 × 1,6 = 38,4.
    expect(price.total).toBe(38)
    expect(price.addonsTotal).toBe(0)
    expect(price.lines.find((line) => line.id === 'included-cancellation')?.amount).toBe(0)
  })
})

describe('zavazadla', () => {
  it('cena se počítá za zavazadlo, výchozí je jedno na osobu', () => {
    const travelers = { adult: 3, child: 0, senior: 0 }
    expect(calculatePrice(input({ travelers, addons: ['luggage'] })).addonsTotal).toBe(420)
    expect(
      calculatePrice(input({ travelers, addons: ['luggage'], luggagePieces: 1 })).addonsTotal,
    ).toBe(140)
  })

  it('sdílené zavazadlo se pozná, aby UI mohlo varovat', () => {
    const travelers = { adult: 2, child: 0, senior: 0 }
    expect(isLuggageShared(input({ travelers, addons: ['luggage'], luggagePieces: 1 }))).toBe(true)
    expect(isLuggageShared(input({ travelers, addons: ['luggage'] }))).toBe(false)
    expect(isLuggageShared(input({ travelers, addons: [], luggagePieces: 1 }))).toBe(false)
  })

  it('počet zavazadel musí být od 1 do počtu cestujících', () => {
    const travelers = { adult: 2, child: 0, senior: 0 }
    expect(fieldsOf({ travelers, addons: ['luggage'], luggagePieces: 0 })).toEqual([
      'luggagePieces',
    ])
    expect(fieldsOf({ travelers, addons: ['luggage'], luggagePieces: 3 })).toEqual([
      'luggagePieces',
    ])
  })
})

describe('isFamilyDiscountEligible', () => {
  it('platí pro 2 dospělé a alespoň 1 dítě', () => {
    expect(isFamilyDiscountEligible({ adult: 2, child: 1, senior: 0 })).toBe(true)
    expect(isFamilyDiscountEligible({ adult: 2, child: 4, senior: 0 })).toBe(true)
  })

  it('senior se počítá jako dospělý', () => {
    expect(isFamilyDiscountEligible({ adult: 1, child: 1, senior: 1 })).toBe(true)
  })

  it('neplatí bez dítěte, pro jednoho nebo tři dospělé', () => {
    expect(isFamilyDiscountEligible({ adult: 2, child: 0, senior: 0 })).toBe(false)
    expect(isFamilyDiscountEligible({ adult: 1, child: 2, senior: 0 })).toBe(false)
    expect(isFamilyDiscountEligible({ adult: 3, child: 1, senior: 0 })).toBe(false)
  })
})

describe('validatePriceInput', () => {
  it('platný vstup nemá chyby', () => {
    expect(validatePriceInput(input())).toEqual([])
  })

  it('odjezd dnes je platný, včera ne', () => {
    expect(fieldsOf({ departure: TODAY, return: TODAY })).toEqual([])
    expect(fieldsOf({ departure: '2026-10-13', return: '2026-10-20' })).toEqual(['departure'])
  })

  it('návrat před odjezdem', () => {
    expect(fieldsOf({ return: '2026-10-31' })).toEqual(['return'])
  })

  it('neplatná a prázdná data', () => {
    expect(fieldsOf({ departure: '', return: '' })).toEqual(['departure', 'return'])
    expect(fieldsOf({ departure: '2026-11-31' })).toEqual(['departure'])
  })

  it('počet cestujících', () => {
    expect(fieldsOf({ travelers: { adult: 0, child: 0, senior: 0 } })).toEqual(['travelers'])
    expect(fieldsOf({ travelers: { adult: 9, child: 1, senior: 0 } })).toEqual(['travelers'])
    expect(fieldsOf({ travelers: { adult: 9, child: 0, senior: 0 } })).toEqual([])
    expect(fieldsOf({ travelers: { adult: -1, child: 2, senior: 0 } })).toEqual(['travelers'])
    expect(fieldsOf({ travelers: { adult: 1.5, child: 0, senior: 0 } })).toEqual(['travelers'])
  })

  it('neznámá oblast, varianta a připojištění', () => {
    expect(
      fieldsOf({
        region: 'mars' as never,
        plan: 'gold' as never,
        addons: ['pets' as never],
      }),
    ).toEqual(['region', 'plan', 'addons'])
  })
})

describe('tryCalculatePrice', () => {
  it('vrátí null místo výjimky pro neúplný vstup', () => {
    expect(tryCalculatePrice(input({ return: '' }))).toBeNull()
    expect(tryCalculatePrice(input())?.total).toBe(24)
  })
})

describe('formatCzk', () => {
  it('formátuje české koruny', () => {
    expect(formatCzk(1448).replace(/\s/g, ' ')).toBe('1 448 Kč')
  })
})
