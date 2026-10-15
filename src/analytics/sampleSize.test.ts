import { sampleSizeForConversion, sampleSizeForMean } from './sampleSize'

describe('sampleSizeForConversion', () => {
  it('odpovídá učebnicové hodnotě 686 pro konverzi 10 % proti 15 %', () => {
    expect(sampleSizeForConversion(0.1, 0.5)).toBe(686)
  })

  it('ochranná hranice 5 % potřebuje řádově desítky tisíc návštěv', () => {
    // Pokles konverze z 10 % na 9,5 %.
    expect(sampleSizeForConversion(0.1, -0.05)).toBe(55_252)
  })

  it('hranice 2 % by potřebovala přes 350 tisíc návštěv', () => {
    expect(sampleSizeForConversion(0.1, -0.02)).toBe(350_055)
  })

  it('vrátí null pro nesmyslné vstupy', () => {
    expect(sampleSizeForConversion(0, 0.1)).toBeNull()
    expect(sampleSizeForConversion(0.1, 0)).toBeNull()
    expect(sampleSizeForConversion(0.9, 0.2)).toBeNull()
  })
})

describe('sampleSizeForMean', () => {
  it('odpovídá učebnicové hodnotě 63 pro efekt polovinu směrodatné odchylky', () => {
    // Rozdíl 0,5 při směrodatné odchylce 1.
    expect(sampleSizeForMean(1, 1, 0.5)).toBe(63)
  })

  it('růst AOV o 10 % z 300 Kč při směrodatné odchylce 180 Kč', () => {
    // Rozdíl 30 Kč, n = 2 × 7,85 × 180² / 30² = 565,2.
    expect(sampleSizeForMean(300, 180, 0.1)).toBe(566)
  })

  it('vrátí null pro nesmyslné vstupy', () => {
    expect(sampleSizeForMean(0, 100, 0.1)).toBeNull()
    expect(sampleSizeForMean(300, 0, 0.1)).toBeNull()
    expect(sampleSizeForMean(300, 100, 0)).toBeNull()
  })
})
