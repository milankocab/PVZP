import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PurchasePage } from '../pages/PurchasePage'

function ShowSearch() {
  return <output data-testid="search">{useLocation().search}</output>
}

describe('VariantSwitcher', () => {
  beforeAll(() => {
    window.scrollTo = () => {}
  })

  it('přepne variantu přes parametr ?v a zachová ostatní parametry', () => {
    render(
      <MemoryRouter initialEntries={['/sjednani?v=a&segment=manazer']}>
        <Routes>
          <Route
            path="/sjednani"
            element={
              <>
                <PurchasePage />
                <ShowSearch />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('A · bez předvolby')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Přepnout na B' }))
    expect(screen.getByText('B · předvybraný Komfort')).toBeInTheDocument()
    expect(screen.getByTestId('search').textContent).toBe('?v=b&segment=manazer')
  })

  it('vysvětlení ukáže po kliknutí na i', () => {
    render(
      <MemoryRouter initialEntries={['/sjednani?v=b']}>
        <PurchasePage />
      </MemoryRouter>,
    )
    const tooltip = screen.getByRole('tooltip', { hidden: true })
    expect(tooltip).not.toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Co je tento přepínač' }))
    expect(tooltip).toHaveTextContent('Na ostrém webu by nebyl')
  })
})
