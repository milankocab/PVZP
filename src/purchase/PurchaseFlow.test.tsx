import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
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

function renderFlow(preselectedPlan: 'comfort' | null = null) {
  render(
    <MemoryRouter>
      <PurchaseFlow preselectedPlan={preselectedPlan} upsellEnabled={false} />
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
    renderFlow()
    expect(screen.getByRole('heading', { name: 'Kam a kdy jedete' })).toBeInTheDocument()
    fillTrip()

    expect(screen.getByRole('heading', { name: 'Vyberte balíček' })).toBeInTheDocument()
    clickContinue()
    expect(screen.getByText('Vyberte balíček.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: /Komfort/ }))
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Doplňky a vaše potřeby' })).toBeInTheDocument()
    clickContinue()
    expect(screen.getByText(/jestli pojedete na hory/)).toBeInTheDocument()
    answer(/lyžovat/, 'Ne')
    answer(/zaplacený zájezd/, 'Ne')
    clickContinue()

    expect(
      screen.getByRole('heading', { name: 'Údaje pojistníka a cestujících' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Vyplnit ukázková data' }))
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Shrnutí a souhlasy' })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/pojistnými podmínkami/))
    fireEvent.click(screen.getByLabelText(/zpracovává osobní údaje/))
    clickContinue()

    expect(screen.getByRole('heading', { name: 'Platba' })).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText(/Apple Pay/))
    fireEvent.click(screen.getAllByRole('button', { name: /Zaplatit \(simulace\)/ })[0])

    expect(
      screen.getByRole('heading', { name: 'Hotovo. Pojištění je sjednané.' }),
    ).toBeInTheDocument()
  })

  it('ve variantě B je Komfort předvybraný', () => {
    renderFlow('comfort')
    fillTrip()
    expect(screen.getByRole('radio', { name: /Komfort/ })).toBeChecked()
  })

  it('u sdíleného kufru v Základu upozorní a nabídne Komfort', () => {
    renderFlow()
    fillTrip()
    fireEvent.click(screen.getByRole('radio', { name: /Základ/ }))
    clickContinue()
    answer(/lyžovat/, 'Ne')
    answer(/zaplacený zájezd/, 'Ne')
    clickContinue()

    const dialog = screen.getByRole('dialog', { name: /méně kufrů/ })
    expect(dialog).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: /Přejít na Komfort/ }))
    clickContinue()
    expect(
      screen.getByRole('heading', { name: 'Údaje pojistníka a cestujících' }),
    ).toBeInTheDocument()
  })

  it('cena se ukáže až po vyplnění cesty', () => {
    renderFlow()
    expect(screen.getAllByText('Vyplňte cestu').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Vyplnit ukázkovou cestu' }))
    // Bez vybraného balíčku je vidět cena „od“ nejlevnějšího balíčku.
    expect(screen.getAllByText(/^od /).length).toBeGreaterThan(0)
  })
})
