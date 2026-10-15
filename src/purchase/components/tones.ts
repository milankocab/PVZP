/** Barevné kolečko s ikonou. Každá oblast krytí má vlastní barvu, aby se dala najít očima. */
export const TONES = {
  brand: 'bg-brand-100 text-brand-700',
  accent: 'bg-accent-100 text-accent-700',
  sky: 'bg-sky-100 text-sky-700',
  violet: 'bg-violet-100 text-violet-700',
  rose: 'bg-rose-100 text-rose-700',
  amber: 'bg-amber-100 text-amber-800',
  lime: 'bg-lime-100 text-lime-800',
  slate: 'bg-slate-100 text-slate-700',
} as const
export type Tone = keyof typeof TONES
