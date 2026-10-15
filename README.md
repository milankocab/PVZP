# Odjezd · prototyp online sjednání cestovního pojištění

Case study a prototyp. Ukazuje, jak bych jako Product Owner navrhl online sjednání cestovního pojištění, nastavil cenový model a naplánoval A/B test zaměřený na průměrnou hodnotu objednávky (AOV), tržby a konverzi.

Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i podmínky jsou smyšlené.

A/B test v tomto projektu neprobíhá. Prototyp, hypotézy a plán ukazují, jak bych test provedl v reálném provozu. Variantu B jsem předem probral v neformálních rozhovorech se 6 lidmi z okolí (5 z 6 zvolilo předvybraný balíček). Nejde o reprezentativní výzkum.

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

Parametry pro ukázku: `?v=a` nebo `?v=b` vynutí variantu testu, `?segment=manazer` vynutí segment manažerů, `?upsell=0` vypne nabídku vyššího balíčku, která je jinak zapnutá ve všech krocích od výběru balíčku. Nad formulářem je ladicí lišta s přepínačem varianty a segmentu. Na ostrém webu by nebyla.

## A/B test

- **Hypotéza 1 (A/B test).** Varianta A má balíčky pod sebou bez předvolby, varianta B vedle sebe s předvybraným Komfortem. Ověřuji, jestli tento způsob výběru zvýší AOV. Test mění dvě věci najednou, zdůvodnění je v case study.
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
8. **Další testy.** Když vyhraje B, porovnám B s předvolbou a bez ní. Pak na vítězné variantě nabídku vyššího balíčku zapnutou a vypnutou.

### Jak číst výsledek (vymyšlená čísla pro ilustraci)

| | Návštěvy | Objednávky | Konverze | AOV | Tržba na návštěvu |
| --- | --- | --- | --- | --- | --- |
| A celkem | 55 000 | 5 500 | 10,0 % | 290 Kč | 29,0 Kč |
| B celkem | 55 000 | 5 335 | 9,7 % | 335 Kč | 32,5 Kč |
| A manažeři | 8 000 | 880 | 11,0 % | 360 Kč | 39,6 Kč |
| B manažeři | 8 000 | 872 | 10,9 % | 420 Kč | 45,8 Kč |

AOV v B je o 15 % vyšší. Konverze klesla o 3 % relativně, tedy pod hranicí 5 %. Tržba na návštěvu vzrostla o 12 %. Pokud je rozdíl v AOV statisticky významný, B vyhrává. U manažerů vychází výsledek podobně, ale segment je menší, takže je méně jistý.

### Hypotéza 2 v čase

Podíl objednávek od manažerů po měsících ve srovnání se stejným obdobím loni. Je to slabší důkaz než A/B test, protože ho ovlivní sezóna a kampaně.

## Měření na nasazeném prototypu

Pro prototyp používám PostHog. Je zdarma do milionu eventů měsíčně a sám měří všechny kliky (autocapture). Nastavil jsem ho bez cookies a bez localStorage. Návštěvník dostane anonymní ID, které žije jen do zavření nebo obnovení stránky. Nahrávání relací je vypnuté.

Co PostHog dostává:

- každý klik a změnu ve formuláři, ale bez hodnot polí;
- zobrazení stránky (`$pageview`) a odchod ze stránky;
- všechny eventy funnelu z `track()` se stejnými parametry jako GA4, tedy i variantu a segment.

Prvky, které zobrazují osobní údaje (pole se jménem a datem narození, seznam pojištěných ve shrnutí), mají třídu `ph-no-capture`. Kliky z nich PostHog nezaznamená. Každý nový takový prvek musí třídu dostat taky.

### Jak PostHog zapnout

1. Založím si účet na [posthog.com](https://posthog.com) a zvolím EU cloud.
2. V Project settings zkopíruji Project API key (začíná `phc_`). Klíč je veřejný, patří do kódu stránky, nejde o tajemství.
3. Lokálně ho vložím do `.env.local` jako `VITE_POSTHOG_KEY` (vzor je v `.env.example`).
4. Pro GitHub Pages ho uložím jako repository variable `VITE_POSTHOG_KEY`. Workflow ho předá buildu, viz Nasazení níže.
5. V PostHogu je pak v Activity vidět každý klik. Funnel A proti B udělám v Product analytics, Funnels, s rozdělením podle vlastnosti `variant`. Heatmapa kliků je v Toolbaru.

Bez klíče se PostHog vůbec nenačte ani nezabalí do buildu.

Měření bez cookies je pořád zpracování dat o návštěvě. Jestli na ostrém webu stačí bez souhlasu, je nutné potvrdit s legal týmem.

### Google Analytics 4

GA4 je nástroj pro ostrý provoz popsaný výše. V prototypu je volitelný. Bez proměnné `VITE_GA4_ID` se nenačte a eventy se ukládají jen lokálně pro `#/vysledky`. GA4 ukládá cookies. Před ostrým provozem je potřeba souhlas s cookies, jeho řešení je nutné potvrdit s legal týmem.

Do analytiky nikdy nejdou jména, e-maily, data narození ani jiný obsah formulářů.

## Nasazení na GitHub Pages

Workflow je v `.github/workflows/deploy.yml`. Po pushi do `main` spustí lint, testy a build a nasadí složku `dist` na GitHub Pages. Jde ho spustit i ručně v záložce Actions (Run workflow).

1. Název repozitáře není důležitý. `base` ve `vite.config.ts` je relativní (`./`) a routování běží přes hash, takže web funguje na jakékoli adrese.
2. V Settings, Pages nastavím Source na GitHub Actions.
3. V Settings, Secrets and variables, Actions, záložka Variables, založím repository variables. Všechny jsou volitelné.

| Proměnná | Hodnota |
| --- | --- |
| `VITE_POSTHOG_KEY` | Project API key z PostHogu (`phc_…`) |
| `VITE_POSTHOG_HOST` | Jen pro US účet `https://us.i.posthog.com`. Bez ní se použije EU. |
| `VITE_GA4_ID` | Measurement ID z GA4 (`G-…`) |

Proměnné jsou veřejné. Vite je vloží do JavaScriptu stránky, takže je vidí každý návštěvník. Proto jsou ve Variables, ne v Secrets. Nic tajného do nich nepatří.

Po změně proměnné je potřeba workflow spustit znovu, hodnoty se vkládají při buildu.
