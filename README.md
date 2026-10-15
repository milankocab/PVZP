# Odjezd · prototyp online sjednání cestovního pojištění

Case study a prototyp. Ukazuje, jak bych jako Product Owner navrhl online sjednání cestovního pojištění, nastavil cenový model a naplánoval A/B test zaměřený na průměrnou hodnotu objednávky (AOV), tržby a konverzi.

Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i podmínky jsou smyšlené.

Testování v tomto projektu neprobíhá. Prototyp, hypotézy a plán ukazují, jak bych test provedl v reálném provozu.

## Spuštění

```bash
npm install
npm run dev      # vývojový server
npm run test     # unit testy
npm run build    # produkční build
npm run lint     # ESLint
```

## Struktura

| Cesta | Obsah |
| --- | --- |
| `src/pricing/config.ts` | Všechny ceny, limity a slevy na jednom místě |
| `src/pricing/calculatePrice.ts` | Výpočet ceny a rozpad po položkách |
| `src/analytics/` | A/B přidělení a měřicí vrstva `track(event, params)` |
| `src/pages/` | Case study `#/`, prototyp `#/sjednani`, ladicí přehled měření `#/vysledky` |

Parametry pro ukázku: `?v=a` nebo `?v=b` vynutí variantu testu, `?segment=manazer` vynutí segment manažerů, `?upsell=1` zapne nabídku vyššího balíčku před platbou.

## A/B test

- **Hypotéza 1 (A/B test).** Varianta A nemá předvybraný balíček, varianta B má předvybraný Komfort. Ověřuji, jestli předvolba zvýší AOV.
- **Hypotéza 2 (srovnání před a po).** Přínosy pro manažery dostanou obě varianty. Ověřuji, jestli vzroste podíl manažerů mezi klienty.
- **Primární metrika** AOV. **Ochranné metriky** konverze (relativní pokles nejvýš o 5 %) a tržba na návštěvu (nesmí klesnout).
- Zdůvodnění čísel je v zadání (`zadani-claude-code-cestovni-pojisteni.md`).

## Jak bych test vyhodnotil v reálném provozu

### Nástroje

| Nástroj | K čemu |
| --- | --- |
| **Google Analytics 4** | Sbírá eventy z aplikace. UTM parametry ukládá automaticky jako zdroj a kampaň návštěvy. Funnely a rychlé přehledy. |
| **BigQuery** | Surová data z GA4, každý event zvlášť. Bez nich nejde spočítat statistickou významnost AOV, protože GA4 ukazuje jen průměry, ne rozptyl jednotlivých objednávek. |
| **Looker Studio** (dříve Google Data Studio) | Dashboard nad GA4 a BigQuery, který se sám aktualizuje. Sleduji v něm průběh testu. |
| **GrowthBook** nebo kalkulačka v case study | Statistická významnost. GrowthBook se napojí na BigQuery a spočítá ji sám. |

### Postup

1. **Plán testu před startem.** Sepíšu hypotézu, primární a ochranné metriky, segmenty, potřebný vzorek a délku testu. Segmenty určím předem. Kdo je hledá až v datech, vždycky nějaký „vítězný“ najde, ale je to náhoda.
2. **Nastavení GA4.** V Admin, Custom definitions zaregistruji vlastní dimenze `variant`, `segment`, `segment_source`, `trip_purpose` a `plan`. GA4 je ukazuje až od chvíle založení. Propojím GA4 s BigQuery, export je zdarma.
3. **Dashboard v Looker Studiu.** Konverze a tržba na návštěvu po variantách a týdnech, rozdělení návštěv mezi varianty, podíl manažerů po měsících.
4. **Spuštění.** Nejdřív krátce na malý podíl návštěv, abych ověřil, že měření funguje. Pak 50/50.
5. **Týdenní kontrola.** Sleduji jen dvě věci. Jsou návštěvy rozdělené zhruba 50/50? Pokud ne, je chyba v přidělování a data nejsou důvěryhodná. Nepropadla konverze nebo tržba pod ochrannou hranici? Pokud ano, test zastavím. Vítěze v průběhu nevyhlašuji, i když jedna varianta zrovna vede.
6. **Vyhodnocení po dosažení vzorku.** V GA4 Explore, Free form dám do řádků variantu a do sloupců segment. Hodnoty jsou uživatelé s `funnel_start`, nákupy, tržba a průměrná tržba na nákup. Významnost AOV spočítám z dat v BigQuery v GrowthBooku nebo v kalkulačce.
7. **Rozhodnutí.** Když B vyhraje a ochranné metriky drží, zadám vývoji „varianta B na 100 %, kód varianty A smazat“. Když rozdíl není významný, nechám jednodušší variantu. Výsledek zapíšu do plánu testu.
8. **Další test.** Na vítězné variantě porovnám nabídku vyššího balíčku před platbou zapnutou a vypnutou.

### Jak číst výsledek (vymyšlená čísla pro ilustraci)

| | Návštěvy | Objednávky | Konverze | AOV | Tržba na návštěvu |
| --- | --- | --- | --- | --- | --- |
| A celkem | 28 000 | 2 800 | 10,0 % | 290 Kč | 29,0 Kč |
| B celkem | 28 000 | 2 716 | 9,7 % | 335 Kč | 32,5 Kč |
| A manažeři | 4 000 | 440 | 11,0 % | 360 Kč | 39,6 Kč |
| B manažeři | 4 000 | 436 | 10,9 % | 420 Kč | 45,8 Kč |

AOV v B je o 15 % vyšší. Konverze klesla o 3 % relativně, tedy pod hranicí 5 %. Tržba na návštěvu vzrostla o 12 %. Pokud je rozdíl v AOV statisticky významný, B vyhrává. U manažerů vychází výsledek podobně, ale segment je menší, takže je méně jistý.

### Hypotéza 2 v čase

Podíl objednávek od manažerů po měsících ve srovnání se stejným obdobím loni. Je to slabší důkaz než A/B test, protože ho ovlivní sezóna a kampaně.

## Google Analytics 4 v prototypu

Bez proměnné `VITE_GA4_ID` se GA4 nenačte a eventy se ukládají jen lokálně pro `#/vysledky`. Lokálně ji jde nastavit v souboru `.env.local` (vzor je v `.env.example`). Nastavení pro GitHub Pages doplním ve fázi 6.

GA4 ukládá cookies. Před ostrým provozem je potřeba souhlas s cookies, jeho řešení je nutné potvrdit s legal týmem.

Do analytiky nikdy nejdou jména, e-maily, data narození ani jiný obsah formulářů.
