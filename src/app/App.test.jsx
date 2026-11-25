import { Suspense } from 'react'
import { expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import App from '.'

test('renders without crashing', () => {
  render(<Suspense fallback="loading"><App /></Suspense>)
  expect(screen.getByText('BluePilot Flasher')).toBeInTheDocument()
})

test('AGNOS picker lists BluePilot versions for the chosen device', () => {
  render(<Suspense fallback="loading"><App /></Suspense>)
  fireEvent.click(screen.getByText('Start'))
  fireEvent.click(screen.getByText('comma four'))
  fireEvent.click(screen.getByText('Next'))

  const options = [...screen.getByTestId('version-select').querySelectorAll('option')].map((o) => o.textContent)
  expect(options).toEqual([
    'AGNOS 19.9 (recommended) — BluePilot 7.1',
    'AGNOS 18.5 — BluePilot 7.0',
    'AGNOS 16 — BluePilot 6.0',
    'AGNOS 18.3 — openpilot 0.11.1',
    'AGNOS 17.2 — openpilot 0.11.0',
  ])
})
