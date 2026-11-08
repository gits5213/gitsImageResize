import { describe, expect, it } from 'vitest'
import { MAX_FILE_BYTES, PRACTICAL_MAX_PIXELS } from '../config/limits.ts'
import {
  fileSizeMessage,
  parseDimensionInput,
  validateImageFile,
  validatePixelSize,
} from './imageValidation.ts'

const limits = { maxSide: 8192, maxPixels: PRACTICAL_MAX_PIXELS }

function makeFile(bytes: number[], name: string, type: string): File {
  return new File([Uint8Array.from(bytes)], name, { type })
}

const pngHeader = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]
const jpegHeader = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]
const webpHeader = [0x52, 0x49, 0x46, 0x46, 0x18, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]

describe('parseDimensionInput', () => {
  it('accepts positive whole numbers', () => {
    expect(parseDimensionInput(' 800 ')).toEqual({ ok: true, value: 800 })
  })

  it('rejects empty, zero, negative, decimal, and text values', () => {
    for (const value of ['', '0', '-5', '12.5', 'abc', '1e2', '+8', '08']) {
      const result = parseDimensionInput(value)
      expect(result.ok).toBe(false)
    }
  })
})

describe('validatePixelSize', () => {
  it('accepts a normal size', () => {
    expect(validatePixelSize(800, 450, limits)).toBeNull()
  })

  it('rejects non-positive and oversized dimensions', () => {
    expect(validatePixelSize(0, 10, limits)).toMatch(/positive whole number/)
    expect(validatePixelSize(8193, 10, limits)).toMatch(/maximum side length/)
    expect(validatePixelSize(5000, 5000, limits)).toMatch(/smaller dimensions/)
  })
})

describe('fileSizeMessage', () => {
  it('rejects empty and oversized files without reading their bytes', () => {
    expect(fileSizeMessage(0)).toMatch(/empty/)
    expect(fileSizeMessage(MAX_FILE_BYTES + 1)).toMatch(/50 MB/)
    expect(fileSizeMessage(1024)).toBeNull()
  })
})

describe('validateImageFile', () => {
  it('accepts JPEG, PNG, and WebP signatures', async () => {
    await expect(
      validateImageFile(makeFile(jpegHeader, 'photo.jpg', 'image/jpeg')),
    ).resolves.toEqual({
      ok: true,
      format: 'jpeg',
    })
    await expect(
      validateImageFile(makeFile(pngHeader, 'photo.png', 'image/png')),
    ).resolves.toEqual({
      ok: true,
      format: 'png',
    })
    await expect(
      validateImageFile(makeFile(webpHeader, 'photo.webp', 'image/webp')),
    ).resolves.toEqual({
      ok: true,
      format: 'webp',
    })
  })

  it('accepts other common image signatures', async () => {
    const cases: Array<[number[], string, string, string]> = [
      [[0x47, 0x49, 0x46, 0x38, 0x39, 0x61], 'anim.gif', 'image/gif', 'gif'],
      [[0x42, 0x4d, 0, 0], 'scan.bmp', 'image/bmp', 'bmp'],
      [[0x49, 0x49, 0x2a, 0], 'scan.tif', 'image/tiff', 'tiff'],
      [[0, 0, 1, 0], 'icon.ico', 'image/x-icon', 'ico'],
      [
        [0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],
        'photo.avif',
        'image/avif',
        'avif',
      ],
      [
        [0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63],
        'photo.heic',
        'image/heic',
        'heic',
      ],
    ]
    for (const [bytes, name, type, format] of cases) {
      await expect(validateImageFile(makeFile(bytes, name, type))).resolves.toEqual({
        ok: true,
        format,
      })
    }
    const svg = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"></svg>'],
      'icon.svg',
      { type: 'image/svg+xml' },
    )
    await expect(validateImageFile(svg)).resolves.toEqual({ ok: true, format: 'svg' })
  })

  it('rejects unsupported types and corrupted signatures', async () => {
    const text = makeFile([104, 101, 108, 108, 111], 'notes.txt', 'text/plain')
    await expect(validateImageFile(text)).resolves.toMatchObject({ ok: false })

    const scripted = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
      'icon.svg',
      { type: 'image/svg+xml' },
    )
    await expect(validateImageFile(scripted)).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/active content/) as unknown as string,
    })

    const corrupt = makeFile(
      [0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0],
      'broken.png',
      'image/png',
    )
    await expect(validateImageFile(corrupt)).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/corrupted/) as unknown as string,
    })
  })

  it('rejects a mime type that disagrees with the extension', async () => {
    const mismatched = makeFile(pngHeader, 'photo.jpg', 'image/png')
    await expect(validateImageFile(mismatched)).resolves.toMatchObject({
      ok: false,
      message: expect.stringMatching(/does not match/) as unknown as string,
    })
  })
})
