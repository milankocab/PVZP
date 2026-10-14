import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('zobrazí povinnou patičku', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Nejde o produkt žádné pojišťovny/)).toBeInTheDocument()
  })
})
