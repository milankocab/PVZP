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

// Očekávané částky vycházejí z config.ts. Denní sazba dospělého v Základu: Evropa 38 Kč,
// Svět 70 Kč. Základ 1×, Komfort 1,5×, Prémium 1,8×.
// Dítě 0,5×, senior 2×. Slevy ze základního pojistného, řetězí se: rodinná 15 %,
// pojištěnci VZP 20 %, Klub pevného zdraví dalších 10 %. Zimní sporty 20 Kč/os./den.
// Storno 3,5 % z ceny zájezdu (nejméně 190 Kč, sjednat do 7 dní od koupě, v Prémiu v ceně).
// Kufry v ceně: Základ 1 na smlouvu, Komfort a Prémium 1 na osobu. Kufr navíc stojí
// polovinu denní sazby dospělého v balíčku za den, v Základu nejvýše do 90 % ceny Komfortu.

const TODAY = '2026-10-14'
const WEEK = '2026-11-07'

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
  it('jednodenní cesta jednoho dospělého v Komfortu', () => {
    const price = calculatePrice(input())
    expect(price.days).toBe(1)
    // 38 × 1,5 = 57.
    expect(price.total).toBe(57)
  })

  it('cesta na maximálních 90 dní je platná', () => {
    const price = calculatePrice(input({ return: '2027-01-29' }))
    expect(price.days).toBe(90)
    expect(price.total).toBe(5130)
  })

  it('cesta na 91 dní je neplatná', () => {
    expect(fieldsOf({ return: '2027-01-30' })).toEqual(['return'])
    expect(() => calculatePrice(input({ return: '2027-01-30' }))).toThrow(InvalidPriceInputError)
  })

  it('balíčky stojí 1×, 1,5× a 1,8× Základu', () => {
    const totals = (['basic', 'comfort', 'premium'] as const).map(
      (plan) => calculatePrice(input({ plan, return: '2026-11-10' })).total,
    )
    expect(totals).toEqual([380, 570, 684])
  })

  it('rodinná sleva se odečte ze základního pojistného', () => {
    const price = calculatePrice(
      input({ return: '2026-11-10', travelers: { adult: 2, child: 1, senior: 0 } }),
    )
    // Dospělí 57 × 2 × 10 = 1140, dítě 57 × 0,5 × 10 = 285, sleva 15 % z 1425 = 213,75.
    expect(price.basePremium).toBe(1425)
    expect(price.discount).toBe(214)
    expect(price.total).toBe(1211)
    expect(price.lines.find((line) => line.kind === 'discount')?.amount).toBe(-214)
  })

  it('rodinná sleva se nepočítá z připojištění', () => {
    const price = calculatePrice(
      input({
        return: '2026-11-10',
        travelers: { adult: 2, child: 1, senior: 0 },
        addons: ['winterSports'],
      }),
    )
    // Základní pojistné po slevě 1211, zimní sporty 20 × 3 × 10 = 600.
    expect(price.addonsTotal).toBe(600)
    expect(price.total).toBe(1811)
  })

  it('senior platí dvojnásobek', () => {
    const price = calculatePrice(
      input({
        region: 'world',
        plan: 'premium',
        return: WEEK,
        travelers: { adult: 0, child: 0, senior: 1 },
      }),
    )
    // 70 × 1,8 × 2 × 7 = 1764.
    expect(price.total).toBe(1764)
  })

  it('dítě v Základu', () => {
    const price = calculatePrice(
      input({ plan: 'basic', return: '2026-11-03', travelers: { adult: 0, child: 1, senior: 0 } }),
    )
    // 38 × 0,5 × 3 = 57.
    expect(price.total).toBe(57)
  })

  it('kombinace připojištění a kufru navíc', () => {
    const price = calculatePrice(
      input({
        return: WEEK,
        travelers: { adult: 2, child: 0, senior: 0 },
        addons: ['winterSports', 'cancellation'],
        luggagePieces: 3,
        trip: { price: 30_000, bookedOn: '2026-10-10' },
      }),
    )
    // Komfort 57 × 2 × 7 = 798, zimní sporty 20 × 2 × 7 = 280,
    // storno 3,5 % z 30 000 = 1050, třetí kufr 28,5 × 7 = 199,5.
    expect(price.basePremium).toBe(798)
    expect(price.addonsTotal).toBe(1530)
    expect(price.total).toBe(2328)
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
    expect(price.total).toBe(57 + 20)
  })

  it('součet položek rozpadu odpovídá celkové ceně', () => {
    const price = calculatePrice(
      input({
        region: 'world',
        plan: 'premium',
        return: '2026-11-23',
        travelers: { adult: 1, child: 2, senior: 1 },
        addons: ['winterSports'],
        luggagePieces: 6,
        memberDiscounts: { healthInsurer: true, healthClub: true },
      }),
    )
    expect(price.lines.reduce((sum, line) => sum + line.amount, 0)).toBe(price.total)
  })
})

describe('slevy pro pojištěnce VZP a členy Klubu pevného zdraví', () => {
  it('sleva 20 % pro pojištěnce VZP', () => {
    const price = calculatePrice(input({ return: WEEK, memberDiscounts: { healthInsurer: true } }))
    // 399 − 20 % (79,8) = 319.
    expect(price.total).toBe(319)
  })

  it('Klub pevného zdraví přidá dalších 10 % z ceny po slevě VZP', () => {
    const price = calculatePrice(
      input({ return: WEEK, memberDiscounts: { healthInsurer: true, healthClub: true } }),
    )
    // 399 − 80 = 319, dalších 10 % z 319 (31,9) = 32, celkem 287.
    expect(price.discount).toBe(112)
    expect(price.total).toBe(287)
  })

  it('slevy se řetězí s rodinnou slevou', () => {
    const price = calculatePrice(
      input({
        return: '2026-11-10',
        travelers: { adult: 2, child: 1, senior: 0 },
        memberDiscounts: { healthInsurer: true, healthClub: true },
      }),
    )
    // 1425 − 214 = 1211, − 20 % (242) = 969, − 10 % (97) = 872.
    expect(price.total).toBe(872)
    expect(
      price.lines.filter((line) => line.kind === 'discount').map((line) => line.amount),
    ).toEqual([-214, -242, -97])
  })

  it('slevy se nepočítají z připojištění', () => {
    const price = calculatePrice(
      input({ return: WEEK, addons: ['winterSports'], memberDiscounts: { healthInsurer: true } }),
    )
    expect(price.total).toBe(319 + 140)
  })

  it('sleva klubu bez pojištění u VZP je neplatná', () => {
    expect(fieldsOf({ memberDiscounts: { healthClub: true } })).toEqual(['memberDiscounts'])
  })
})

describe('storno zájezdu', () => {
  const withCancellation = (overrides: Partial<PriceInput> = {}) =>
    input({
      addons: ['cancellation'],
      trip: { price: 20_000, bookedOn: TODAY },
      ...overrides,
    })

  it('cena je 3,5 % z ceny zájezdu', () => {
    expect(calculatePrice(withCancellation()).addonsTotal).toBe(700)
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
    // 38 × 1,8 = 68,4.
    expect(price.total).toBe(68)
    expect(price.addonsTotal).toBe(0)
    expect(price.lines.find((line) => line.id === 'included-cancellation')?.amount).toBe(0)
  })
})

describe('zavazadla', () => {
  const two = { adult: 2, child: 0, senior: 0 }

  it('Základ má v ceně jeden kufr na smlouvu, další se doplácí za každý den', () => {
    expect(calculatePrice(input({ plan: 'basic', travelers: two })).addonsTotal).toBe(0)
    // 1 den: 38 × 0,5 = 19 Kč za kufr.
    expect(
      calculatePrice(input({ plan: 'basic', travelers: two, luggagePieces: 2 })).addonsTotal,
    ).toBe(19)
  })

  it('Komfort a Prémium mají v ceně kufr pro každého', () => {
    expect(calculatePrice(input({ travelers: two })).addonsTotal).toBe(0)
    // Komfort 57 × 0,5 = 28,5 za den, Prémium 68,4 × 0,5 = 34,2 za den.
    expect(calculatePrice(input({ travelers: two, luggagePieces: 3 })).addonsTotal).toBe(29)
    expect(
      calculatePrice(input({ plan: 'premium', travelers: two, luggagePieces: 4 })).addonsTotal,
    ).toBe(68)
  })

  it('kufr navíc stojí desítky korun i na týden', () => {
    const price = calculatePrice(input({ return: WEEK, travelers: two, luggagePieces: 3 }))
    expect(price.addonsTotal).toBe(200)
  })

  it('Základ s kufrem pro každého je levnější než Komfort, ale ne o moc', () => {
    for (const adult of [2, 3, 4, 6, 9]) {
      const travelers = { adult, child: 0, senior: 0 }
      const basic = calculatePrice(
        input({ return: WEEK, plan: 'basic', travelers, luggagePieces: adult }),
      ).total
      const comfort = calculatePrice(input({ return: WEEK, travelers })).total
      expect(basic / comfort).toBeGreaterThanOrEqual(0.8)
      expect(basic / comfort).toBeLessThanOrEqual(0.9)
    }
  })

  it('dvojice na týden v Evropě, Základ se dvěma kufry', () => {
    const price = calculatePrice(
      input({ return: WEEK, plan: 'basic', travelers: two, luggagePieces: 2 }),
    )
    // Základ 38 × 2 × 7 = 532, kufr navíc 19 × 7 = 133. Komfort by stál 798.
    expect(price.total).toBe(665)
  })

  it('strop 90 % ceny Komfortu platí i pro velkou skupinu s mnoha kufry', () => {
    const travelers = { adult: 6, child: 0, senior: 0 }
    const price = calculatePrice(
      input({ return: WEEK, plan: 'basic', travelers, luggagePieces: 12 }),
    )
    // Komfort 57 × 6 × 7 = 2394, 90 % = 2154,6. Základ 1596, doplatek nejvýše 558.
    expect(price.total).toBe(2154)
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

  it('neznámá oblast, balíček a připojištění', () => {
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
    expect(tryCalculatePrice(input())?.total).toBe(57)
  })
})

describe('formatCzk', () => {
  it('formátuje české koruny', () => {
    expect(formatCzk(1448).replace(/\s/g, ' ')).toBe('1 448 Kč')
  })
})
