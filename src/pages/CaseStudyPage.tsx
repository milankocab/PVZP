import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PlanPickerMock } from '../casestudy/PlanPickerMock'
import { YesNoMark } from '../purchase/components/ui'
import { SampleSizeCalculator } from '../casestudy/SampleSizeCalculator'
import { COVERAGE_ROWS, PLAN_ORDER, PLANS, REGIONS, formatCzk } from '../pricing'

const SECTIONS = [
  { id: 'cil', title: 'Cíl' },
  { id: 'manazer', title: 'Jak poznám manažera' },
  { id: 'balicky', title: 'Balíčky a ceny' },
  { id: 'hypotezy', title: 'Hypotézy' },
  { id: 'varianty', title: 'Varianty A a B' },
  { id: 'experiment', title: 'Návrh experimentu' },
  { id: 'mereni', title: 'Měření' },
  { id: 'realny-provoz', title: 'Jak bych test provedl v reálném provozu' },
  { id: 'ai', title: 'Jak jsem pracoval s AI' },
  { id: 'plan-90-dni', title: 'Plán prvních 90 dní' },
  { id: 'omezeni', title: 'Omezení prototypu' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

// HashRouter používá # pro stránky, proto kotvy řeším posunem místo odkazu #id.
function goToSection(id: SectionId) {
  const heading = document.getElementById(`${id}-nadpis`)
  heading?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  heading?.focus({ preventScroll: true })
}

function Section({ id, children }: { id: SectionId; children: ReactNode }) {
  const index = SECTIONS.findIndex((section) => section.id === id)
  return (
    <section aria-labelledby={`${id}-nadpis`} className="mt-12 scroll-mt-4">
      <h2
        id={`${id}-nadpis`}
        tabIndex={-1}
        className="scroll-mt-4 text-2xl font-bold text-slate-900"
      >
        {index + 1}. {SECTIONS[index].title}
      </h2>
      <div className="mt-4 space-y-4 text-slate-800">{children}</div>
    </section>
  )
}

function H3({ children }: { children: ReactNode }) {
  return <h3 className="pt-2 text-lg font-bold text-slate-900">{children}</h3>
}

function Bullets({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="rounded-r-lg border-l-4 border-brand-700 bg-brand-50 p-4 text-slate-900">
      {children}
    </blockquote>
  )
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-400 bg-slate-50 p-4">
      <p className="font-mono text-sm font-bold text-slate-700">TODO(Milan)</p>
      {children}
    </div>
  )
}

function CoverageCell({ value }: { value: string | boolean }) {
  if (value === true) return <YesNoMark yes />
  if (value === false) return <YesNoMark yes={false} />
  return <>{value}</>
}

const EVENTS: [string, string][] = [
  ['funnel_start', 'Návštěvník otevřel sjednání.'],
  ['step_view', 'Zobrazil se krok. Posílá číslo a název kroku.'],
  ['step_complete', 'Krok prošel kontrolou a návštěvník pokračuje.'],
  ['price_shown', 'Poprvé se ukázala cena.'],
  ['plan_selected', 'Návštěvník zvolil balíček.'],
  ['addon_toggled', 'Zapnul nebo vypnul připojištění.'],
  ['luggage_warning_shown', 'Ukázalo se upozornění, že má méně kufrů než cestujících.'],
  ['luggage_warning_choice', 'Co v upozornění zvolil. Kufr navíc, Komfort, nebo nic.'],
  [
    'upsell_shown',
    'Ukázala se nabídka vyššího balíčku (test 3). Event nese i krok, kde se ukázala.',
  ],
  ['upsell_accepted', 'Návštěvník nabídku přijal.'],
  ['validation_error', 'Chyba ve formuláři. Posílá jen název pole, nikdy hodnotu.'],
  ['checkout_click', 'Přechod ze shrnutí k platbě.'],
  ['payment_started', 'Návštěvník vybral způsob platby.'],
  ['purchase_simulated', 'Kliknul na „Zaplatit (simulace)“. Posílá přesnou cenu.'],
]

export function CaseStudyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Úvod */}
      <header>
        <p className="font-semibold text-brand-700">Case study · testování</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
          Online sjednání cestovního pojištění s A/B testem výběru balíčku
        </h1>
        <div className="mt-4 space-y-3 text-lg text-slate-800">
          <p>
            Tohle je case study zaměřená na testování. Navrhl jsem online sjednání cestovního
            pojištění pro smyšlenou pojišťovnu Odjezd a k němu A/B test kroku s výběrem balíčku.
            Cílem je zjistit, která verze má nejlepší dopad na průměrnou hodnotu objednávky (AOV),
            tržby a konverzi.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/sjednani?v=a"
            className="flex min-h-12 items-center justify-center rounded-lg bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800"
          >
            Vyzkoušet variantu A
          </Link>
          <Link
            to="/sjednani?v=b"
            className="flex min-h-12 items-center justify-center rounded-lg border-2 border-brand-700 px-5 font-semibold text-brand-700 hover:bg-brand-50"
          >
            Vyzkoušet variantu B
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-700">
          A/B test v projektu neprobíhá. Ukazuji prototyp, hypotézy a plán testu. Variantu B jsem
          předem probral v neformálních rozhovorech se 6 lidmi z okolí. Všechna čísla o firmě jsou
          předpoklady o smyšlené firmě.
        </p>
      </header>

      <nav aria-label="Obsah case study" className="mt-10 rounded-xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">Obsah</p>
        <ol className="mt-2 grid gap-x-4 sm:grid-cols-2">
          {SECTIONS.map((section, index) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => goToSection(section.id)}
                className="min-h-11 text-left text-brand-700 underline underline-offset-4"
              >
                {index + 1}. {section.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* 1. Cíl */}
      <Section id="cil">
        <p>
          Firma chce dvě věci. Zvýšit průměrnou hodnotu objednávky (AOV) a získat víc manažerů. Dnes
          se nejvíc prodává nejlevnější balíček. Manažerů mezi klienty přibývá a firma chce, aby
          jich bylo ještě víc.
        </p>
        <p>
          Předpokládám, že 78&nbsp;% návštěv funnelu přichází z telefonu a vzniká na něm 70&nbsp;%
          smluv. Konverze na telefonu je 9&nbsp;%, na desktopu 13,5&nbsp;%. Návrh proto začíná u
          mobilu.
        </p>
      </Section>

      {/* 2. Manažer */}
      <Section id="manazer">
        <p>Manažera poznám podle dvou signálů.</p>
        <Bullets>
          <li>Klient v prvním kroku odpoví na otázku „Jedete pracovně?“ ano.</li>
          <li>
            Návštěva přišla z kampaně na manažery, třeba z LinkedInu. Odkaz má UTM parametr{' '}
            <code className="rounded bg-slate-100 px-1">utm_audience=manazer</code>.
          </li>
        </Bullets>
        <p>
          U takhle rozpoznaných manažerů vidím vyšší hodnotu nahlášené elektroniky. Proto mají vyšší
          balíčky vyšší limit na elektroniku a kufr pro každého cestujícího.
        </p>
        <p>
          Otázka je nepovinná, segment proto nebude úplný. Do měření posílám i zdroj segmentu.
          Výsledky z kampaně a z otázky tak porovnám zvlášť. Segmenty určuji před startem testu. Kdo
          je hledá až v datech, nějaký „vítězný“ najde vždycky. Je to ale náhoda, ne efekt.
        </p>
      </Section>

      {/* 3. Balíčky */}
      <Section id="balicky">
        <p>Navrhl jsem tři balíčky. Doporučený je Komfort.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="pb-2 text-left font-semibold text-slate-900">
              Balíčky. Ceny i podmínky jsou smyšlené.
            </caption>
            <thead>
              <tr className="border-b border-slate-300">
                <th scope="col" className="py-2 pr-2">
                  Parametr
                </th>
                {PLAN_ORDER.map((id) => (
                  <th key={id} scope="col" className="py-2 pr-2">
                    {PLANS[id].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <th scope="row" className="py-2 pr-2 font-medium">
                  Cena za den, dospělý, Evropa
                </th>
                {PLAN_ORDER.map((id) => (
                  <td key={id} className="py-2 pr-2 tabular-nums">
                    {formatCzk(Math.round(REGIONS.europe.dailyRate * PLANS[id].multiplier))}
                  </td>
                ))}
              </tr>
              {COVERAGE_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-slate-200">
                  <th scope="row" className="py-2 pr-2 font-medium">
                    {row.label}
                  </th>
                  {PLAN_ORDER.map((id) => (
                    <td key={id} className="py-2 pr-2">
                      <CoverageCell value={row.values[id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Základ je pro lidi, kteří hledají nejnižší cenu. Má jeden kufr na celou smlouvu. Kdo chce
          kufr pro každého cestujícího, zaplatí v Základu 80 až 90&nbsp;% ceny Komfortu. Rozdíl je
          malý, a tak se mu víc vyplatí Komfort.
        </p>
        <p>
          Komfort je o 50&nbsp;% dražší než Základ. Prémium je o dalších 20&nbsp;% dražší než
          Komfort. Limity přitom rostou několikanásobně. Základ tak zůstává levný a vyšší balíčky
          působí jako výhodná volba.
        </p>
      </Section>

      {/* 4. Hypotézy */}
      <Section id="hypotezy">
        <H3>Hypotéza 1, ověří ji A/B test</H3>
        <Quote>
          Pokud klient uvidí doporučený Komfort jako výchozí volbu, vzroste AOV. Konverze přitom
          relativně neklesne o víc než 5&nbsp;%. Většina lidí výchozí volbu nemění.
        </Quote>

        <H3>Hypotéza 2, A/B test ji neověří</H3>
        <Quote>Pokud mají balíčky přínosy pro manažery, vzroste podíl manažerů mezi klienty.</Quote>
        <p>
          Přínosy pro manažery mají obě varianty, A/B test proto nemá s čím srovnávat. Podíl smluv
          od manažerů porovnám se stejným obdobím loni. Tím odfiltruji vliv sezóny.
        </p>
      </Section>

      {/* 5. Varianty */}
      <Section id="varianty">
        <p>
          Hypotézu 1 ověřuji na kroku 2, výběru balíčku. Ostatních 5 kroků je v obou variantách
          stejných. Komfort má v obou štítek „Doporučujeme“.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <figure className="rounded-xl bg-slate-50 p-4">
            <figcaption className="mb-4">
              <strong className="text-slate-900">Varianta A.</strong> Balíčky jsou pod sebou. Žádný
              není předvybraný. Klient musí aktivně zvolit.
            </figcaption>
            <PlanPickerMock layout="stacked" selected={null} />
          </figure>
          <figure className="rounded-xl bg-slate-50 p-4">
            <figcaption className="mb-4">
              <strong className="text-slate-900">Varianta B.</strong> Balíčky jsou vedle sebe a
              posouvají se prstem. Komfort je předvybraný. Klient ho může změnit.
            </figcaption>
            <PlanPickerMock layout="carousel" selected="comfort" />
          </figure>
        </div>
        <p className="text-sm text-slate-700">
          Zjednodušený náhled. Ceny pro 1 dospělého, Evropa, 7 dní.
        </p>

        <H3>Proč měním dvě věci najednou</H3>
        <p>
          Karta uprostřed posuvníku působí, jako by byla už vybraná. Předvolba Komfortu k tomuto
          zobrazení patří. Test proto neřekne, jestli rozdíl způsobilo zobrazení, nebo předvolba.
          Když B vyhraje, rozdělím to testem 2.
        </p>
        <p>
          Obě verze jsem ukázal 6 lidem z okolí. 5 z nich zvolilo verzi s předvybraným balíčkem.
          Není to výzkum, jen signál, že má test smysl.
        </p>
      </Section>

      {/* 6. Návrh experimentu */}
      <Section id="experiment">
        <H3>Metriky</H3>
        <Bullets>
          <li>
            <strong>Primární je AOV.</strong> Je to hlavní obchodní cíl.
          </li>
          <li>
            <strong>Ochranné.</strong> Konverze z{' '}
            <code className="rounded bg-slate-100 px-1">funnel_start</code> na{' '}
            <code className="rounded bg-slate-100 px-1">purchase_simulated</code> nesmí relativně
            klesnout o víc než 5&nbsp;%. Tržba na návštěvu nesmí klesnout. Bez nich by AOV mohlo
            vyrůst jen proto, že nakoupí méně lidí.
          </li>
          <li>
            <strong>Sekundární.</strong> Odpad po krocích, odpad při platbě, podíl balíčků a čas do
            dokončení.
          </li>
        </Bullets>

        <H3>Proč hranice 5&nbsp;%</H3>
        <p>
          Předpokládám konverzi 10&nbsp;%, týdenní kolísání konverze 3&nbsp;% relativně a
          20&nbsp;000 návštěv funnelu týdně. Čekám růst AOV o 10&nbsp;%. Tržba by se pak vyrovnala
          až při poklesu konverze o 9,1&nbsp;%. Hranice 5&nbsp;% nechává rezervu a je nad běžným
          kolísáním. Pokles o 5&nbsp;% odhalím za 6 týdnů. Pokles o 2&nbsp;% by trval 35 týdnů.
        </p>

        <H3>Délka testu a kalkulačka vzorku</H3>
        <p>
          Délku určuje metrika, která potřebuje víc dat. Na AOV stačí asi 7&nbsp;500 návštěv na
          variantu. Ochranná konverze jich potřebuje 55&nbsp;000. Test proto poběží 6 týdnů. Zkuste
          si čísla změnit.
        </p>
        <SampleSizeCalculator />

        <H3>Jak rozhodnu</H3>
        <Bullets>
          <li>
            Test běží, dokud obě varianty nemají vypočtený vzorek. Vítěze v průběhu nevyhlašuji.
          </li>
          <li>
            Dřív ho zastavím, jen když metrika spadne pod ochrannou hranici, nebo návštěvy nejsou
            rozdělené zhruba 50 na 50.
          </li>
          <li>
            B vyhraje, když AOV vzroste statisticky významně a ochranné metriky drží. Jinak zůstává
            A.
          </li>
        </Bullets>

        <H3>Plán testů</H3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Test 1.</strong> Varianta A proti variantě B.
          </li>
          <li>
            <strong>Test 2.</strong> Když vyhraje B, karty vedle sebe s předvolbou proti kartám
            vedle sebe bez předvolby. Zjistím, kolik dělá samotná předvolba.
          </li>
          <li>
            <strong>Test 3.</strong> Nabídka vyššího balíčku v dalších krocích. Obě varianty ji teď
            mají zapnutou. V testu 3 ji porovnám proti vypnuté. V prototypu ji vypnete parametrem{' '}
            <Link to="/sjednani?upsell=0" className="text-brand-700 underline underline-offset-4">
              ?upsell=0
            </Link>
            .
          </li>
        </ol>
      </Section>

      {/* 7. Měření */}
      <Section id="mereni">
        <p>
          Všechny eventy jdou přes jednu funkci{' '}
          <code className="rounded bg-slate-100 px-1">track(event, params)</code>. Ke každému přidá
          variantu, segment a jeho zdroj, balíček a přesnou cenu.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="pb-2 text-left font-semibold text-slate-900">
              Eventy funnelu
            </caption>
            <thead>
              <tr className="border-b border-slate-300">
                <th scope="col" className="py-2 pr-2">
                  Event
                </th>
                <th scope="col" className="py-2">
                  Kdy se pošle
                </th>
              </tr>
            </thead>
            <tbody>
              {EVENTS.map(([name, description]) => (
                <tr key={name} className="border-b border-slate-200 align-top">
                  <th scope="row" className="py-2 pr-2 font-mono text-xs font-medium break-all">
                    {name}
                  </th>
                  <td className="py-2">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Osobní údaje neměřím. Měřicí vrstva pustí jen povolené parametry. U chyb ve formuláři
          posílám jen název pole. Automatický test ověřuje, že se do měření nic osobního nedostane.
          Kliky měřím bez cookies. Data z vašeho prohlížeče uvidíte na stránce{' '}
          <Link to="/vysledky" className="text-brand-700 underline underline-offset-4">
            Měření
          </Link>
          .
        </p>
      </Section>

      {/* 8. Reálný provoz */}
      <Section id="realny-provoz">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Plán testu.</strong> Před startem sepíšu hypotézu, metriky, segmenty, vzorek a
            délku.
          </li>
          <li>
            <strong>Google Analytics 4.</strong> Sbírá eventy. Variantu, segment a balíček v něm
            nastavím jako vlastní dimenze.
          </li>
          <li>
            <strong>BigQuery.</strong> Uchovává každou objednávku zvlášť. Bez toho nejde spočítat
            významnost AOV.
          </li>
          <li>
            <strong>Looker Studio.</strong> Dashboard s konverzí, tržbou a rozdělením návštěv po
            týdnech.
          </li>
          <li>
            <strong>Spuštění.</strong> Nejdřív na malý podíl návštěv, abych ověřil měření. Pak 50 na
            50.
          </li>
          <li>
            <strong>Vyhodnocení.</strong> Po dosažení vzorku spočítám významnost v GrowthBooku a
            rozhodnu podle pravidel z návrhu experimentu.
          </li>
        </ol>
      </Section>

      {/* 9. AI */}
      <Section id="ai">
        <Placeholder>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-800">
            <li>Co jsem zadal.</li>
            <li>Jak jsem použil CLAUDE.md a skill na kontrolu textů.</li>
            <li>Co AI udělala špatně a jak jsem to poznal.</li>
            <li>Co jsem rozhodl sám.</li>
          </ul>
        </Placeholder>
      </Section>

      {/* 10. 90 dní */}
      <Section id="plan-90-dni">
        <Placeholder>
          <p className="mt-2 text-slate-800">Napíšu sám.</p>
        </Placeholder>
      </Section>

      {/* 11. Omezení */}
      <Section id="omezeni">
        <Bullets>
          <li>Ceny, limity a podmínky jsou smyšlené. Firma i její data jsou smyšlené.</li>
          <li>Prototyp nemá backend. Formulářová data se nikam neodesílají.</li>
          <li>Platba je jen simulace. Žádná smlouva nevzniká.</li>
          <li>Měření na stránce Měření je jen z vašeho prohlížeče. Neukazuje výsledky testu.</li>
          <li>
            A/B test neproběhl. Rozhovory se 6 lidmi z okolí nejsou reprezentativní. Hypotézy a
            čísla v plánu nejsou ověřené na skutečných zákaznících.
          </li>
        </Bullets>
      </Section>
    </article>
  )
}
