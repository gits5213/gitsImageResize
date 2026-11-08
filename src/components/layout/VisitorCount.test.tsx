import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readVisitorCount } from '../../services/visitorCount.ts'
import { VisitorCount } from './VisitorCount.tsx'

vi.mock('../../services/visitorCount.ts', () => ({
  readVisitorCount: vi.fn(),
}))

const readMock = vi.mocked(readVisitorCount)

describe('VisitorCount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a placeholder, then the returned total', async () => {
    readMock.mockResolvedValue(7)
    render(<VisitorCount />)
    expect(screen.getByTestId('visitor-count')).toHaveTextContent('—')
    expect(await screen.findByText('7')).toBeInTheDocument()
    expect(screen.getByTestId('visitor-count')).toHaveTextContent('Visitors')
  })

  it('keeps the placeholder when the count cannot be read', async () => {
    readMock.mockResolvedValue(null)
    render(<VisitorCount />)
    await waitFor(() => expect(readMock).toHaveBeenCalled())
    expect(screen.getByTestId('visitor-count')).toHaveTextContent('—')
  })
})
