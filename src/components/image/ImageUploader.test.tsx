import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ImageUploader } from './ImageUploader.tsx'

describe('ImageUploader', () => {
  it('passes the file selected from the browse control', async () => {
    const onFile = vi.fn()
    render(<ImageUploader hasImage={false} busy={false} onFile={onFile} />)
    const file = new File([Uint8Array.from([1, 2, 3])], 'photo.png', {
      type: 'image/png',
    })
    await userEvent.upload(screen.getByTestId('file-input'), file)
    expect(onFile).toHaveBeenCalledWith(file, false)
  })
})
