# Redesign prototypu „Odjezd“ (online sjednání cestovního pojištění)

## Co po tobě chci

Navrhni úplně nový vizuální a interakční design pro prototyp online sjednání cestovního pojištění. Přikládám screenshoty současného stavu. Ber je jen jako soupis funkcí a obsahu, ne jako předlohu vzhledu. Současný design se mi nelíbí. Je to formulář s kartami pod sebou a působí jako generická šablona.

Chci, abys překopal hlavně **způsob, jakým klient vybírá a zadává**. Nehledej jen nové barvy a zaoblení. U každého kroku se zeptej, jestli jde stejnou informaci získat přirozeněji, rychleji a s menší námahou na telefonu. Funkce a logika musí zůstat zachované (viz níže). Forma je zcela na tobě.

## Kontext produktu

- Fiktivní pojišťovna **Odjezd**. Prototyp je ukázka produktové práce do CV Product Ownera. Není to produkt žádné skutečné pojišťovny.
- Obchodní cíl je zvýšit průměrnou hodnotu objednávky (AOV). Dnes se nejvíc prodává nejlevnější balíček. Cílový segment jsou manažeři, kteří cestují s drahou pracovní elektronikou.
- Na prototypu běží A/B test předvybraného balíčku a měří se celý funnel.
- **Mobil na prvním místě.** 78 % návštěv a 70 % smluv vzniká na telefonu. Každou obrazovku navrhni nejdřív v šířce **375 px**. Desktop je až rozšíření mobilní verze.
- Celé UI je v češtině.

## Co se nesmí změnit (funkční zadání)

### Postup má 6 logických kroků

Každý krok se měří zvlášť (eventy `step_view` a `step_complete` s číslem kroku). Vizuálně je můžeš pojmout jakkoli, ale tyto celky musí zůstat oddělené a ve stejném pořadí. Pokud navrhneš sloučení kroků, dej ho jako samostatnou alternativu a vysvětli dopad.

1. **Cesta a cestující**
   - Oblast. Jen dvě možnosti. Evropa (včetně Turecka a Maroka) a Svět (včetně USA a Kanady). Klient ale přemýšlí v zemích, ne v oblastech. Klidně navrhni výběr země nebo destinace, ze které se oblast určí sama.
   - Datum odjezdu a návratu. Cesta trvá nejvýš 90 dní. Cena se počítá podle počtu dní.
   - Cestující. Dospělý (18 až 69 let), dítě (do 18 let, poloviční cena), senior (70 a více, dvojnásobná cena). Celkem nejvýš 9 osob. Rodinná sleva 15 % při 2 dospělých a aspoň 1 dítěti, klient by měl vidět, že na ni dosáhl.
   - Nepovinná otázka „Jedete pracovně?“ (ano, ne, bez odpovědi). Určuje segment manažerů. Musí zůstat nepovinná a nenápadná.
   - Slevy pro členy (dvě zaškrtávací volby).

2. **Výběr balíčku** (tady běží A/B test)
   - Tři balíčky Základ, Komfort, Prémium. Komfort má v obou variantách štítek „Doporučujeme“.
   - **Varianta A.** Nic není předvybrané, klient musí aktivně zvolit.
   - **Varianta B.** Komfort je předvybraný.
   - Kromě předvolby musí obě varianty vypadat úplně stejně. Navrhni tedy jeden vzor výběru, který funguje ve stavu „nic nevybráno“ i „Komfort vybrán“.
   - Nahoře u balíčků musí být vidět přínosy pro manažery. Limit na kufr, 40 000 Kč na jeden kus elektroniky, nová cena elektroniky v Prémiu, krytí firemní elektroniky v Prémiu.
   - Podrobné srovnání krytí (13 řádků, viz data níže) musí být dostupné, ale na mobilu nesmí zabírat místo. Dnes je to rozbalovací tabulka. Vymysli lepší způsob.
   - Cena každého balíčku je vidět přímo u něj a přepočítává se podle cesty.
   - Tady čekám největší změnu. Tři karty pod sebou nejsou jediná možnost. Zvaž například srovnání po jednotlivých parametrech, posuvník úrovně krytí, otázku na to, co vezou s sebou, ze které vyplyne doporučení, nebo jiný vzor. Vyber ten, který nejlépe podpoří volbu vyššího balíčku a přitom bude férový a srozumitelný.

3. **Doplňky a potřeby**
   - Počet kufrů. Nejvýš 2 na cestujícího. Základ má v ceně 1 kufr na smlouvu, Komfort a Prémium 1 kufr na osobu. Kufry navíc se doplácí.
   - **Upozornění na kufry.** Když je kufrů méně než cestujících, při pokračování se otevře okno s výrazným (červeným) upozorněním, že limit platí na kufr. Klient musí volbu aktivně potvrdit. Nabízí přidat kufr, přejít na vyšší balíček, nebo pokračovat beze změny. Okno musí zůstat a musí mít tyto tři volby.
   - Otázka „Pojedete lyžovat nebo na hory?“ Při ano klient vybere sporty (lyže a snowboard, lezení a vysoké hory, divoká voda a vítr, potápění, horské kolo, létání a skoky, motorové sporty, jiné sporty). Rizikový sport zapne připojištění zimních a rizikových sportů.
   - Otázka „Máte už zaplacený zájezd, ubytování nebo letenky?“ Při ano se nabídne storno zájezdu. Pole cena zájezdu za všechny a datum zaplacení. Storno jde sjednat do 7 dní od zaplacení. V Prémiu je storno v ceně a lhůta neplatí.

4. **Údaje pojistníka a cestujících**
   - Jméno, příjmení, datum narození u každého cestujícího. U pojistníka navíc e-mail a telefon.
   - Tlačítko „Vyplnit ukázková data“ musí zůstat dobře viditelné. Recruiteři díky němu projdou postup za minutu.
   - Chybové stavy polí a fokus na první chybu.

5. **Shrnutí a souhlasy**
   - Přehled cesty, cestujících, balíčku, doplňků, slev a rozpad ceny po položkách.
   - Povinné souhlasy.
   - Připravená, ale v testu vypnutá **nabídka vyššího balíčku před platbou**. Navrhni ji také (zobrazí se jen s parametrem `?upsell=1`).

6. **Platba (simulace) a potvrzení**
   - Apple Pay, Google Pay a karta. Vše jen jako simulace.
   - Hlavní tlačítko má text „Zaplatit (simulace)“. Nesmí vzbudit dojem, že jde o skutečnou platbu.
   - Potvrzovací obrazovka po zaplacení s možností začít znovu.

### Přilepená lišta s cenou a hlavním tlačítkem

- Na mobilu je dole, v dosahu palce, vidět od prvního kroku. Nese hlavní tlačítko „Pokračovat“ (v posledním kroku „Zaplatit (simulace)“).
- Tři stavy ceny. Před vyplněním cesty „Vyplňte cestu“. Po vyplnění cesty, ale bez balíčku, cena „od“ (cena Základu). Po výběru balíčku přesná cena.
- Možnost rozbalit rozpad ceny.
- Navrhni změnu ceny tak, aby klient změnu postřehl (jemná animace čísla).

### Další obrazovky

- **Ladicí lišta nad postupem.** Na ostrém webu by nebyla. Obsahuje přepínač varianty A/B a přepínač segmentu (manažer, ostatní). Ty dva musí být vizuálně oddělené, každý s vlastním rámečkem, barvou a krátkou vysvětlivkou. Segment nemění, co návštěvník vidí. Lišta má působit jako nástroj, ne jako součást produktu.
- **Case study** (`#/`, úvodní stránka). Dlouhý text s nadpisy, tabulkami, srovnáním variant A a B vedle sebe (na mobilu pod sebou), kalkulačkou velikosti vzorku a odkazy „Vyzkoušet variantu A“ a „Vyzkoušet variantu B“. Navrhni typografii a rozvržení dlouhého čtení. Má působit jako kvalitní produktový článek.
- **Ladicí přehled měření** (`#/vysledky`). Tabulka a jednoduchý graf funnelu po krocích pro obě varianty, rozpad podle segmentu, AOV a konverze, tlačítko „Smazat data“. Jasný popisek, že jde jen o data z tohoto prohlížeče.

### Patička na každé stránce

Přesně tento text: „Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i podmínky jsou smyšlené.“

## Data pro návrh

Ceny a limity jsou smyšlené. Použij je, ať návrh nepracuje s nesmyslnými čísly.

| Parametr | Základ | Komfort | Prémium |
| --- | --- | --- | --- |
| Cena za den, dospělý, Evropa | 38 Kč | 57 Kč | 68 Kč |
| Ukázka, 7 dní Evropa, 1 dospělý | 266 Kč | 399 Kč | 479 Kč |
| Zavazadla a elektronika | 15 tis. Kč na kufr | 50 tis. Kč na kufr | 80 tis. Kč na kufr |
| Kufry v ceně | 1 na smlouvu | 1 na osobu | 1 na osobu |
| Jeden kus elektroniky | do limitu kufru | nejvýše 40 tis. Kč | nejvýše 40 tis. Kč |
| Plnění za elektroniku | časová cena | časová cena | nová cena u věcí do 2 let |
| Firemní elektronika, kterou používáte | ne | ne | ano |
| Léčebné výlohy | 5 mil. Kč | 25 mil. Kč | 250 mil. Kč |
| Lékařská asistence nonstop | ano | ano | ano |
| Rozšířená asistence (ztráta dokladů, právní pomoc) | ne | ano | ano |
| Převoz zpět do ČR | ano | ano | ano |
| Odpovědnost za škodu | 3 mil. Kč | 10 mil. Kč | 25 mil. Kč |
| Trvalé následky úrazu | ne | 200 tis. Kč | 400 tis. Kč |
| Storno zájezdu | jako připojištění | jako připojištění | v ceně, bez lhůty od koupě |
| Zpoždění letu nad 6 hodin | ne | ne | 3 tis. Kč |

Krátké popisy balíčků:
- Základ. Léčebné výlohy a jeden kufr do 15 tis. Kč.
- Komfort. Pracovní notebook i telefon, odpovědnost a rozšířená asistence.
- Prémium. Nová cena elektroniky, storno bez lhůty a zpoždění letu.

Oblast Svět stojí 70 Kč za den v Základu. Zimní sporty 20 Kč na osobu a den. Storno 3,5 % z ceny zájezdu, nejméně 190 Kč.

## Tvrdá omezení

1. **Značka.** Název „Odjezd“ zůstává. Současné logo je petrolejové a oranžové, vizuální identitu ale můžeš navrhnout novou. Nesmí připomínat žádnou skutečnou pojišťovnu (barvami, logem, tónem ani texty).
2. **Žádná reálná platba ani sběr údajů.** Všechno, co vypadá jako platba, musí být zřetelně označené jako simulace.
3. **Osobní údaje a měření.** Prototyp měří kliky (PostHog autocapture). Každý prvek, který zobrazuje jméno, e-mail, telefon nebo datum narození, musí jít označit, aby se neměřil. Ve specifikaci komponent to u takových prvků vyznač.
4. **Ovládání a přístupnost.** Dotykové prvky aspoň 44 × 44 px. Hlavní tlačítko v dosahu palce. Kontrast textu WCAG AA (4,5:1, velký text 3:1). Celý postup jde projít klávesnicí, viditelný fokus. Žádná informace jen barvou. Respektuj `prefers-reduced-motion`.
5. **Technologie.** Vývoj proběhne v React + TypeScript + Tailwind CSS v4. Navrhuj tak, aby šlo design postavit z běžných HTML prvků a Tailwindu bez těžkých knihoven. Žádné vlastní fonty mimo Google Fonts nebo Fontsource.
6. **Texty v UI.** Čeština. Krátké věty. Žádné pomlčky ani dvojtečky uprostřed vět, místo nich tečka nebo čárka. Žádné marketingové fráze typu „revoluční“, „bezproblémový“, „jednoduše a rychle“, „na novou úroveň“. Oslovuj vykáním. Pokud měníš texty, drž se těchto pravidel.
7. **Férovost.** Návrh má podpořit vyšší balíček tím, že jasně ukáže hodnotu. Ne skrytými poplatky, falešnou naléhavostí, předzaškrtnutými doplňky ani zastrašováním (dark patterns). Jediná povolená předvolba je Komfort ve variantě B.

## Co chci dostat

1. **Koncept v pár větách.** Jaký vzor výběru navrhuješ a proč je pro klienta na telefonu lepší než současný.
2. **Mobilní obrazovky (375 px)** pro všech 6 kroků. Krok 2 ve dvou stavech (varianta A bez výběru, varianta B s předvybraným Komfortem).
3. **Stavy.** Prázdný, vyplněný, chyba ve formuláři, okno upozornění na kufry, nabídka vyššího balíčku, tři stavy cenové lišty, rozbalený rozpad ceny, potvrzení po platbě.
4. **Desktop (1280 px)** aspoň pro kroky 1 a 2 a pro case study. Ukaž, jak se mobilní rozvržení rozšíří.
5. **Ladicí lištu, case study a přehled měření** v novém stylu.
6. **Design tokeny.** Barvy (včetně kontrastních poměrů hlavních dvojic), typografie, mezery, zaoblení, stíny, pohyb.
7. **Seznam komponent** se stavy (výchozí, hover, fokus, aktivní, vybraný, zakázaný, chyba).
8. **Seznam změn oproti současnému stavu** a u každé krátké zdůvodnění. Zvlášť označ změny, které mění funkci nebo měření (například sloučení kroků nebo výběr země místo oblasti), abych je mohl posoudit jako produktové rozhodnutí.
