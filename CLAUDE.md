# CLAUDE.md

Prototyp online sjednání cestovního pojištění ve dvou variantách (A/B test) s měřením funnelu a case study. Autor a Product Owner je Milan. Celé zadání je v `zadani-claude-code-cestovni-pojisteni.md`.

## Tvrdá pravidla

1. **Fiktivní značka „Odjezd“.** Nepoužívej název, logo, barvy, texty ani ceny žádné skutečné pojišťovny. Každá stránka má v patičce text: „Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i podmínky jsou smyšlené.“ Patička je v `src/components/Layout.tsx`, neodstraňuj ji.
2. **Žádná reálná platba ani sběr osobních údajů.** Platba je jen simulace (tlačítko „Zaplatit (simulace)“). Formulářová data se nikam neodesílají.
3. **Žádná osobní data v analytice.** `track()` smí poslat jen: název eventu, variantu, číslo a název kroku, oblast, počet cestujících, zvolenou variantu krytí, cenu zaokrouhlenou na stovky. Nikdy jména, e-maily, telefony, data narození ani jiný obsah formulářů. Povolené parametry hlídá whitelist v `src/analytics/track.ts`.
4. **Git.** Nikdy nedělej `git commit`, `git push` ani nezakládej GitHub Pages. To dělá Milan. Na konci fáze navrhni commit message.
5. **Práce po fázích.** Po každé fázi se zastav, shrň co jsi udělal, co jsi předpokládal a co má Milan zkontrolovat. Pokračuj až po „OK“.
6. **Nejistota v pojišťovnictví.** Když si nejsi jistý faktem (regulace, zvyklosti trhu), nevymýšlej. Označ místo `TODO(Milan): ověřit`. Nevymýšlej statistiky trhu.

## Styl českých textů (UI i case study)

- První osoba jednotného čísla („Navrhl jsem“, „Předpokládám“).
- Krátké věty.
- Žádné pomlčky ani dvojtečky uprostřed vět. Místo nich tečka nebo čárka.
- Žádné marketingové fráze („revoluční“, „bezproblémový“, „posouvá na novou úroveň“, „jednoduše a rychle“).
- Kontrolu dělá skill `.claude/skills/kontrola-textu`.

## Technologie

- Vite + React + TypeScript, Tailwind CSS v4, `HashRouter` (GitHub Pages).
- `base` ve `vite.config.ts` je `/cestovni-pojisteni-prototyp/`.
- Vitest pro testy, ESLint (včetně jsx-a11y), Prettier.
- Mobile first, ovladatelné klávesnicí, kontrast WCAG AA.
- Žádný backend. `localStorage` vždy obalit `try/catch`.

## Struktura

- `src/pricing/` cenový model. Všechny smyšlené ceny jsou v `src/pricing/config.ts`.
- `src/analytics/` A/B přidělení a měřicí vrstva `track(event, params)`.
- `src/pages/` stránky `#/`, `#/sjednani`, `#/vysledky`.
- `src/components/` sdílené komponenty obou variant.

## Příkazy

- `npm run dev` vývojový server
- `npm run test` unit testy
- `npm run build` produkční build
- `npm run lint` ESLint
- `npm run format` Prettier
