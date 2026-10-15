import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { PurchasePage } from '../pages/PurchasePage'

function ShowSearch() {
  return <output data-testid="search">{useLocation().search}</output>
}

function renderPage(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
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
}

describe('DebugBar', () => {
  beforeAll(() => {
    window.scrollTo = () => {}
  })

  it('přepne variantu přes ?v a zachová ostatní parametry', () => {
    renderPage('/sjednani?v=a&upsell=1')
    fireEvent.click(screen.getByRole('button', { name: /Režim ukázky/ }))
    const abGroup = screen.getByRole('group', { name: 'A/B test' })
    expect(within(abGroup).getByText('A · bez předvolby')).toBeInTheDocument()
    fireEvent.click(within(abGroup).getByRole('button', { name: 'Přepnout na B' }))
    expect(within(abGroup).getByText('B · předvybraný Komfort')).toBeInTheDocument()
    expect(screen.getByTestId('search').textContent).toBe('?v=b&upsell=1')
  })

  it('vynutí segment manažera a vynucení zase zruší', () => {
    renderPage('/sjednani?v=b')
    fireEvent.click(screen.getByRole('button', { name: /Režim ukázky/ }))
    const segmentGroup = screen.getByRole('group', { name: 'Segment' })
    fireEvent.click(within(segmentGroup).getByRole('button', { name: 'Vynutit manažera' }))
    expect(screen.getByTestId('search').textContent).toBe('?v=b&segment=manazer')
    expect(within(segmentGroup).getByText('Manažer, vynucený')).toBeInTheDocument()
    fireEvent.click(within(segmentGroup).getByRole('button', { name: 'Zrušit vynucení' }))
    expect(screen.getByTestId('search').textContent).toBe('?v=b')
  })

  it('je ve výchozím stavu sbalená', () => {
    renderPage('/sjednani?v=b')
    expect(screen.getByRole('button', { name: /Režim ukázky/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  it('vysvětlení ukáže po kliknutí na i', () => {
    renderPage('/sjednani?v=b')
    const tooltip = screen.getAllByRole('tooltip', { hidden: true })[0]
    expect(tooltip).not.toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Co je přepínač variant' }))
    expect(tooltip).toBeVisible()
    expect(tooltip).toHaveTextContent('Na ostrém webu by návštěvník dostal jednu variantu')
  })
})
