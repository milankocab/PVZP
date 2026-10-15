import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CaseStudyPage } from './CaseStudyPage'

describe('CaseStudyPage', () => {
  it('má úvod s odkazy na obě varianty a všechny sekce', () => {
    render(
      <MemoryRouter>
        <CaseStudyPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Vyzkoušet variantu A' })).toHaveAttribute(
      'href',
      '/sjednani?v=a',
    )
    expect(screen.getByRole('link', { name: 'Vyzkoušet variantu B' })).toHaveAttribute(
      'href',
      '/sjednani?v=b',
    )
    for (const title of [
      '1. Cíl',
      '2. Jak poznám manažera',
      '3. Balíčky a ceny',
      '4. Hypotézy',
      '5. Varianty A a B',
      '6. Návrh experimentu',
      '7. Měření',
      '8. Jak bych test provedl v reálném provozu',
      '9. Jak jsem pracoval s AI',
      '10. Plán prvních 90 dní',
      '11. Omezení prototypu',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
    }
  })
})
