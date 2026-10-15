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
      '2. Problém',
      '3. Varianty a hypotézy',
      '4. Návrh experimentu',
      '5. Měření',
      '6. Jak bych test provedl v reálném provozu',
      '7. Jak jsem pracoval s AI',
      '8. Plán prvních 90 dní',
      '9. Omezení prototypu',
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument()
    }
  })
})
