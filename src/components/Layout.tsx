import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* HashRouter používá # pro stránky. Odkaz #obsah by přepnul stránku, proto fokus řeším ručně. */}
      <a
        href="#obsah"
        onClick={(event) => {
          event.preventDefault()
          document.getElementById('obsah')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Přeskočit na obsah
      </a>
      <header className="border-b border-slate-200">
        <nav
          aria-label="Hlavní navigace"
          className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3"
        >
          <Link to="/" className="flex min-h-11 shrink-0 items-center">
            <img
              src={`${import.meta.env.BASE_URL}brand/odjezd-logo.png`}
              alt="Odjezd"
              width={102}
              height={32}
            />
          </Link>
          <ul className="flex gap-4 text-sm">
            <li>
              <Link to="/" className="underline-offset-4 hover:underline">
                Case study
              </Link>
            </li>
            <li>
              <Link to="/sjednani" className="underline-offset-4 hover:underline">
                Prototyp
              </Link>
            </li>
            <li>
              <Link to="/vysledky" className="underline-offset-4 hover:underline">
                Měření
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main id="obsah" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-slate-50">
        <p className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-700">
          Koncept vytvořený jako ukázka produktové práce. Nejde o produkt žádné pojišťovny, ceny i
          podmínky jsou smyšlené.
        </p>
      </footer>
    </div>
  )
}
