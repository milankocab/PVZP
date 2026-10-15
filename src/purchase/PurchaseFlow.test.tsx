import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { clearStoredEvents, getStoredEvents } from '../analytics/track'
import { PurchaseFlow } from './PurchaseFlow'

// jsdom zatím neumí modální <dialog>, doplníme minimum pro test.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
  }
  window.scrollTo = () => {}
})

function renderFlow(variant: 'a' | 'b' = 'a', upsellEnabled = false) {
  window.scrollTo = () => {}
  render(
    <MemoryRouter>
      <PurchaseFlow variant={variant} upsellEnabled={upsellEnabled} />
    </MemoryRouter>,
  )
}

const clickContinue = () =>
  fireEvent.click(screen.getAllByRole('button', { name: /^Pokračovat$/ })[0])

function answer(groupName: RegExp, option: string) {
  fireEvent.click(within(screen.getByRole('group', { name: groupName })).getByLabelText(option))
}

function fillTrip() {
  fireEvent.click(screen.getByRole('button', { name: 'Vyplnit ukázkovou cestu' }))
  clickContinue()
}

describe('PurchaseFlow', () => {
  it('projde celý postup až k simulované platbě', () => {
    clearStoredEvents()
    renderFlow()
    expect(screen.getByRole('heading', { name: 'Vaše cesta' })).toBeInTheDocument()
    fillTrip()

    expect(screen.getByRole('heading', { name: 'Vyberte balíček' })).toBeInTheDocument()
    clickContinue()
    expect(screen.getByText('Vyberte balíček.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /Komfort/ }))
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Doplňky' })).toBeInTheDocument()
    clickContinue()
    expect(screen.getByText(/jestli budete sportovat/)).toBeInTheDocument()
    answer(/sportovat/, 'Ano')
    clickContinue()
    expect(screen.getByText(/jaké sporty plánujete/)).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/Lyže a snowboard/))
    expect(screen.getByText(/Přidali jsme připojištění/)).toBeInTheDocument()
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Vaše údaje' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Vyplnit ukázková data' }))
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Shrnutí' })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/pojistnými podmínkami/))
    fireEvent.click(screen.getByLabelText(/zpracovává osobní údaje/))
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Platba' })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/Apple Pay/))
    fireEvent.click(screen.getAllByRole('button', { name: /Zaplatit \(simulace\)/ })[0])

    expect(
      screen.getByRole('heading', { name: 'Hotovo. Pojištění je sjednané.' }),
    ).toBeInTheDocument()

    const events = getStoredEvents()
    const names = events.map((event) => event.name)
    expect(names[0]).toBe('funnel_start')
    expect(names).toContain('price_shown')
    expect(names).toContain('plan_selected')
    expect(names).toContain('validation_error')
    expect(names).toContain('checkout_click')
    expect(names).toContain('payment_started')
    const sports = events.find((event) => event.name === 'addon_toggled')
    expect(sports?.params).toMatchObject({ addon: 'winterSports', enabled: true })
    const steps = events
      .filter((event) => event.name === 'step_view')
      .map((event) => event.params.step_number)
    expect(steps).toEqual([1, 2, 3, 4, 5, 6])
    const purchase = events.find((event) => event.name === 'purchase_simulated')
    expect(purchase?.params).toMatchObject({ variant: 'a', plan: 'comfort', segment: 'manager' })
    expect(purchase?.params.price).toBeGreaterThan(0)

    // Do měření se nesmí dostat žádné osobní údaje z formuláře.
    const serialized = JSON.stringify(events)
    expect(serialized).not.toMatch(/Ukázkov|example\.com|777|1986|1984/)
  })

  it('ve variantě B je Komfort předvybraný', () => {
    renderFlow('b')
    fillTrip()
    expect(screen.getByRole('radio', { name: /Komfort/ })).toBeChecked()
  })

  it('u sdíleného kufru v Základu upozorní a nabídne Komfort', () => {
    renderFlow()
    fillTrip()
    fireEvent.click(screen.getByRole('radio', { name: /Základ/ }))
    clickContinue()
    expect(screen.getByText(/platí na jeden kufr, ne na osobu/)).toBeInTheDocument()
    answer(/sportovat/, 'Ne')
    clickContinue()

    const dialog = screen.getByRole('dialog', { name: /méně kufrů/ })
    expect(dialog).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: /Přejít na Komfort/ }))
    clickContinue()
    expect(screen.getByRole('heading', { name: 'Vaše údaje' })).toBeInTheDocument()
  })

  it('cena se ukáže až po vyplnění cesty', () => {
    renderFlow()
    expect(screen.getAllByText('Vyplňte cestu').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Vyplnit ukázkovou cestu' }))
    // Bez vybraného balíčku je vidět cena „od“ nejlevnějšího balíčku.
    const prices = screen.getAllByText('Cena celkem').map((label) => label.nextElementSibling)
    expect(prices[0]?.textContent).toMatch(/^od /)
  })

  it('nabídka vyššího balíčku ukáže rozdíly a po přijetí zmizí', () => {
    clearStoredEvents()
    renderFlow('a', true)
    fillTrip()
    fireEvent.click(screen.getByRole('radio', { name: /Základ/ }))
    const offer = screen.getByRole('region', { name: /máte Komfort/ })
    expect(within(offer).getByText('Zavazadla a elektronika na jeden kufr')).toBeInTheDocument()
    fireEvent.click(within(offer).getByRole('button', { name: /Změnit na Komfort/ }))
    expect(screen.getByRole('radio', { name: /Komfort/ })).toBeChecked()
    expect(screen.queryByRole('region', { name: /máte/ })).not.toBeInTheDocument()
    clickContinue()
    expect(screen.queryByRole('region', { name: /máte/ })).not.toBeInTheDocument()
    const names = getStoredEvents().map((event) => event.name)
    expect(names).toContain('upsell_shown')
    expect(names).toContain('upsell_accepted')
  })

  it('„Teď ne“ schová nabídku jen v daném kroku', () => {
    renderFlow('b', true)
    fillTrip()
    fireEvent.click(screen.getByRole('button', { name: 'Teď ne' }))
    expect(screen.queryByRole('region', { name: /máte Prémium/ })).not.toBeInTheDocument()
    clickContinue()
    expect(screen.getByRole('region', { name: /máte Prémium/ })).toBeInTheDocument()
  })
})
