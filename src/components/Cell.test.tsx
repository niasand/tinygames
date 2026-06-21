import { fireEvent, render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'

import { ToggleDirection } from '@/types/ToggleDirection'
import Cell from './Cell'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

const renderCell = (cell: ReactElement) => render(
  <MantineProvider>
    {cell}
  </MantineProvider>,
)

describe('Cell', () => {
  it('exposes position and current value through its button label', () => {
    renderCell(<Cell position={7}>O</Cell>)

    expect(screen.getByRole('button', { name: 'Playable cell at row 2, column 2; currently sun' }).matches(':disabled')).toBe(false)
  })

  it('toggles forward on click and backward on context menu', () => {
    const onToggle = vi.fn()
    renderCell(<Cell position={0} onToggle={onToggle}>.</Cell>)

    const cell = screen.getByRole('button', { name: 'Playable cell at row 1, column 1; currently empty' })
    fireEvent.click(cell)
    fireEvent.contextMenu(cell)

    expect(onToggle).toHaveBeenNthCalledWith(1, ToggleDirection.Forward)
    expect(onToggle).toHaveBeenNthCalledWith(2, ToggleDirection.Backward)
  })

  it('keeps locked cells disabled', () => {
    const onToggle = vi.fn()
    renderCell(<Cell canToggle={false} position={5} onToggle={onToggle}>X</Cell>)

    const cell = screen.getByRole('button', { name: 'Locked cell at row 1, column 6; currently moon' })
    fireEvent.click(cell)

    expect(cell.matches(':disabled')).toBe(true)
    expect(onToggle).not.toHaveBeenCalled()
  })
})
