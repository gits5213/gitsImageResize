import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_BACKGROUND } from '../../services/backgrounds.ts'
import { BackgroundControls } from './BackgroundControls.tsx'

describe('BackgroundControls', () => {
  it('selects a scenario, a color, and a light focus amount', async () => {
    const onChange = vi.fn()
    const { rerender } = render(
      <BackgroundControls
        value={DEFAULT_BACKGROUND}
        disabled={false}
        onChange={onChange}
      />,
    )

    await userEvent.selectOptions(screen.getByTestId('background-select'), 'beach')
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_BACKGROUND,
      mode: 'scene',
      scene: 'beach',
    })

    rerender(
      <BackgroundControls
        value={{ ...DEFAULT_BACKGROUND, mode: 'color' }}
        disabled={false}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Use color #2563eb' }))
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_BACKGROUND,
      mode: 'color',
      color: '#2563eb',
    })

    await userEvent.selectOptions(screen.getByTestId('background-select'), 'transparent')
    expect(onChange).toHaveBeenLastCalledWith({
      ...DEFAULT_BACKGROUND,
      mode: 'transparent',
    })
  })

  it('disables the choices while the editor is busy', () => {
    render(<BackgroundControls value={DEFAULT_BACKGROUND} disabled onChange={vi.fn()} />)
    expect(screen.getByTestId('background-select')).toBeDisabled()
    expect(screen.getByTestId('light-focus')).toBeDisabled()
  })
})
