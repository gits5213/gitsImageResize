import { describe, expect, it, vi } from 'vitest'
import { selectBlobUnderLimit } from './fileSizeLimit.ts'

function blobOf(size: number): Blob {
  return new Blob([new Uint8Array(size)])
}

describe('selectBlobUnderLimit', () => {
  it('keeps a high-quality JPG that is already under the limit', async () => {
    const encode = vi.fn(async () => blobOf(100))
    const blob = await selectBlobUnderLimit({
      format: 'jpeg',
      maxBytes: 500,
      encode,
    })
    expect(blob.size).toBe(100)
    expect(encode).toHaveBeenCalledTimes(1)
    expect(encode).toHaveBeenCalledWith(0.92)
  })

  it('lowers JPG quality until the file fits', async () => {
    const encode = vi.fn(async (quality?: number) =>
      blobOf(quality !== undefined && quality > 0.5 ? 1000 : 200),
    )
    const blob = await selectBlobUnderLimit({
      format: 'jpeg',
      maxBytes: 400,
      encode,
    })
    expect(blob.size).toBe(200)
  })

  it('explains when even the smallest JPG is too large', async () => {
    const encode = vi.fn(async () => blobOf(5000))
    await expect(
      selectBlobUnderLimit({ format: 'jpeg', maxBytes: 1024, encode }),
    ).rejects.toThrow(/cannot be reduced to 1.0 KB/)
  })

  it('asks for JPG when a PNG cannot reach the limit', async () => {
    const encode = vi.fn(async () => blobOf(8000))
    await expect(
      selectBlobUnderLimit({ format: 'png', maxBytes: 1024, encode }),
    ).rejects.toThrow(/Choose JPG/)
    expect(encode).toHaveBeenCalledTimes(1)
  })

  it('uses the normal JPG quality when no maximum is set', async () => {
    const encode = vi.fn(async () => blobOf(4000))
    const blob = await selectBlobUnderLimit({
      format: 'jpeg',
      maxBytes: null,
      encode,
    })
    expect(blob.size).toBe(4000)
    expect(encode).toHaveBeenCalledWith(0.92)
  })
})
