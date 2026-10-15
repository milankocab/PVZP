# Zadání pro Claude Code: prototyp online sjednání cestovního pojištění + case study

## Kontext (pro tebe, Claude Code)

Jsem Milan, Product Owner. Hlásím se na pozici Product Owner pro online sjednání pojištění v pojišťovně, která staví novou digitální jednotku. První produkt je online sjednání cestovního pojištění. Firma chce PO, který:
- vlastní konverzní funnel a rozhoduje podle dat a experimentů,
- rozumí vývoji webových aplikací,
- sám si s AI postaví funkční prototyp a pozná „AI slop“,
- převezme řešení od externího dodavatele a postaví malý interní tým.

Cílem tohoto repozitáře je **funkční prototyp sjednání cestovního pojištění s A/B testem předvybraného balíčku** s měřením funnelu a **case study stránka**, která vysvětluje moje produktová rozhodnutí. Odkaz na case study dám do CV.

## Obchodní kontext a cíl cenového modelu

- Dnes se nejvíc prodává nejnižší tarif.
- Firma chce zvýšit AOV (průměrnou hodnotu objednávky).
- Proto nastavujeme nový cenový model se třemi balíčky Základ, Komfort a Prémium. Doporučený je Komfort. A/B test ověřuje, jestli má smysl ho předvybrat.
- Hlavní cílový segment jsou manažeři. Podle (hypotetických) interních dat tento segment roste. Podíl smluv, u kterých klient při škodě nahlásil elektroniku nad 30 000 Kč, vzrostl za rok z 12 % na 18 %. Drahá pracovní elektronika je nejlepší dostupný signál, že jde o manažera.
- Nový typ limitu je limit na zavazadla a elektroniku. Manažeři cestují s drahou technikou a limit je pro ně důvod zvolit vyšší balíček.

| Parametr | Základ | Komfort | Prémium |
| --- | --- | --- | --- |
| Léčebné výlohy | 5 mil. Kč | 25 mil. Kč | 250 mil. Kč |
| Odpovědnost za škodu | 3 mil. Kč | 10 mil. Kč | 25 mil. Kč |
| Limit zavazadel a elektroniky (na jeden kufr) | 15 000 Kč | 50 000 Kč | 80 000 Kč |
| Kufry v ceně | 1 na smlouvu | 1 na osobu | 1 na osobu |
| Další kufr (připojištění, za den) | polovina denní ceny dospělého, nejvýše do 90 % ceny Komfortu | polovina denní ceny dospělého | polovina denní ceny dospělého |
| Limit na jeden kus elektroniky | do limitu kufru | 40 000 Kč | 40 000 Kč |
| Firemní elektronika | ne | ne | ano, vlastnictví se dokládá až při škodě |
| Cena za den, dospělý, Evropa | 38 Kč | 57 Kč (+50 %) | 68 Kč (+20 %) |
| Plnění za elektroniku | časová cena (odpočet stáří) | časová cena (odpočet stáří) | nová cena pro věci do 2 let stáří |
| Asistence | lékařská nonstop | lékařská a rozšířená (ztráta dokladů, právní pomoc) | lékařská a rozšířená |
| Výhody navíc | žádné | odpovědnost, úraz | storno v ceně bez lhůty od koupě, zpoždění letu, vyšší odpovědnost |

#### Jak jsem nastavil ceny

- **Řád ceny podle trhu.** Srovnatelné cestovní pojištění stojí v Evropě desítky korun za den. Ověřil jsem to na veřejných kalkulačkách v říjnu 2026. Naše balíčky stojí na 2 dny v Evropě pro jednoho dospělého 76, 114 a 137 Kč.
- **Cenový skok menší než skok v hodnotě.** Komfort je o 50 % dražší než Základ, ale limity rostou několikanásobně. Prémium je o dalších 20 % dražší. Vyšší balíček tak působí jako výhodná volba. Velký cenový skok by naopak držel lidi u Základu, a to je dnešní problém.
- **Oblasti jsou dvě, Evropa a Svět.** Svět zahrnuje všechny státy včetně USA a Kanady a stojí 70 Kč za den v Základu (1,84× Evropa). Třetí oblast „Svět bez USA a Kanady“ by dala přesnější cenu, ale klient by na mobilu řešil další rozhodnutí a rozdíl mezi dvěma „světy“ je matoucí. Předpokládám, že sazba vychází z dat smyšlené firmy o škodách mimo Evropu. Jako další krok navrhuji, aby klient zadal cílovou zemi a oblast se určila sama.
- **Příplatky.** Zimní sporty 20 Kč na osobu a den. Kufr navíc polovinu denní ceny dospělého v balíčku za každý den. Storno 3,5 % z ceny zájezdu, nejméně 190 Kč.
- **Slevy** se počítají jen ze základního pojistného a řetězí se. Rodinná sleva 15 %, sleva pro pojištěnce VZP 20 % a pro členy Klubu pevného zdraví dalších 10 %.

#### Proč sublimit 40 000 Kč na kus

Pracuji s hypotetickou situací. Firma je smyšlená, ale má historická data o škodách. Z dat vychází, že **80 % nahlášené elektroniky u manažerů má hodnotu do 40 000 Kč** (80. percentil). Podle tohoto čísla jsem sublimit nastavil.

Proč percentil, a ne průměr nebo medián:
- **Průměr** zkreslí pár drahých kusů. Jeden profesionální fotoaparát za 150 000 Kč zvedne průměr, i když ho skoro nikdo nevozí. Průměr navíc neříká, kolik klientů limit pokryje.
- **Medián** je odolný vůči extrémům, ale limit na mediánu znamená, že polovina hlášení nebude zaplacená celá. U balíčků, které mají přesvědčit manažery, by to bylo málo.
- **Percentil** odpovídá přesně na otázku, kterou rozhoduji. Jaký podíl klientů chci pojistit celý? Při 80. percentilu dostanou 4 z 5 klientů plnou náhradu.

Proč 80 %, a ne 70 % nebo 90 %:
- Při 70 % by plnou náhradu nedostal každý třetí klient. To je na balíček pro manažery málo.
- Ceny elektroniky mají dlouhý konec. Posun z 80 % na 90 % by vyžadoval výrazně vyšší limit kvůli malému počtu drahých kusů. Právě u nich je zároveň nejvyšší riziko podvodu.
- 80 % je tedy kompromis mezi spokojeností klientů a rizikem pojišťovny. Je to obchodní rozhodnutí, ne pravidlo trhu. Po spuštění ho ověřím na skutečných škodách.

Sublimit platí v Komfortu i Prémiu. Prémium se liší vyšším limitem na kufr (víc kusů v jednom kufru), novou cenou u věcí do 2 let a krytím firemní elektroniky.

#### Firemní elektronika v Prémiu

Při sjednání se na firmu neptám, protože by to nikdo nevyplňoval. Krytí v Prémiu zahrnuje i elektroniku, kterou klient používá a patří jeho firmě. Vlastnictví se dokládá až při hlášení škody fakturou na firmu a plnění dostane majitel věci. Při krádeži je nutný protokol od policie. Jedno zařízení nejde proplatit dvakrát, hlídá se podle sériového čísla nebo IMEI. Spoluúčast nezavádím, protože na trhu není jednotným standardem. Pojištění věci, kterou pojištěný nevlastní, a souběh s pojištěním majetku firmy je před spuštěním nutné potvrdit s legal týmem.

Základ s jedním kufrem na smlouvu je levná vstupní varianta, například pro krátkou cestu s jedním kufrem. Když cestuje víc lidí s jedním kufrem, aplikace je upozorní, že limit platí na kufr, a nabídne další kufr nebo vyšší balíček.

Základ s kufrem pro každého je vždy levnější než Komfort, ale ne o moc. Vychází na 80 až 90 % ceny Komfortu. Kufr navíc v Základu proto stojí polovinu denní ceny dospělého za každý den cesty a doplatek nikdy nepřekročí 90 % ceny Komfortu. Pevná cena by nefungovala, protože cena balíčků roste s délkou cesty a oblastí. U krátké cesty by kufr navíc vyšel dráž než celé pojištění, u dlouhé by byl rozdíl příliš velký.

### Platba na mobilu

Ve variantách nabízím Apple Pay a Google Pay (v prototypu jen simulace). Při 70 % sjednání na mobilu odpadá ruční vyplňování platební karty, což je na telefonu jeden z nejpracnějších kroků.

### Další fáze mimo tento prototyp

- **B2B.** Nákup na firmu (IČO, faktura), firemní a roční pojištění pro často cestující manažery. Tento prototyp řeší jen B2C. B2B je další fáze, protože dál rozvíjí segment manažerů.

### Mobil na prvním místě

Předpokládám, že data smyšlené firmy za posledních 12 měsíců ukazují:
- 78 % návštěv funnelu přichází z telefonu,
- konverze na telefonu je 9 %, na desktopu 13,5 %, celkem 10 %,
- na telefonu tak vzniká 70 % nových smluv.

Telefon je tedy největší kanál a zároveň má o třetinu horší konverzi než desktop. Každý procentní bod konverze na telefonu má proto největší dopad na tržby. Kdyby se konverze na telefonu zvedla jen na polovinu rozdílu (z 9 % na 11,25 %), celková konverze vzroste z 10 % na 11,8 %.

Návrh proto začíná u mobilu a desktop se přizpůsobuje mobilnímu zobrazení, ne naopak. Každou obrazovku navrhuji a kontroluji nejdřív v šířce 375 px.

### Proč ochranná hranice konverze 5 %

Pracuji s hypotetickými historickými daty smyšlené firmy:
- konverze z `funnel_start` na zaplacení je 10 %,
- konverze běžně kolísá z týdne na týden zhruba o 3 % relativně,
- funnel má 20 000 návštěv týdně, tedy 10 000 na variantu,
- podle simulace nového cenového modelu očekávám růst AOV o 10 %.

Hranici jsem odvodil ze tří čísel:
1. **Tržba nesmí klesnout.** Tržba na návštěvu je konverze krát AOV. Při růstu AOV o 10 % se tržba vyrovná při poklesu konverze o 9,1 % (1 − 1/1,10). Hranice 5 % nechává rezervu. Tržba na návštěvu i v nejhorším povoleném případě vzroste o 4,5 % (1,10 × 0,95).
2. **Hranice musí být nad běžným kolísáním.** Konverze kolísá o 3 % i bez jakékoli změny. Hranice 2 % by byla pod tímto šumem a test by končil falešnými poplachy.
3. **Test musí jít změřit v rozumné době.** Pro odhalení poklesu z 10 % o 5 % relativně (na 9,5 %) je potřeba asi 56 000 návštěv na variantu, tedy necelých 6 týdnů. Pro pokles o 2 % (na 9,8 %) by to bylo asi 353 000 návštěv na variantu, tedy přes 35 týdnů. To je nereálné.

Výpočet vzorku: hladina významnosti 5 %, síla 80 %, n = (1,96 + 0,84)² × 2 × p × (1 − p) / δ², kde p = 0,10 a δ je absolutní rozdíl konverze.

Data, která by hranici potvrdila na skutečném provozu: historická týdenní konverze funnelu (úroveň a kolísání), týdenní počet návštěv, rozložení cen objednávek (průměr a směrodatná odchylka pro AOV), očekávaná změna podílu balíčků a náklady na získání jednoho návštěvníka.

## Tvrdá pravidla (dodržuj vždy)

1. **Fiktivní značka.** Produkt se jmenuje **„Odjezd“** (fiktivní pojišťovna). Nepoužívej název, logo, barvy, texty ani ceny žádné skutečné pojišťovny. Na každé stránce bude v patičce: „Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i podmínky jsou smyšlené.“
2. **Žádná reálná platba ani sběr osobních údajů.** Krok „Platba“ je jen simulace (tlačítko „Zaplatit (simulace)“). Formulářová data se nikam neodesílají a **nikdy se neposílají do analytiky**. Předvyplň je smyšlenými hodnotami tlačítkem „Vyplnit ukázková data“.
3. **Git.** Nedělej `git commit` ani `git push`. Commituji a pushuji sám. Na konci každé fáze mi napiš navržený commit message.
4. **Pracuj po fázích.** Po každé fázi se zastav, shrň co jsi udělal, co jsi předpokládal a co mám zkontrolovat. Pokračuj až po mém „OK“.
5. **Když si nejsi jistý faktem o pojišťovnictví, napiš to** a označ místo `TODO(Milan): ověřit`. Nevymýšlej si regulaci ani statistiky trhu.
6. **Styl českých textů** (UI i case study): první osoba („Navrhl jsem“), krátké věty, žádné pomlčky ani dvojtečky uprostřed vět, žádné marketingové fráze typu „revoluční“, „bezproblémový“, „posouvá na novou úroveň“.

## Technologie

- Vite + React + TypeScript, Tailwind CSS
- Routing přes `HashRouter` (kvůli GitHub Pages)
- Vitest pro unit testy cenového modelu
- Nasazení na GitHub Pages přes GitHub Actions (`.github/workflows/deploy.yml`), `base` nastavit na název repozitáře `cestovni-pojisteni-prototyp`
- Mobile first, ovladatelné klávesnicí, čitelný kontrast (WCAG AA)
- Žádný backend

## Struktura aplikace

- `#/` **Case study** (úvodní stránka, viz fáze 5)
- `#/sjednani` **Prototyp**, varianta se přidělí automaticky
- `#/sjednani?v=a` a `#/sjednani?v=b` vynucení varianty (pro recruitery a pohovor)
- `?segment=manazer` vynucení segmentu, `?upsell=1` zapnutí nabídky vyššího balíčku před platbou
- `#/vysledky` **Ladicí přehled měření** z aktuálního prohlížeče (funnel z lokálně uložených eventů)

## Fáze 0: Příprava

- Založ projekt, Tailwind, Vitest, ESLint, Prettier.
- Vytvoř `CLAUDE.md` s pravidly z tohoto zadání (fiktivní značka, žádná osobní data v analytice, styl textů, nepushovat).
- Vytvoř projektový skill `.claude/skills/kontrola-textu/SKILL.md`. Skill zkontroluje české texty v UI a case study podle pravidla 6 a vypíše nálezy (soubor, řádek, problém, návrh opravy). Má hlídat i typické znaky AI slopu: prázdná slova, trojice přídavných jmen, zbytečné shrnující věty, anglicismy tam, kde existuje běžné české slovo.

## Fáze 1: Cenový model (`src/pricing/`)

Vše smyšlené a v jednom konfiguračním souboru `src/pricing/config.ts`, aby šlo snadno měnit:
- **Oblast:** Evropa a Svět (různá denní sazba za osobu)
- **Délka cesty:** počet dní z data odjezdu a návratu, maximum 90 dní
- **Cestující:** dospělý, dítě do 18 let (zlevněné), senior 70+ (dražší). Rodinná sleva při 2 dospělých a alespoň 1 dítěti.
- **Balíček:** Základ, Komfort (doporučený), Prémium. Viz sekce Obchodní kontext. Každý má limit léčebných výloh a seznam krytí pro srovnávací tabulku.
- **Připojištění:** zimní a rizikové sporty, storno zájezdu (v Prémiu v ceně), další kufr nad počet v ceně balíčku
- Funkce `calculatePrice(input): PriceBreakdown` vrací celkovou cenu i rozpad po položkách.
- Unit testy pro hraniční případy (1 den, 90 dní, rodinná sleva, senior, kombinace připojištění, neplatná data).

## Fáze 2: Postup sjednání

Jeden postup pro obě varianty testu, navržený nejdřív pro mobil. Varianty se liší jen v kroku 2.

1. **Cesta a cestující.** Kam, kdy, kdo. Volitelná otázka „Jedete pracovně?“ (ano, ne, nebo bez odpovědi). Slouží k poznání segmentu, viz fáze 4.
2. **Výběr balíčku.** 3 karty pod sebou. Na kartách jsou nahoře přínosy pro manažery (limit na kufr, 40 000 Kč na kus elektroniky, nová cena v Prémiu, firemní elektronika). Komfort má v obou variantách štítek „Doporučujeme“. Podrobné srovnání krytí je rozbalovací, aby na mobilu nezabíralo místo.
3. **Doplňky a potřeby.** Počet kufrů, zimní sporty, storno. Otázky na potřeby jsou vložené přímo sem (odpověď „Pojedete lyžovat?“ zapne zimní sporty). Při menším počtu kufrů, než je cestujících, se zobrazí okno s červeným upozorněním a nutným potvrzením. Rozsah otázek na potřeby podle zákona o distribuci pojištění je před spuštěním nutné potvrdit s legal týmem.
4. **Údaje pojistníka a cestujících.** Tlačítko „Vyplnit ukázková data“.
5. **Shrnutí a souhlasy.**
6. **Platba (simulace) a potvrzení.** Apple Pay, Google Pay a karta, vše jen jako simulace.

- **Přilepená lišta s průběžnou cenou** (na mobilu dole) je vidět od chvíle, kdy jsou vyplněné údaje kroku 1. Dokud není vybraný balíček, ukazuje „od“ cenu Základu.
- **Nabídka vyššího balíčku před platbou** je připravená, ale vypnutá. Je to předmět testu 2. V prototypu jde zapnout parametrem `?upsell=1`.

## Fáze 3: A/B test a hypotézy

### Hypotéza 1 (ověřuje A/B test)

- **Varianta A.** Žádný balíček není předvybraný. Klient musí aktivně zvolit.
- **Varianta B.** Komfort je předvybraný.
- Vše ostatní je stejné, včetně štítku „Doporučujeme“ u Komfortu. Mění se jen jedna věc, takže výsledek jde přičíst právě předvolbě.
- **Zápis.** „Pokud bude Komfort předvybraný, zvýší se průměrná hodnota objednávky (AOV), aniž by konverze z funnel_start na purchase_simulated relativně klesla o víc než 5 %, protože většina lidí výchozí volbu nemění a Komfort je dnes vybíraný méně, než odpovídá jeho přínosu.“
- Vyhodnocuje se pro všechny návštěvníky a předem určeně i zvlášť pro segment manažerů a ostatní.

### Hypotéza 2 (neověřuje A/B test)

- **Zápis.** „Pokud přidáme do balíčků přínosy pro manažery, vzroste podíl manažerů mezi klienty.“
- Přínosy pro manažery dostanou obě varianty, takže A/B test hypotézu 2 ověřit neumí. Porovnává se stav před spuštěním a po něm.
- **Metrika.** Podíl smluv ze segmentu manažerů (podle definice ve fázi 4) a dlouhodobě podíl smluv se škodou na elektronice nad 30 000 Kč (výchozí stav 18 %).
- **Slabina.** Srovnání před a po ovlivní sezóna a kampaně. Proto srovnávám se stejným obdobím loni a v case study to uvádím jako omezení. Silnější alternativa je nechat malou kontrolní skupinu (třeba 10 % návštěv) bez přínosů pro manažery. U pojistného produktu to ale znamená prodávat dvě různé verze podmínek. `TODO(Milan): rozhodnout, jestli je kontrolní skupina proveditelná.`

## Fáze 4: A/B přidělení a měření

- **Přidělení:** náhodně 50/50 při první návštěvě, uložit do `localStorage` (obalit `try/catch`), přepsatelné parametrem `?v=a|b`.
- **Segment:** manažer, pokud návštěva přišla z kampaně na manažery (UTM parametr `utm_audience=manazer`) nebo klient odpověděl „Jedete pracovně?“ ano. Jinak ostatní. Přepsatelné parametrem `?segment=manazer` pro ukázku. Do analytiky jdou parametry `segment`, `segment_source` (utm, otázka, žádný) a `trip_purpose`. Ani jeden není osobní údaj.
- **Měřicí vrstva** `src/analytics/track.ts` s jedním rozhraním `track(event, params)`:
  - vždy uloží event lokálně (pro `#/vysledky`),
  - pokud je nastavené `VITE_GA4_ID`, pošle event i do Google Analytics 4 (gtag). Bez ID se GA4 nenačte.
  - posílá jen: název eventu, variantu A/B testu, segment, účel cesty, číslo a název kroku, oblast, počet cestujících, zvolený balíček, přesnou cenu. Cena se nezaokrouhluje, protože AOV je primární metrika a zaokrouhlení by ho zkreslilo. Cena pojištění není osobní údaj. Při dokončení se do GA4 posílá i doporučený event `purchase` s hodnotou a měnou, aby GA4 ukázal AOV v přehledu Monetization. **Nikdy jména, e-maily, data narození.**
- **Eventy funnelu:** `funnel_start`, `step_view`, `step_complete`, `price_shown` (poprvé), `plan_selected`, `addon_toggled`, `validation_error`, `checkout_click`, `payment_started`, `purchase_simulated`. Rozdíl mezi `payment_started` a `purchase_simulated` ukazuje odpad přímo při platbě.
- **`#/vysledky`:** tabulka a jednoduchý graf funnelu po krocích pro obě varianty z lokálních dat, rozpad podle segmentu, AOV a konverze po variantách, tlačítko „Smazat data“. Jasný popisek, že jde jen o data z tohoto prohlížeče.
- **Kalkulačka velikosti vzorku** v case study: hladina významnosti 5 %, síla 80 %. Dva režimy. Pro AOV (primární metrika) vstupy průměrná cena objednávky, směrodatná odchylka a minimální detekovatelný efekt, výstup počet objednávek a návštěv na variantu. Pro konverzi (ochranná metrika) vstupy výchozí konverze a minimální detekovatelný efekt. Výpočet ověř testem proti známé hodnotě.

## Fáze 5: Case study (`#/`)

Struktura stránky (texty napiš jako návrh, já je upravím):
1. **Úvod** ve 3 větách. Hned na začátku jasně říká, že jde o case study zaměřenou na testování. Cílem je zjistit, jaká verze má nejlepší dopad na AOV, tržby a konverzi. Odkazy „Vyzkoušet variantu A“ a „Vyzkoušet variantu B“.
2. **Problém.** Proč je sjednání cestovního pojištění konverzní funnel a kde typicky lidé odpadají (formuluj jako moje hypotézy, ne jako fakta o trhu).
3. **Varianty a hypotézy.** Srovnání kroku výběru balíčku ve variantách A a B vedle sebe (na mobilu pod sebou), zápis hypotézy 1 a 2 podle fáze 3, proč hypotézu 2 neověřuje A/B test. Jak poznáme manažery a proč segmenty určuji předem.
4. **Návrh experimentu.**
   - Primární metrika AOV, protože hlavní obchodní cíl je zvýšit průměrnou hodnotu objednávky.
   - Ochranné metriky. Konverze z `funnel_start` na `purchase_simulated` nesmí relativně klesnout o víc než 5 %. Tržba na návštěvu nesmí klesnout. Bez těchto pojistek by AOV mohlo vyrůst jen proto, že nakoupí méně lidí, ale dražší balíčky.
   - Proč hranice 5 %, viz sekce „Proč ochranná hranice konverze 5 %“ níže.
   - Sekundární metriky. Tržba celkem, počet dokončených a zaplacených objednávek, odpad po krocích (kde odpadá nejvíc lidí), odpad při platbě, čas do dokončení, podíl jednotlivých balíčků.
   - Délka testu, kalkulačka vzorku, kdy test ukončit a jak rozhodnout.
   - Jak data vyhodnotím v praxi (GA4, export, výpočet významnosti), viz README.
   - Plán testů. Test 1 porovná předvybraný Komfort a výběr bez předvolby, nabídka vyššího balíčku před platbou je v obou vypnutá. Test 2 na vítězné variantě porovná nabídku zapnutou a vypnutou. Další kandidáti jsou pořadí balíčků a postup s méně kroky (test na konverzi). V jednom testu se mění jen jedna věc, jinak by nešlo poznat, co výsledek způsobilo. V prototypu jde nabídku ukázat parametrem `?upsell=1`.
5. **Měření.** Seznam eventů, co se záměrně neměří (osobní data) a proč.
6. **Jak bych test provedl v reálném provozu.** Testování v tomto projektu neprobíhá, ani A/B test, ani test s uživateli. Case study ukazuje prototyp, hypotézy a plán. Sekce popisuje postup od plánu testu přes sběr dat v GA4, BigQuery a Looker Studiu (dříve Google Data Studio) po rozhodnutí. Podrobný postup je v README.
7. **Jak jsem pracoval s AI.** Placeholder `TODO(Milan)` se strukturou: co jsem zadal, jak jsem použil CLAUDE.md a skill na kontrolu textů, co AI udělala špatně a jak jsem to poznal, co jsem rozhodl sám.
8. **Plán prvních 90 dní.** Placeholder `TODO(Milan)`, napíšu sám.
9. **Omezení prototypu** (smyšlené ceny a podmínky, žádný backend, žádná platba, lokální měření, žádné skutečné testování).

## Fáze 6: Kontrola a nasazení

- Spusť skill `kontrola-textu` na všechny texty a oprav nálezy.
- Použij subagenta jako nezávislého recenzenta: projde aplikaci proti tomuto zadání (pravidla 1 a 2, přístupnost, mobil, chyby v cenovém modelu) a vrátí seznam problémů. Oprav je.
- Ověř `npm run build` a `npm run test`.
- Připrav GitHub Actions workflow pro Pages a v README popiš, jak nastavit `VITE_GA4_ID` jako repository variable.
- Napiš mi checklist, co mám zkontrolovat ručně před pushem.
