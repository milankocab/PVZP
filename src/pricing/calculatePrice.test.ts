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

// Očekávané částky vycházejí z config.ts: Evropa 18 Kč, Svět bez USA a Kanady 32 Kč,
// Celý svět 52 Kč za osobu a den. Základ 1×, Komfort 2,5×, Prémium 3× (storno v ceně).
// Dítě 0,5×, senior 2×. Rodinná sleva 15 %. Zimní sporty 18 Kč/os./den,
// storno 3,5 % z ceny zájezdu (nejméně 190 Kč, sjednat do 7 dní od koupě).
// Kufry v ceně: Základ 1 na smlouvu, Komfort a Prémium 1 na osobu.
// Další kufr: Základ 150 Kč, Komfort 320 Kč, Prémium 380 Kč.

const TODAY = '2026-10-14'

function input(overrides: Partial<PriceInput> = {}): PriceInput {
  return {
    region: 'europe',
    departure: '2026-11-01',
    return: '2026-11-01',
    travelers: { adult: 1, child: 0, senior: 0 },
    plan: 'comfort',
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
    expect(price.total).toBe(45)
  })

  it('cesta na maximálních 90 dní je platná', () => {
    const price = calculatePrice(input({ return: '2027-01-29' }))
    expect(price.days).toBe(90)
    expect(price.total).toBe(4050)
  })

  it('cesta na 91 dní je neplatná', () => {
    expect(fieldsOf({ return: '2027-01-30' })).toEqual(['return'])
    expect(() => calculatePrice(input({ return: '2027-01-30' }))).toThrow(InvalidPriceInputError)
  })

  it('rodinná sleva se odečte ze základního pojistného', () => {
    const price = calculatePrice(
      input({ return: '2026-11-10', travelers: { adult: 2, child: 1, senior: 0 } }),
    )
    // Dospělí 45 × 2 × 10 = 900, dítě 45 × 0,5 × 10 = 225, sleva 15 % z 1125 = 168,75.
    expect(price.basePremium).toBe(1125)
    expect(price.discount).toBe(169)
    expect(price.total).toBe(956)
    expect(price.lines.find((line) => line.kind === 'discount')?.amount).toBe(-169)
  })

  it('rodinná sleva se nepočítá z připojištění', () => {
    const price = calculatePrice(
      input({
        return: '2026-11-10',
        travelers: { adult: 2, child: 1, senior: 0 },
        addons: ['winterSports'],
      }),
    )
    // Základ 1125, sleva 169, zimní sporty 18 × 3 × 10 = 540.
    expect(price.addonsTotal).toBe(540)
    expect(price.total).toBe(1496)
  })

  it('senior platí dvojnásobek a cena se zaokrouhlí na koruny', () => {
    const price = calculatePrice(
      input({
        region: 'world',
        plan: 'premium',
        return: '2026-11-07',
        travelers: { adult: 0, child: 0, senior: 1 },
      }),
    )
    // 52 × 3 × 2 × 7 = 2184.
    expect(price.total).toBe(2184)
  })

  it('kombinace všech připojištění', () => {
    const price = calculatePrice(
      input({
        return: '2026-11-07',
        travelers: { adult: 2, child: 0, senior: 0 },
        addons: ['winterSports', 'cancellation'],
        luggagePieces: 3,
        trip: { price: 30_000, bookedOn: '2026-10-10' },
      }),
    )
    // Komfort 45 × 2 × 7 = 630, zimní sporty 18 × 2 × 7 = 252,
    // storno 3,5 % z 30 000 = 1050, třetí kufr 320.
    expect(price.basePremium).toBe(630)
    expect(price.addonsTotal).toBe(1622)
    expect(price.total).toBe(2252)
    expect(price.lines.map((line) => line.id)).toEqual([
      'base-adult',
      'included-luggage',
      'addon-winterSports',
      'addon-cancellation',
      'addon-extraLuggage',
    ])
  })

  it('duplicitní připojištění se počítá jednou', () => {
    const price = calculatePrice(input({ addons: ['winterSports', 'winterSports'] }))
    expect(price.total).toBe(45 + 18)
  })

  it('dítě v základní variantě', () => {
    const price = calculatePrice(
      input({
        plan: 'basic',
        return: '2026-11-03',
        travelers: { adult: 0, child: 1, senior: 0 },
      }),
    )
    // 18 × 1 × 0,5 × 3 = 27.
    expect(price.total).toBe(27)
  })

  it('Komfort je o 150 % dražší než Základ, Prémium o 20 % dražší než Komfort', () => {
    const totals = (['basic', 'comfort', 'premium'] as const).map(
      (plan) => calculatePrice(input({ plan, return: '2026-11-10' })).total,
    )
    expect(totals).toEqual([180, 450, 540])
  })

  it('součet položek rozpadu odpovídá celkové ceně', () => {
    const price = calculatePrice(
      input({
        region: 'world-no-us-ca',
        plan: 'premium',
        return: '2026-11-23',
        travelers: { adult: 1, child: 2, senior: 1 },
        addons: ['winterSports'],
        luggagePieces: 6,
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

  it('v Prémiu je storno v ceně bez lhůty a nepotřebuje údaje o zájezdu', () => {
    const price = calculatePrice(input({ plan: 'premium', addons: ['cancellation'] }))
    // 18 × 3 = 54.
    expect(price.total).toBe(54)
    expect(price.addonsTotal).toBe(0)
    expect(price.lines.find((line) => line.id === 'included-cancellation')?.amount).toBe(0)
  })
})

describe('zavazadla', () => {
  const two = { adult: 2, child: 0, senior: 0 }

  it('Základ má v ceně jeden kufr na smlouvu, další se doplácí', () => {
    expect(calculatePrice(input({ plan: 'basic', travelers: two })).addonsTotal).toBe(0)
    expect(
      calculatePrice(input({ plan: 'basic', travelers: two, luggagePieces: 2 })).addonsTotal,
    ).toBe(150)
  })

  it('Komfort a Prémium mají v ceně kufr pro každého', () => {
    expect(calculatePrice(input({ plan: 'comfort', travelers: two })).addonsTotal).toBe(0)
    expect(
      calculatePrice(input({ plan: 'comfort', travelers: two, luggagePieces: 3 })).addonsTotal,
    ).toBe(320)
    expect(
      calculatePrice(input({ plan: 'premium', travelers: two, luggagePieces: 4 })).addonsTotal,
    ).toBe(760)
  })

  it('méně kufrů než cestujících nesnižuje cenu', () => {
    expect(calculatePrice(input({ travelers: two, luggagePieces: 1 })).total).toBe(
      calculatePrice(input({ travelers: two })).total,
    )
  })

  it('sdílený kufr se pozná, aby UI mohlo varovat', () => {
    expect(isLuggageShared(input({ travelers: two, luggagePieces: 1 }))).toBe(true)
    expect(isLuggageShared(input({ travelers: two }))).toBe(false)
    // Základ má v ceně jen jeden kufr, takže dvojice ve výchozím stavu sdílí.
    expect(isLuggageShared(input({ plan: 'basic', travelers: two }))).toBe(true)
    expect(isLuggageShared(input({ plan: 'basic' }))).toBe(false)
  })

  it('počet kufrů musí být od 1 do dvojnásobku cestujících', () => {
    expect(fieldsOf({ travelers: two, luggagePieces: 0 })).toEqual(['luggagePieces'])
    expect(fieldsOf({ travelers: two, luggagePieces: 5 })).toEqual(['luggagePieces'])
    expect(fieldsOf({ travelers: two, luggagePieces: 4 })).toEqual([])
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
    expect(tryCalculatePrice(input())?.total).toBe(45)
  })
})

describe('formatCzk', () => {
  it('formátuje české koruny', () => {
    expect(formatCzk(1448).replace(/\s/g, ' ')).toBe('1 448 Kč')
  })
})
