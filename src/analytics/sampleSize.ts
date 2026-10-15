// Kalkulačka velikosti vzorku pro A/B test. Hladina významnosti 5 % (oboustranně), síla 80 %.

const Z_ALPHA = 1.959964 // 5 % oboustranně
const Z_BETA = 0.841621 // síla 80 %

/**
 * Počet návštěv na variantu pro odhalení změny konverze.
 * baseline je výchozí konverze (0,10 = 10 %), relativeEffect relativní změna (−0,05 = pokles o 5 %).
 * Vzorec pro dvě nezávislé proporce s nesdíleným rozptylem alternativy.
 */
export function sampleSizeForConversion(baseline: number, relativeEffect: number): number | null {
  const p1 = baseline
  const p2 = baseline * (1 + relativeEffect)
  if (!(p1 > 0 && p1 < 1 && p2 > 0 && p2 < 1) || p1 === p2) return null
  const pooled = (p1 + p2) / 2
  const numerator =
    Z_ALPHA * Math.sqrt(2 * pooled * (1 - pooled)) +
    Z_BETA * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))
  return Math.ceil(numerator ** 2 / (p2 - p1) ** 2)
}

/**
 * Počet objednávek na variantu pro odhalení změny průměrné hodnoty objednávky (AOV).
 * meanValue je dnešní AOV, standardDeviation směrodatná odchylka cen objednávek
 * a relativeEffect relativní změna (0,10 = růst o 10 %).
 */
export function sampleSizeForMean(
  meanValue: number,
  standardDeviation: number,
  relativeEffect: number,
): number | null {
  const delta = meanValue * relativeEffect
  if (!(meanValue > 0 && standardDeviation > 0) || delta === 0) return null
  return Math.ceil((2 * (Z_ALPHA + Z_BETA) ** 2 * standardDeviation ** 2) / delta ** 2)
}
