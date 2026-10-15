import { fireEvent, render, screen } from '@testing-library/react'
import { SampleSizeCalculator } from './SampleSizeCalculator'

describe('SampleSizeCalculator', () => {
  it('pro AOV spočítá objednávky, návštěvy a délku aspoň 2 týdny', () => {
    render(<SampleSizeCalculator />)
    // 2 × (1,96 + 0,84)² × 200² / 29² = 746,6, zaokrouhleno nahoru.
    expect(screen.getByText('747')).toBeInTheDocument()
    expect(screen.getByText('7 470')).toBeInTheDocument()
    expect(screen.getByText('2 týdny')).toBeInTheDocument()
  })

  it('pro konverzi vrátí 55 252 návštěv a 6 týdnů', () => {
    render(<SampleSizeCalculator />)
    fireEvent.click(screen.getByLabelText('Konverze, ochranná metrika'))
    expect(screen.getByText('55 252')).toBeInTheDocument()
    expect(screen.getByText('6 týdnů')).toBeInTheDocument()
  })

  it('u neplatného vstupu ukáže chybu místo výsledku', () => {
    render(<SampleSizeCalculator />)
    fireEvent.change(screen.getByLabelText('Dnešní AOV'), { target: { value: '' } })
    expect(screen.getByText(/Zkontrolujte vstupy/)).toBeInTheDocument()
  })
})
