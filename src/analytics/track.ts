// Měřicí vrstva. Jedno rozhraní track(event, params) pro lokální úložiště i Google Analytics 4.
// Posílá jen parametry z whitelistu níže. Nikdy jména, e-maily, telefony, data narození
// ani jiný obsah formulářů.

export type EventName =
  | 'funnel_start'
  | 'step_view'
  | 'step_complete'
  | 'price_shown'
  | 'plan_selected'
  | 'addon_toggled'
  | 'luggage_warning_shown'
  | 'luggage_warning_choice'
  | 'upsell_shown'
  | 'upsell_accepted'
  | 'validation_error'
  | 'checkout_click'
  | 'payment_started'
  | 'purchase_simulated'

export interface TrackParams {
  variant?: 'a' | 'b'
  segment?: 'manager' | 'other'
  segment_source?: 'utm' | 'question' | 'override' | 'none'
  trip_purpose?: 'business' | 'leisure' | 'unknown'
  step_number?: number
  step_name?: string
  region?: string
  traveler_count?: number
  plan?: string
  /** Přesná cena v Kč. Cena pojištění není osobní údaj. */
  price?: number
  /** Název připojištění, ne jeho obsah. */
  addon?: string
  enabled?: boolean
  /** Název pole s chybou, nikdy jeho hodnota. */
  field?: string
  choice?: string
  payment_method?: string
}

const ALLOWED_PARAMS: (keyof TrackParams)[] = [
  'variant',
  'segment',
  'segment_source',
  'trip_purpose',
  'step_number',
  'step_name',
  'region',
  'traveler_count',
  'plan',
  'price',
  'addon',
  'enabled',
  'field',
  'choice',
  'payment_method',
]

export interface StoredEvent {
  name: EventName
  params: TrackParams
  /** Náhodné ID jednoho průchodu funnelem. Jen lokálně pro #/vysledky, do GA4 se neposílá. */
  run: string
  ts: number
}

const STORAGE_KEY = 'odjezd-events'
const MAX_STORED = 5000

/** Pustí jen povolené parametry. Pojistka proti tomu, aby se do měření dostala osobní data. */
export function sanitize(params: Record<string, unknown>): TrackParams {
  const clean: Record<string, unknown> = {}
  for (const key of ALLOWED_PARAMS) {
    const value = params[key]
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      clean[key] = value
    }
  }
  return clean as TrackParams
}

let currentRun = ''

function newRunId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function getStoredEvents(): StoredEvent[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as StoredEvent[]) : []
  } catch {
    return []
  }
}

export function clearStoredEvents() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Úložiště není dostupné, není co mazat.
  }
}

function storeLocally(event: StoredEvent) {
  try {
    const events = getStoredEvents()
    events.push(event)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_STORED)))
  } catch {
    // Bez úložiště se event jen nezapíše lokálně. GA4 ho dostane i tak.
  }
}

// ---------- Google Analytics 4 ----------

type Gtag = (...args: unknown[]) => void
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: Gtag
  }
}

const GA4_ID = import.meta.env.VITE_GA4_ID?.trim()
let ga4Loaded = false

/** Načte GA4 jen tehdy, když je nastavené VITE_GA4_ID. Bez něj se nic nenačítá. */
function ensureGa4(): Gtag | null {
  if (!GA4_ID || typeof document === 'undefined') return null
  if (!ga4Loaded) {
    ga4Loaded = true
    window.dataLayer = window.dataLayer ?? []
    window.gtag = function gtag() {
      // GA4 vyžaduje přímo objekt arguments.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    // Zobrazení stránek měříme vlastními eventy step_view, automatické page_view vypínáme.
    window.gtag('config', GA4_ID, { send_page_view: false })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`
    document.head.appendChild(script)
  }
  return window.gtag ?? null
}

function sendToGa4(name: EventName, params: TrackParams) {
  const gtag = ensureGa4()
  if (!gtag) return
  gtag('event', name, params)
  if (name === 'purchase_simulated' && params.price !== undefined) {
    // Doporučený e-commerce event. Díky němu GA4 ukáže AOV v přehledu Monetization.
    gtag('event', 'purchase', {
      transaction_id: `sim-${newRunId()}`,
      value: params.price,
      currency: 'CZK',
      items: params.plan ? [{ item_id: params.plan, item_name: params.plan }] : [],
      variant: params.variant,
      segment: params.segment,
    })
  }
}

/** Zaznamená event lokálně a případně ho pošle do GA4. */
export function track(name: EventName, params: Record<string, unknown> = {}) {
  if (name === 'funnel_start' || !currentRun) currentRun = newRunId()
  const clean = sanitize(params)
  storeLocally({ name, params: clean, run: currentRun, ts: Date.now() })
  sendToGa4(name, clean)
}
