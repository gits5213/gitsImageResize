import { describe, expect, it } from 'vitest'
import { ImageProcessingError, toUserMessage } from './imageErrors.ts'

describe('toUserMessage', () => {
  it('keeps messages raised by the image pipeline', () => {
    expect(toUserMessage(new ImageProcessingError('Choose a smaller size.'))).toBe(
      'Choose a smaller size.',
    )
  })

  it('hides memory and unexpected internal details', () => {
    expect(toUserMessage(new Error('allocation failed at 0xdead'))).toBe(
      'Unable to resize this image. Please try smaller dimensions.',
    )
    expect(toUserMessage(new Error('canvas context exploded'))).not.toMatch(/exploded/)
  })
})
