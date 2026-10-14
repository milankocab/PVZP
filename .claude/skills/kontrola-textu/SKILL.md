---
name: kontrola-textu
description: Zkontroluje české texty v UI a case study (soubory v src/) podle pravidel stylu projektu a hledá znaky AI slopu. Vypíše nálezy jako tabulku (soubor, řádek, problém, návrh opravy). Použij, když Milan napíše „zkontroluj texty“, „kontrola textu“ nebo před koncem fáze s novými texty.
---

# Kontrola českých textů

Projdi české texty, které vidí uživatel, a najdi porušení stylu projektu. Nic sám neopravuj, pokud o to Milan výslovně nepožádá. Výstupem je seznam nálezů.

## Rozsah

- Výchozí rozsah: `src/**/*.tsx` a `src/**/*.ts` (texty v JSX, řetězce s českým textem, konfigurace s popisky v `src/pricing/config.ts`).
- Pokud Milan uvede konkrétní soubor nebo složku, kontroluj jen ji.
- Ignoruj: komentáře v kódu, názvy proměnných, názvy eventů analytiky, testy (`*.test.ts`), texty `TODO(Milan)`.
- Ignoruj povinnou patičku: „Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i podmínky jsou smyšlené.“

## Postup

1. Najdi soubory v rozsahu (Glob) a přečti je celé (Read). Nespoléhej jen na grep, kontext věty je důležitý.
2. U každého českého textu ověř pravidla níže.
3. Pro rychlé předfiltrování můžeš použít grep na vzory v sekci „Rychlé vzory“, ale každý nález potvrď čtením věty.
4. Vypiš výsledek ve formátu níže.

## Pravidla stylu

| Kód | Pravidlo |
| --- | --- |
| S1 | Case study a texty o práci autora píšou v první osobě jednotného čísla („Navrhl jsem“). Ne „my“, ne trpný rod („bylo navrženo“), ne neosobní „autor“. UI texty pro zákazníka mohou oslovovat „vy“. |
| S2 | Krátké věty. Věta delší než zhruba 20 slov nebo se třemi a více vedlejšími větami je nález. |
| S3 | Žádné pomlčky uprostřed věty (`–`, `—`, ` - ` mezi slovy). Rozsahy čísel a dat („2–3“) jsou v pořádku. |
| S4 | Žádné dvojtečky uprostřed věty. Dvojtečka je v pořádku na konci popisku formuláře, v nadpisu tabulky, před výčtem na konci řádku a v čase. |
| S5 | Žádné marketingové fráze. Například „revoluční“, „bezproblémový“, „bezstarostný“, „jedinečný“, „posouvá na novou úroveň“, „špičkový“, „inovativní“, „jednoduše a rychle“, „vše na jednom místě“, „to nejlepší“. |

## Znaky AI slopu

| Kód | Znak |
| --- | --- |
| A1 | Prázdná slova bez informace. „klíčový“, „zásadní“, „komplexní“, „robustní“, „efektivní“, „holistický“, „smysluplný“, „hodnotný“, „řešení“ (bez upřesnění čeho), „v dnešní době“, „v neposlední řadě“. |
| A2 | Trojice přídavných jmen nebo trojice podobných slov za sebou („rychlé, přehledné a spolehlivé“). |
| A3 | Zbytečné shrnující věty na konci odstavce („Celkově lze říci…“, „Díky tomu je celý proces…“, „To vše přispívá k…“). |
| A4 | Anglicismy tam, kde existuje běžné české slovo. Například „user flow“ (tok), „pain pointy“ (problémy), „insight“ (zjištění), „leverage“, „deliverable“, „feature“ (funkce), „targetovat“, „implementovat“ tam, kde stačí „zavést“. Odborné termíny bez dobré české náhrady jsou v pořádku: funnel, A/B test, event, Product Owner, prototyp, case study. |
| A5 | Vata a opakování. Dvě věty říkají totéž, úvodní věta jen opakuje nadpis. |
| A6 | Přehnaná jistota. Tvrzení o trhu nebo uživatelích podané jako fakt bez zdroje. Má být formulované jako hypotéza nebo označené `TODO(Milan): ověřit`. |

## Rychlé vzory pro grep

```
 – | — | - [a-zá-ž]
revoluční|bezproblém|bezstarost|jedinečn|novou úroveň|špičkov|inovativ|jednoduše a rychle
klíčov|zásadní|komplexní|robustní|efektivn|holistick|smyslupln|v dnešní době|v neposlední řadě
celkově|díky tomu je|to vše přispívá
insight|feature|pain point|user flow|leverage|deliverable|targetov
```

## Formát výstupu

Nejdřív jedna věta se souhrnem (počet nálezů a počet souborů). Pak tabulka seřazená podle souboru a řádku:

| Soubor | Řádek | Kód | Problém | Návrh opravy |
| --- | --- | --- | --- | --- |
| `src/pages/CaseStudyPage.tsx` | 42 | S3 | Pomlčka uprostřed věty „Cena se ukáže – ale až pozdě.“ | „Cena se ukáže. Ale až pozdě.“ |

- Do sloupce Problém dej citaci problematického úseku.
- Návrh opravy piš celý přepsaný úsek, ne jen radu.
- Když nic nenajdeš, napiš „Bez nálezů“ a seznam zkontrolovaných souborů.
- Na konci uveď nálezy, u kterých si nejsi jistý, zvlášť v sekci „K posouzení“.
