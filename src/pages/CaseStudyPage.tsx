import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PlanPickerMock } from '../casestudy/PlanPickerMock'
import { YesNoMark } from '../purchase/components/ui'
import { SampleSizeCalculator } from '../casestudy/SampleSizeCalculator'
import { COVERAGE_ROWS, PLAN_ORDER, PLANS, REGIONS, formatCzk } from '../pricing'

const SECTIONS = [
  { id: 'problem', title: 'Problém' },
  { id: 'varianty', title: 'Varianty a hypotézy' },
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
        {index + 2}. {SECTIONS[index].title}
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
      {/* 1. Úvod */}
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
                {index + 2}. {section.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* 2. Problém */}
      <Section id="problem">
        <p>
          Předpokládám, že si lidé cestovní pojištění kupují krátce před cestou. Pro většinu z nich
          je to povinnost navíc, ne nákup, na který se těší. Každý krok, kterému nerozumí, je důvod
          odejít.
        </p>
        <H3>Kde podle mě lidé odpadají</H3>
        <p>Jsou to moje hypotézy, ne fakta o trhu. Ověřit je má měření odpadu po krocích.</p>
        <Bullets>
          <li>
            <strong>Výběr balíčku.</strong> Limity v milionech korun se špatně srovnávají. Kdo
            nerozumí rozdílu, vezme nejlevnější balíček, nebo odejde. Proto jsou na kartách nahoře
            konkrétní přínosy a podrobné srovnání je rozbalovací.
          </li>
          <li>
            <strong>Cena, která překvapí na konci.</strong> Proto je cena vidět v liště od chvíle,
            kdy je vyplněná cesta.
          </li>
          <li>
            <strong>Údaje za všechny cestující.</strong> Na malé obrazovce je to nejdelší krok.
            Proto je až čtvrtý. Klient už ví, co kupuje a za kolik.
          </li>
          <li>
            <strong>Platba kartou na telefonu.</strong> Opisování čísla karty je pracné. Proto
            nabízím Apple Pay a Google Pay.
          </li>
        </Bullets>

        <H3>Obchodní cíl</H3>
        <p>
          Dnes se nejvíc prodává nejnižší tarif. Firma chce zvýšit AOV. Navrhl jsem proto tři
          balíčky. Doporučený je Komfort.
        </p>
        <p>
          Předpokládáme, že data smyšlené firmy ukazují růst segmentu manažerů. Podíl smluv, u
          kterých klient při škodě nahlásil elektroniku nad 30&nbsp;000&nbsp;Kč, vzrostl za rok z
          12&nbsp;% na 18&nbsp;%. Drahá pracovní elektronika je nejlepší dostupný signál, že jde o
          manažera. Proto jsem přidal limit na zavazadla a elektroniku. Je to pro manažery důvod
          zvolit vyšší balíček.
        </p>
        <p>
          Předpokládáme také, že 78&nbsp;% návštěv funnelu přichází z telefonu a vzniká na něm
          70&nbsp;% smluv. Konverze na telefonu je 9&nbsp;%, na desktopu 13,5&nbsp;%. Návrh proto
          začíná u mobilu.
        </p>

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
          Komfort je o 50&nbsp;% dražší než Základ, limity ale rostou několikanásobně. Prémium je o
          dalších 20&nbsp;% dražší. Vyšší balíček tak působí jako výhodná volba. Velký cenový skok
          by naopak držel lidi u Základu, a to je dnešní problém.
        </p>
      </Section>

      {/* 3. Varianty a hypotézy */}
      <Section id="varianty">
        <p>
          Obě varianty mají stejný postup v 6 krocích. Liší se jen v kroku 2, výběru balíčku.
          Komfort má v obou štítek „Doporučujeme“.
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
          Testuji celý způsob výběru balíčku, ne jeden prvek. Karty vedle sebe s jednou kartou
          uprostřed působí, jako by služba už byla vybraná. Předvolba Komfortu k tomuto zobrazení
          patří. Bez ní by klient viděl kartu uprostřed, ale nebyla by vybraná.
        </p>
        <p>
          Opřel jsem se o neformální rozhovory se 6 lidmi z mého okolí. Ukázal jsem jim obě verze a
          zeptal se, kterou by chtěli používat. 5 z 6 zvolilo verzi s předvybraným balíčkem. Vzorek
          je malý a nejde o reprezentativní výzkum. Rozhovory beru jako signál, že má smysl test
          spustit, ne jako důkaz.
        </p>
        <p>
          Cena za to je, že test neřekne, jestli rozdíl způsobilo zobrazení, nebo předvolba. Když B
          vyhraje, rozdělím to dalším testem, viz plán testů.
        </p>

        <H3>Hypotéza 1, ověřuje ji A/B test</H3>
        <Quote>
          Pokud budou balíčky vedle sebe a Komfort předvybraný, zvýší se průměrná hodnota objednávky
          (AOV), aniž by konverze z funnel_start na purchase_simulated relativně klesla o víc než
          5&nbsp;%, protože většina lidí výchozí volbu nemění a Komfort je dnes vybíraný méně, než
          odpovídá jeho přínosu.
        </Quote>

        <H3>Hypotéza 2, A/B test ji neověří</H3>
        <Quote>
          Pokud přidáme do balíčků přínosy pro manažery, vzroste podíl manažerů mezi klienty.
        </Quote>
        <p>
          Přínosy pro manažery dostanou obě varianty. A/B test proto nemá s čím srovnávat. Hypotézu
          2 ověřím srovnáním před spuštěním a po něm. Sleduji podíl smluv od manažerů a dlouhodobě
          podíl smluv se škodou na elektronice nad 30&nbsp;000&nbsp;Kč, dnes 18&nbsp;%.
        </p>
        <p>
          Srovnání před a po ovlivní sezóna a kampaně. Proto srovnávám se stejným obdobím loni.
          Silnější by byla malá kontrolní skupina bez přínosů pro manažery. U pojištění by to ale
          znamenalo prodávat dvě verze podmínek.
        </p>

        <H3>Jak poznám manažery</H3>
        <Bullets>
          <li>
            Návštěva přišla z kampaně na manažery. Odkaz má parametr{' '}
            <code className="rounded bg-slate-100 px-1">utm_audience=manazer</code>.
          </li>
          <li>Klient v prvním kroku odpověděl na otázku „Jedete pracovně?“ ano.</li>
        </Bullets>
        <p>
          Otázka je nepovinná, takže segment nikdy nebude úplný. Do měření posílám i zdroj segmentu,
          abych výsledky z kampaně a z otázky mohl porovnat zvlášť.
        </p>

        <H3>Proč segmenty určuji předem</H3>
        <p>
          Výsledek vyhodnotím pro všechny návštěvníky a zvlášť pro manažery a ostatní. Segmenty jsem
          určil před startem testu. Kdo je hledá až v datech, vždycky nějaký „vítězný“ najde. Je to
          ale náhoda, ne efekt.
        </p>
      </Section>

      {/* 4. Návrh experimentu */}
      <Section id="experiment">
        <H3>Primární metrika AOV</H3>
        <p>Hlavní obchodní cíl je zvýšit průměrnou hodnotu objednávky. Proto rozhoduje AOV.</p>

        <H3>Ochranné metriky</H3>
        <Bullets>
          <li>
            Konverze z <code className="rounded bg-slate-100 px-1">funnel_start</code> na{' '}
            <code className="rounded bg-slate-100 px-1">purchase_simulated</code> nesmí relativně
            klesnout o víc než 5&nbsp;%.
          </li>
          <li>Tržba na návštěvu nesmí klesnout.</li>
        </Bullets>
        <p>
          Bez těchto pojistek by AOV mohlo vyrůst jen proto, že nakoupí méně lidí, ale dražší
          balíčky. Firma by pak vydělala méně.
        </p>

        <H3>Proč hranice 5&nbsp;%</H3>
        <p>
          Předpokládáme, že data smyšlené firmy ukazují konverzi 10&nbsp;%, týdenní kolísání
          konverze zhruba 3&nbsp;% relativně a 20&nbsp;000 návštěv funnelu týdně. Podle simulace
          nového cenového modelu čekám růst AOV o 10&nbsp;%.
        </p>
        <Bullets>
          <li>
            <strong>Tržba nesmí klesnout.</strong> Při růstu AOV o 10&nbsp;% se tržba vyrovná při
            poklesu konverze o 9,1&nbsp;%. Hranice 5&nbsp;% nechává rezervu. I v nejhorším povoleném
            případě vzroste tržba na návštěvu o 4,5&nbsp;%.
          </li>
          <li>
            <strong>Hranice musí být nad běžným kolísáním.</strong> Konverze kolísá o 3&nbsp;% i bez
            změny. Hranice 2&nbsp;% by byla pod tímto šumem a test by končil falešnými poplachy.
          </li>
          <li>
            <strong>Test musí jít změřit v rozumné době.</strong> Pokles o 5&nbsp;% odhalím zhruba
            za 55&nbsp;000 návštěv na variantu, tedy za 6 týdnů. Pokles o 2&nbsp;% by potřeboval
            350&nbsp;000 návštěv na variantu, tedy 35 týdnů.
          </li>
        </Bullets>

        <H3>Sekundární metriky</H3>
        <Bullets>
          <li>Tržba celkem a počet zaplacených objednávek.</li>
          <li>Odpad po krocích. Kde odchází nejvíc lidí.</li>
          <li>Odpad při platbě, tedy rozdíl mezi výběrem způsobu platby a zaplacením.</li>
          <li>Čas do dokončení.</li>
          <li>Podíl jednotlivých balíčků.</li>
        </Bullets>

        <H3>Délka testu a kalkulačka vzorku</H3>
        <p>
          Délku testu určuje metrika, která potřebuje víc dat. Při výchozích hodnotách stačí na AOV
          asi 7&nbsp;500 návštěv na variantu. Ochranná konverze jich ale potřebuje 55&nbsp;000. Test
          proto poběží 6 týdnů. Zkuste si čísla změnit.
        </p>
        <SampleSizeCalculator />

        <H3>Kdy test ukončit a jak rozhodnout</H3>
        <Bullets>
          <li>
            Test ukončím, až obě varianty dosáhnou vypočteného vzorku. Vítěze v průběhu nevyhlašuji,
            i když jedna varianta zrovna vede.
          </li>
          <li>
            Dřív ho zastavím jen ve dvou případech. Konverze nebo tržba na návštěvu spadne pod
            ochrannou hranici. Nebo návštěvy nejsou rozdělené zhruba 50 na 50, což znamená chybu v
            přidělování.
          </li>
          <li>
            Varianta B vyhraje, když AOV vzroste statisticky významně a ochranné metriky drží. Pak
            ji nasadím všem a kód varianty A smažu.
          </li>
          <li>Když rozdíl není významný, nechám variantu A a připravím další test.</li>
        </Bullets>
        <p>
          Jak data vyhodnotím v praxi, popisuji v sekci 6. Podrobný postup s GA4, exportem do
          BigQuery a výpočtem významnosti je v README.
        </p>

        <H3>Plán testů</H3>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Test 1.</strong> Balíčky pod sebou bez předvolby proti balíčkům vedle sebe s
            předvybraným Komfortem. Nabídka vyššího balíčku je v obou zapnutá.
          </li>
          <li>
            <strong>Test 2.</strong> Když vyhraje B, karty vedle sebe s předvolbou proti kartám
            vedle sebe bez předvolby. Tím zjistím, kolik dělá samotná předvolba.
          </li>
          <li>
            <strong>Test 3.</strong> Na vítězné variantě nabídka vyššího balíčku zapnutá proti
            vypnuté. V prototypu ji vypnete parametrem{' '}
            <Link to="/sjednani?upsell=0" className="text-brand-700 underline underline-offset-4">
              ?upsell=0
            </Link>
            .
          </li>
          <li>
            <strong>Další kandidáti.</strong> Pořadí balíčků a postup s méně kroky, ten by byl test
            na konverzi.
          </li>
        </ol>
        <p>
          Obvykle v jednom testu měním jen jednu věc, jinak nepoznám, co výsledek způsobilo. Test 1
          je výjimka a důvod popisuji v sekci Varianty a hypotézy.
        </p>
      </Section>

      {/* 5. Měření */}
      <Section id="mereni">
        <p>
          Všechny eventy jdou přes jednu funkci{' '}
          <code className="rounded bg-slate-100 px-1">track(event, params)</code>. Ke každému přidá
          variantu, segment a jeho zdroj, účel cesty, oblast, počet cestujících, balíček a přesnou
          cenu. Cenu nezaokrouhluji, protože AOV je primární metrika.
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

        <H3>Co záměrně neměřím</H3>
        <p>
          Jména, e-maily, telefony, data narození ani jiný obsah formulářů. K rozhodnutí o testu je
          nepotřebuji a jejich sběr by byl zbytečné riziko. Měřicí vrstva má seznam povolených
          parametrů a všechno ostatní zahodí. U chyb ve formuláři posílám jen název pole, nikdy
          hodnotu. Automatický test projde celé sjednání s ukázkovými daty a ověří, že se do měření
          nic z nich nedostalo.
        </p>
        <p>
          Na nasazeném prototypu měřím i kliky, a to bez cookies. Prvky s osobními údaji jsou z
          měření kliků vyřazené. Data z vašeho prohlížeče uvidíte na stránce{' '}
          <Link to="/vysledky" className="text-brand-700 underline underline-offset-4">
            Měření
          </Link>
          .
        </p>
      </Section>

      {/* 6. Reálný provoz */}
      <Section id="realny-provoz">
        <p>
          A/B test v tomto projektu neprobíhá. S lidmi jsem mluvil jen neformálně, 6 rozhovorů v
          okolí popisuji v sekci 3. Takhle bych postupoval na skutečném provozu.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong>Plán testu.</strong> Před startem sepíšu hypotézu, metriky, segmenty, vzorek a
            délku testu.
          </li>
          <li>
            <strong>Google Analytics 4.</strong> Sbírá eventy z aplikace. Zaregistruji v něm vlastní
            dimenze varianta, segment, zdroj segmentu, účel cesty a balíček. Propojím ho s BigQuery.
          </li>
          <li>
            <strong>BigQuery.</strong> Uchovává každou objednávku zvlášť. Bez toho nejde spočítat
            významnost AOV, protože GA4 ukazuje jen průměry.
          </li>
          <li>
            <strong>Looker Studio (dříve Google Data Studio).</strong> Dashboard s konverzí a tržbou
            po variantách a týdnech a s rozdělením návštěv mezi varianty.
          </li>
          <li>
            <strong>Spuštění.</strong> Nejdřív krátce na malý podíl návštěv, abych ověřil měření.
            Pak 50 na 50.
          </li>
          <li>
            <strong>Týdenní kontrola.</strong> Jen rozdělení návštěv a ochranné metriky.
          </li>
          <li>
            <strong>Vyhodnocení.</strong> Po dosažení vzorku spočítám významnost v GrowthBooku nad
            daty z BigQuery a rozhodnu podle pravidel ze sekce 4.
          </li>
        </ol>
      </Section>

      {/* 7. AI */}
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

      {/* 8. 90 dní */}
      <Section id="plan-90-dni">
        <Placeholder>
          <p className="mt-2 text-slate-800">Napíšu sám.</p>
        </Placeholder>
      </Section>

      {/* 9. Omezení */}
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
