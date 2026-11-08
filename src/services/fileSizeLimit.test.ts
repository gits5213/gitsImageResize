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
      preferredBytes: null,
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
      preferredBytes: null,
      encode,
    })
    expect(blob.size).toBe(200)
  })

  it('explains when even the smallest JPG is too large', async () => {
    const encode = vi.fn(async () => blobOf(5000))
    await expect(
      selectBlobUnderLimit({
        format: 'jpeg',
        maxBytes: 1024,
        preferredBytes: null,
        encode,
      }),
    ).rejects.toThrow(/cannot be reduced to 1.0 KB/)
  })

  it('asks for JPG when a PNG cannot reach the limit', async () => {
    const encode = vi.fn(async () => blobOf(8000))
    await expect(
      selectBlobUnderLimit({
        format: 'png',
        maxBytes: 1024,
        preferredBytes: 200,
        encode,
      }),
    ).rejects.toThrow(/Choose JPG/)
    expect(encode).toHaveBeenCalledTimes(1)
  })

  it('uses the normal JPG quality when no maximum is set', async () => {
    const encode = vi.fn(async () => blobOf(4000))
    const blob = await selectBlobUnderLimit({
      format: 'jpeg',
      maxBytes: null,
      preferredBytes: null,
      encode,
    })
    expect(blob.size).toBe(4000)
    expect(encode).toHaveBeenCalledWith(0.92)
  })

  it('compresses a JPG toward a size below the original upload', async () => {
    const encode = vi.fn(async (quality?: number) =>
      blobOf(quality !== undefined && quality > 0.5 ? 102 * 1024 : 60 * 1024),
    )
    const blob = await selectBlobUnderLimit({
      format: 'jpeg',
      maxBytes: null,
      preferredBytes: Math.round(102 * 1024 * 0.6),
      encode,
    })
    expect(blob.size).toBe(60 * 1024)
  })

  it('keeps the smallest JPG when the compression target cannot be reached', async () => {
    const encode = vi.fn(async () => blobOf(80 * 1024))
    const blob = await selectBlobUnderLimit({
      format: 'jpeg',
      maxBytes: null,
      preferredBytes: 20 * 1024,
      encode,
    })
    expect(blob.size).toBe(80 * 1024)
  })

  it('still rejects a hard maximum the compression target did not replace', async () => {
    const encode = vi.fn(async () => blobOf(5000))
    await expect(
      selectBlobUnderLimit({
        format: 'jpeg',
        maxBytes: 1024,
        preferredBytes: 8 * 1024,
        encode,
      }),
    ).rejects.toThrow(/cannot be reduced to 1.0 KB/)
  })
})
