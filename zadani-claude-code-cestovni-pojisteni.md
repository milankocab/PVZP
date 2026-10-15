# Zadání pro Claude Code: prototyp online sjednání cestovního pojištění + case study

> Tento soubor vlož do Claude Code jako první zprávu (nebo ho ulož do repozitáře jako `ZADANI.md` a napiš „Přečti ZADANI.md a začni fází 0“).

## Kontext (pro tebe, Claude Code)

Jsem Milan, Product Owner. Hlásím se na pozici Product Owner pro online sjednání pojištění v pojišťovně, která staví novou digitální jednotku. První produkt je online sjednání cestovního pojištění. Firma chce PO, který:
- vlastní konverzní funnel a rozhoduje podle dat a experimentů,
- rozumí vývoji webových aplikací,
- sám si s AI postaví funkční prototyp a pozná „AI slop“,
- převezme řešení od externího dodavatele a postaví malý interní tým.

Cílem tohoto repozitáře je **funkční prototyp sjednání cestovního pojištění ve dvou variantách (A/B test)** s měřením funnelu a **case study stránka**, která vysvětluje moje produktová rozhodnutí. Odkaz na case study dám do CV.

## Obchodní kontext a cíl cenového modelu

- Dnes se nejvíc prodává nejnižší tarif.
- Firma chce zvýšit AOV (průměrnou hodnotu objednávky).
- Proto nastavujeme nový cenový model se třemi balíčky Základ, Komfort a Prémium. Doporučený a ve variantě B předvybraný je Komfort.
- Hlavní cílový segment jsou manažeři. Podle interních dat tento segment roste. `TODO(Milan): doplnit zdroj nebo číslo, případně formulovat jako předpoklad.`
- Nový typ limitu je limit na zavazadla a elektroniku. Manažeři cestují s drahou technikou a limit je pro ně důvod zvolit vyšší balíček.

| Parametr | Základ | Komfort | Prémium |
| --- | --- | --- | --- |
| Limit zavazadel a elektroniky (na jeden kufr) | 15 000 Kč | 50 000 Kč | 80 000 Kč |
| Limit na jeden kus elektroniky | do limitu kufru | do limitu kufru | 50 000 Kč |
| Cenový odskok | základní cena | +150 % oproti Základu (velký skok) | +20 % oproti Komfortu (malý skok) |
| Plnění za elektroniku | časová cena (odpočet stáří) | časová cena (odpočet stáří) | nová cena pro věci do 2 let stáří |
| Asistence | lékařská nonstop | lékařská a rozšířená (ztráta dokladů, právní pomoc) | lékařská a rozšířená |
| Výhody navíc | žádné | odpovědnost, úraz | storno v ceně bez lhůty od koupě, zpoždění letu, vyšší odpovědnost |

Velký skok mezi Základem a Komfortem a malý skok mezi Komfortem a Prémiem má posunout volbu od Základu k vyšším balíčkům.

### Mobil na prvním místě

Podle interních dat vzniká 70 % nových smluv na telefonu. `TODO(Milan): ověřit zdroj čísla.` Návrh proto začíná u mobilu a desktop se přizpůsobuje mobilnímu zobrazení, ne naopak. Každou obrazovku navrhuji a kontroluji nejdřív v šířce 375 px.

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
- `#/vysledky` **Ladicí přehled měření** z aktuálního prohlížeče (funnel z lokálně uložených eventů)

## Fáze 0: Příprava

- Založ projekt, Tailwind, Vitest, ESLint, Prettier.
- Vytvoř `CLAUDE.md` s pravidly z tohoto zadání (fiktivní značka, žádná osobní data v analytice, styl textů, nepushovat).
- Vytvoř projektový skill `.claude/skills/kontrola-textu/SKILL.md`. Skill zkontroluje české texty v UI a case study podle pravidla 6 a vypíše nálezy (soubor, řádek, problém, návrh opravy). Má hlídat i typické znaky AI slopu: prázdná slova, trojice přídavných jmen, zbytečné shrnující věty, anglicismy tam, kde existuje běžné české slovo.

## Fáze 1: Cenový model (`src/pricing/`)

Vše smyšlené a v jednom konfiguračním souboru `src/pricing/config.ts`, aby šlo snadno měnit:
- **Oblast:** Evropa, Svět bez USA a Kanady, Celý svět (různá denní sazba za osobu)
- **Délka cesty:** počet dní z data odjezdu a návratu, maximum 90 dní
- **Cestující:** dospělý, dítě do 18 let (zlevněné), senior 70+ (dražší). Rodinná sleva při 2 dospělých a alespoň 1 dítěti.
- **Balíček:** Základ, Komfort (doporučený), Prémium. Viz sekce Obchodní kontext. Každá má limit léčebných výloh a seznam krytí pro srovnávací tabulku.
- **Připojištění:** zimní a rizikové sporty, storno zájezdu, zavazadla
- Funkce `calculatePrice(input): PriceBreakdown` vrací celkovou cenu i rozpad po položkách.
- Unit testy pro hraniční případy (1 den, 90 dní, rodinná sleva, senior, kombinace připojištění, neplatná data).

## Fáze 2: Varianta A „Klasický průvodce“

Odpovídá běžnému postupu na trhu. Cena se ukáže až ve 3. kroku.
1. Kam a kdy (oblast, datum odjezdu a návratu)
2. Kdo jede (počet a věk cestujících)
3. Výběr varianty (3 karty s cenou a srovnáním krytí)
4. Připojištění
5. Požadavky a potřeby (2 až 3 krátké otázky, např. „Pojedete lyžovat?“). Označ `TODO(Milan): ověřit, co přesně vyžaduje zákon o distribuci pojištění pro online sjednání.`
6. Údaje pojistníka a cestujících
7. Shrnutí a souhlasy
8. Platba (simulace) a potvrzení

## Fáze 3: Varianta B „Cena od první otázky“

Hypotéza: když uživatel vidí cenu hned a musí udělat méně rozhodnutí, víc lidí sjednání dokončí.
- Kroky 1 a 2 sloučené do jedné obrazovky (kam, kdy, kdo).
- Od prvního vyplnění je vidět **přilepená lišta s průběžnou cenou** (na mobilu dole).
- Balíček Komfort je předvybraný, připojištění se nabízí podle odpovědí (lyžování → nabídni zimní sporty), ne jako dlouhý seznam.
- Požadavky a potřeby jsou vložené přímo do výběru (otázka „Pojedete lyžovat?“ zároveň nastaví připojištění).
- Výsledek je o 2 kroky kratší než varianta A.

Obě varianty sdílí komponenty a cenový model, liší se jen tok a prezentace.

## Fáze 4: A/B přidělení a měření

- **Přidělení:** náhodně 50/50 při první návštěvě, uložit do `localStorage` (obalit `try/catch`), přepsatelné parametrem `?v=a|b`.
- **Měřicí vrstva** `src/analytics/track.ts` s jedním rozhraním `track(event, params)`:
  - vždy uloží event lokálně (pro `#/vysledky`),
  - pokud je nastavené `VITE_GA4_ID`, pošle event i do Google Analytics 4 (gtag). Bez ID se GA4 nenačte.
  - posílá jen: název eventu, variantu, číslo a název kroku, oblast, počet cestujících, zvolenou variantu krytí, cenu zaokrouhlenou na stovky. **Nikdy jména, e-maily, data narození.**
- **Eventy funnelu:** `funnel_start`, `step_view`, `step_complete`, `price_shown` (poprvé), `plan_selected`, `addon_toggled`, `validation_error`, `checkout_click`, `purchase_simulated`.
- **`#/vysledky`:** tabulka a jednoduchý graf funnelu po krocích pro obě varianty z lokálních dat, tlačítko „Smazat data“. Jasný popisek, že jde jen o data z tohoto prohlížeče.
- **Kalkulačka velikosti vzorku** v case study: vstupy výchozí konverze, minimální detekovatelný efekt, hladina významnosti 5 %, síla 80 %. Výstup potřebný počet návštěv na variantu. Výpočet ověř testem proti známé hodnotě.

## Fáze 5: Case study (`#/`)

Struktura stránky (texty napiš jako návrh, já je upravím):
1. **Úvod** ve 3 větách. Co jsem postavil, proč a odkazy „Vyzkoušet variantu A“ a „Vyzkoušet variantu B“.
2. **Problém.** Proč je sjednání cestovního pojištění konverzní funnel a kde typicky lidé odpadají (formuluj jako moje hypotézy, ne jako fakta o trhu).
3. **Dvě varianty a hypotéza.** Srovnání A a B vedle sebe (schéma kroků), formální zápis hypotézy: „Pokud ukážeme cenu od prvního kroku a sloučíme kroky, zvýší se podíl dokončených sjednání z funnel_start na purchase_simulated, protože…“
4. **Návrh experimentu.** Primární metrika, sekundární metriky (odpad po krocích, čas do dokončení), ochranné metriky (podíl připojištění, průměrná cena), délka testu, kalkulačka vzorku, kdy test ukončit a jak rozhodnout.
5. **Měření.** Seznam eventů, co se záměrně neměří (osobní data) a proč.
6. **Uživatelský test.** Placeholder sekce `TODO(Milan)` pro výsledky testu s 5 lidmi (úkol, co jsem pozoroval, co jsem změnil).
7. **Jak jsem pracoval s AI.** Placeholder `TODO(Milan)` se strukturou: co jsem zadal, jak jsem použil CLAUDE.md a skill na kontrolu textů, co AI udělala špatně a jak jsem to poznal, co jsem rozhodl sám.
8. **Plán prvních 90 dní.** Placeholder `TODO(Milan)`, napíšu sám.
9. **Omezení prototypu** (smyšlené ceny, žádný backend, žádná platba, lokální měření).

## Fáze 6: Kontrola a nasazení

- Spusť skill `kontrola-textu` na všechny texty a oprav nálezy.
- Použij subagenta jako nezávislého recenzenta: projde aplikaci proti tomuto zadání (pravidla 1 a 2, přístupnost, mobil, chyby v cenovém modelu) a vrátí seznam problémů. Oprav je.
- Ověř `npm run build` a `npm run test`.
- Připrav GitHub Actions workflow pro Pages a v README popiš, jak nastavit `VITE_GA4_ID` jako repository variable.
- Napiš mi checklist, co mám zkontrolovat ručně před pushem.
