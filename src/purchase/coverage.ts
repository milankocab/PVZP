import {
  Bandage,
  Building2,
  Clock,
  FileText,
  Headset,
  Laptop,
  Luggage,
  Plane,
  Scale,
  Sparkles,
  Stethoscope,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { CANCELLATION, COVERAGE_ROWS, formatCzk, type CoverageRowId, type PlanId } from '../pricing'
import type { Tone } from './components/ui'

/** Ikona a barva pro každý řádek krytí. Stejná ikona znamená stejnou věc ve všech krocích. */
export const COVERAGE_ICONS: Record<CoverageRowId, { icon: LucideIcon; tone: Tone }> = {
  luggage: { icon: Luggage, tone: 'accent' },
  luggageIncluded: { icon: Users, tone: 'accent' },
  electronicsItem: { icon: Laptop, tone: 'violet' },
  electronicsSettlement: { icon: Sparkles, tone: 'amber' },
  companyElectronics: { icon: Building2, tone: 'slate' },
  medical: { icon: Stethoscope, tone: 'rose' },
  medicalAssistance: { icon: Headset, tone: 'sky' },
  extendedAssistance: { icon: FileText, tone: 'sky' },
  repatriation: { icon: Plane, tone: 'sky' },
  liability: { icon: Scale, tone: 'lime' },
  injury: { icon: Bandage, tone: 'rose' },
  cancellation: { icon: Ticket, tone: 'violet' },
  flightDelay: { icon: Clock, tone: 'amber' },
}

/**
 * Vysvětlení parametrů krytí. Ukazují se po kliknutí na parametr v detailu balíčku,
 * ve srovnání a v nabídce vyššího balíčku. Podmínky jsou smyšlené, jde o fiktivní produkt.
 */
export const COVERAGE_EXPLANATIONS: Record<CoverageRowId, string> = {
  luggage:
    'Nejvíc, kolik zaplatíme za jeden kufr a věci v něm, včetně elektroniky. Když vezete víc kufrů, limit platí pro každý zvlášť.',
  luggageIncluded:
    'Kolik kufrů je pojištěných v ceně. V Základu jeden na celou smlouvu, v Komfortu a Prémiu jeden pro každého cestujícího. Další kufr jde připojistit.',
  electronicsItem:
    'Nejvíc, kolik zaplatíme za jeden kus elektroniky, třeba notebook nebo telefon. Počítá se do limitu kufru. Třeba v Komfortu je limit kufru 50 000 Kč. Za ukradený notebook za 60 000 Kč dostanete nejvýš 40 000 Kč a zbytek limitu zůstává pro ostatní věci. V Základu zvláštní limit na kus není, platí jen limit kufru.',
  electronicsSettlement:
    'Časová cena znamená, že od ceny věci odečteme opotřebení podle stáří. Za tři roky starý telefon tak dostanete méně, než stál. Nová cena znamená, že dostanete, kolik stojí stejná nová věc. V Prémiu platí nová cena pro věci mladší 2 let.',
  companyElectronics:
    'Kryje i notebook nebo telefon, který patří vaší firmě a vy ho používáte. Vlastnictví se dokládá až při škodě fakturou na firmu. Peníze dostane firma jako majitel věci.',
  medical:
    'Nejvíc, kolik zaplatíme za ošetření, pobyt v nemocnici a léky v zahraničí. V zemích s drahou péčí, třeba v USA, se vyšší limit vyplatí.',
  medicalAssistance:
    'Telefonní linka ve dne i v noci. Pomůže najít lékaře nebo nemocnici a domluví s nimi platbu.',
  extendedAssistance:
    'Pomoc, když v zahraničí ztratíte pas nebo občanku. K tomu právní pomoc, třeba po dopravní nehodě.',
  repatriation:
    'Když se po úrazu nebo nemoci nemůžete vrátit domů běžnou cestou, zaplatíme převoz do České republiky.',
  liability:
    'Když v zahraničí nechtěně zraníte člověka nebo poškodíte cizí věc, škodu zaplatíme až do limitu.',
  injury: 'Jednorázová částka, když vám po úrazu na cestě zůstanou trvalé následky.',
  cancellation: `Vrátí část storno poplatku, když cestu musíte zrušit. V Základu a Komfortu jde připojistit do ${CANCELLATION.purchaseWindowDays} dní od koupě zájezdu. V Prémiu je v ceně do ${formatCzk(CANCELLATION.includedLimitPerPerson)} na osobu a lhůta od koupě neplatí.`,
  flightDelay:
    'Když se let zpozdí o víc než 6 hodin, dostanete pevnou částku na jídlo nebo ubytování.',
}

// Pořadí, ve kterém nabídka vyššího balíčku ukazuje rozdíly. Nahoře je to, co nejvíc zajímá
// manažery s drahou elektronikou, tedy hlavní cílový segment.
const UPGRADE_PRIORITY: CoverageRowId[] = [
  'luggage',
  'electronicsSettlement',
  'companyElectronics',
  'cancellation',
  'electronicsItem',
  'luggageIncluded',
  'medical',
  'extendedAssistance',
  'flightDelay',
  'liability',
  'injury',
]

export interface CoverageDiff {
  id: CoverageRowId
  label: string
  from: string | boolean
  to: string | boolean
}

/** Co vyšší balíček přidá oproti nižšímu. Seřazené podle důležitosti pro klienta. */
export function upgradeDiffs(from: PlanId, to: PlanId): CoverageDiff[] {
  return UPGRADE_PRIORITY.flatMap((id) => {
    const row = COVERAGE_ROWS.find((item) => item.id === id)
    if (!row || row.values[from] === row.values[to] || row.values[to] === false) return []
    return [{ id, label: row.label, from: row.values[from], to: row.values[to] }]
  })
}
