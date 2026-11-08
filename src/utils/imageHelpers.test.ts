import { describe, expect, it } from 'vitest'
import {
  buildDownloadFilename,
  formatDimensions,
  formatFileSize,
  isOutputFormat,
  linkedDimension,
  maxBytesFromInput,
  reductionPercent,
} from './imageHelpers.ts'

describe('linkedDimension', () => {
  it('keeps a 16:9 image in proportion', () => {
    expect(linkedDimension(1920, 1080, 960, 'width')).toBe(540)
    expect(linkedDimension(1920, 1080, 540, 'height')).toBe(960)
  })

  it('rounds calculated pixels to a positive integer', () => {
    expect(linkedDimension(1920, 1080, 100, 'width')).toBe(56)
    expect(linkedDimension(1920, 1080, 1, 'height')).toBe(2)
  })
})

describe('formatFileSize', () => {
  it('formats bytes, kilobytes, and megabytes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(formatFileSize(2.4 * 1024 * 1024)).toBe('2.4 MB')
  })
})

describe('formatDimensions', () => {
  it('uses a multiplication sign', () => {
    expect(formatDimensions(1920, 1080)).toBe('1920 × 1080 pixels')
  })
})

describe('buildDownloadFilename', () => {
  it('appends the output size and extension', () => {
    expect(buildDownloadFilename('vacation.jpg', 800, 450, 'jpeg')).toBe(
      'vacation-800x450.jpg',
    )
    expect(buildDownloadFilename('my photo.PNG', 10, 10, 'png')).toBe(
      'my-photo-10x10.png',
    )
  })

  it('drops path segments and markup from the original name', () => {
    expect(buildDownloadFilename('../../secret.png', 8, 4, 'png')).toBe('secret-8x4.png')
    expect(buildDownloadFilename('<img onerror=alert(1)>.png', 8, 4, 'png')).not.toMatch(
      /[<>]/,
    )
    expect(buildDownloadFilename('***', 1, 1, 'jpeg')).toBe('image-1x1.jpg')
  })
})

describe('maxBytesFromInput', () => {
  it('treats a blank value as no limit', () => {
    expect(maxBytesFromInput('  ', 'kb')).toEqual({ ok: true, bytes: null })
  })

  it('converts kilobytes and megabytes', () => {
    expect(maxBytesFromInput('500', 'kb')).toEqual({ ok: true, bytes: 500 * 1024 })
    expect(maxBytesFromInput('2', 'mb')).toEqual({ ok: true, bytes: 2 * 1024 * 1024 })
  })

  it('rejects zero, text, and sizes above 50 MB', () => {
    expect(maxBytesFromInput('0', 'kb').ok).toBe(false)
    expect(maxBytesFromInput('abc', 'mb').ok).toBe(false)
    expect(maxBytesFromInput('51', 'mb').ok).toBe(false)
  })
})

describe('reductionPercent', () => {
  it('rounds the share of bytes removed', () => {
    expect(reductionPercent(1000, 250)).toBe(75)
    expect(reductionPercent(1000, 1000)).toBeNull()
    expect(reductionPercent(1000, 1200)).toBeNull()
  })
})

describe('isOutputFormat', () => {
  it('accepts only PNG and JPG downloads', () => {
    expect(isOutputFormat('png')).toBe(true)
    expect(isOutputFormat('jpeg')).toBe(true)
    expect(isOutputFormat('gif')).toBe(false)
    expect(isOutputFormat('webp')).toBe(false)
  })
})
