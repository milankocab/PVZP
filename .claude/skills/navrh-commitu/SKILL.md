---
name: navrh-commitu
description: Projde necommitnuté změny v repozitáři a navrhne rozdělení do commitů podle best practice. U každého commitu vypíše název a seznam souborů, každý soubor právě jednou a dohromady všechny změněné soubory. Nic necommituje ani nepushuje. Použij, když Milan napíše „navrhni commity“, „názvy commitů“, „rozděl změny do commitů“ nebo na konci fáze.
---

# Návrh commitů

Navrhni, jak rozdělit necommitnuté změny do commitů. Výstupem je jen text. Git a GitHub spravuje výhradně Milan.

## Zákaz

- Nikdy nespouštěj `git add`, `git commit`, `git push`, `git restore`, `git reset`, `git stash`, `git checkout`, `git branch` ani `gh`.
- Povolené jsou jen čtecí příkazy: `git status`, `git diff`, `git log`, `git show`.

## Postup

1. Zjisti seznam všech změn: `git status --porcelain -uall`. Patří sem upravené (`M`), nové (`??`), smazané (`D`) i přejmenované (`R`) soubory. Nesleduj jen `git diff`, nové soubory v něm nejsou.
2. Projdi obsah změn: `git diff --stat`, potom `git diff <soubor>` a u nových souborů jejich obsah. Pochop, co se v každém souboru změnilo a proč.
3. Zjisti závislosti. Kdo importuje nový soubor, kdo používá změněné API (přejmenované props, odebrané exporty, změněné typy). Pomůže `grep` na importy.
4. Seskup soubory do commitů:
   - Jeden commit je jedna logická změna (funkce, oprava, refaktoring, závislosti, dokumentace).
   - Soubor může být jen v jednom commitu. Pokud soubor obsahuje víc logických změn, zařaď ho do commitu s jeho hlavní změnou a v popisu commitu zmiň i ty vedlejší.
   - Test patří do stejného commitu jako kód, který testuje.
   - `package.json` a `package-lock.json` jdou vždy spolu.
   - Pořadí commitů volím tak, aby každý commit šel sestavit (`npm run build`) a prošly testy. Nejdřív sdílené základy (závislosti, design tokeny, sdílené komponenty, cenový model), pak funkce, které je používají. Když to kvůli provázanosti souborů nejde, napiš to u konkrétního commitu.
5. Ověř úplnost. Sjednocení souborů ze všech commitů se musí rovnat výstupu `git status --porcelain -uall`. Žádný soubor nesmí chybět a žádný se nesmí opakovat. Kontrolu udělej doslova, porovnáním seznamů.

## Styl názvu commitu

Navazuj na styl historie (`git log --format=%s -15`). V tomto projektu:

- Česky, věta v infinitivu nebo jmenná fráze, začíná velkým písmenem, bez tečky na konci.
- Do 72 znaků. Říká co a proč, ne jak.
- Bez Conventional Commits prefixů (`feat:`), pokud je Milan nezačne používat.
- Pod názvem volitelně 1 až 3 odrážky těla s detaily.
- Na konec těla patří řádek `Co-Authored-By`, pokud ho vyžaduje systémová instrukce.

## Formát výstupu

Pro každý commit v pořadí, v jakém se mají dělat:

```
### 1. <Název commitu>
<volitelné tělo, odrážky>

Soubory:
- cesta/k/souboru
- ...
```

Na konci:

- Kontrolní řádek „Celkem N souborů v M commitech, odpovídá `git status`.“
- Pro každý commit připravený příkaz, který si Milan spustí sám, např. `git add a b c && git commit -m "…"`. Výslovně uveď, že příkazy nespouštím.
- Upozornění na commity, které samostatně nejdou sestavit, a na soubory, které by asi do repozitáře patřit neměly (tajné klíče, `.env`, build výstupy, osobní poznámky).
