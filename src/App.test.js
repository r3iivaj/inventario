import { render, screen } from '@testing-library/react'
import App from './App'

test('renderiza la navegación Home', () => {
  render(<App />)
  const home = screen.getByText(/Home/i)
  expect(home).toBeInTheDocument()
})
