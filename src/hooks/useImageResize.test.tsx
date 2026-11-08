import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageProcessingError } from '../services/imageErrors.ts'
import { readSourceImage, resizeImage } from '../services/imageResizeService.ts'
import type { LoadedImage, ResizedImage } from '../types/image.types.ts'
import { useImageResize } from './useImageResize.ts'

vi.mock('../services/imageResizeService.ts', () => ({
  readSourceImage: vi.fn(),
  resizeImage: vi.fn(),
  detectCanvasLimits: vi.fn(() => ({ maxSide: 8192, maxPixels: 16_000_000 })),
}))

const readMock = vi.mocked(readSourceImage)
const resizeMock = vi.mocked(resizeImage)

function loadedImage(): LoadedImage {
  return {
    bitmap: { close: vi.fn() } as unknown as ImageBitmap,
    image: {
      filename: 'vacation.jpg',
      format: 'jpeg',
      width: 1920,
      height: 1080,
      byteSize: 2048,
      previewUrl: 'blob:source',
    },
  }
}

describe('useImageResize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
  })

  it('links dimensions, then resets them and the aspect lock', async () => {
    readMock.mockResolvedValue(loadedImage())
    const { result } = renderHook(() => useImageResize())
    const file = new File([Uint8Array.from([1])], 'vacation.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await result.current.selectFile(file)
    })

    act(() => result.current.changeWidth('960'))
    expect(result.current.heightInput).toBe('540')

    act(() => result.current.toggleLock())
    act(() => result.current.changeWidth('100'))
    expect(result.current.heightInput).toBe('540')

    act(() => result.current.resetDimensions())
    expect(result.current.widthInput).toBe('1920')
    expect(result.current.heightInput).toBe('1080')
    expect(result.current.lockAspect).toBe(true)
  })

  it('clears the image and releases temporary URLs', async () => {
    const loaded = loadedImage()
    readMock.mockResolvedValue(loaded)
    const { result } = renderHook(() => useImageResize())
    const file = new File([Uint8Array.from([1])], 'vacation.jpg', { type: 'image/jpeg' })

    await act(async () => {
      await result.current.selectFile(file)
    })
    act(() => result.current.clearImage())

    expect(result.current.source).toBeNull()
    expect(result.current.resized).toBeNull()
    expect(result.current.widthInput).toBe('')
    expect(loaded.bitmap.close).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:source')
  })

  it('shows visitor-safe errors and can resize after a valid load', async () => {
    readMock.mockRejectedValueOnce(
      new ImageProcessingError(
        'This file type is not supported. Upload a JPEG, PNG, or WebP image.',
      ),
    )
    const { result } = renderHook(() => useImageResize())
    const file = new File([Uint8Array.from([1])], 'notes.txt', { type: 'text/plain' })

    await act(async () => {
      await result.current.selectFile(file)
    })
    expect(result.current.error).toMatch(/not supported/)
    expect(result.current.source).toBeNull()

    readMock.mockResolvedValueOnce(loadedImage())
    resizeMock.mockResolvedValue({
      width: 800,
      height: 450,
      byteSize: 100,
      format: 'jpeg',
      previewUrl: 'blob:resized',
      blob: new Blob(['jpeg']),
    } satisfies ResizedImage)

    await act(async () => {
      await result.current.selectFile(file)
    })
    act(() => result.current.changeWidth('800'))
    await act(async () => {
      await result.current.resize()
    })
    expect(result.current.resized?.width).toBe(800)
    expect(result.current.resized?.height).toBe(450)
    expect(result.current.error).toBeNull()

    resizeMock.mockRejectedValueOnce(
      new Error('Out of memory while allocating secret-detail'),
    )
    act(() => result.current.changeWidth('640'))
    await act(async () => {
      await result.current.resize()
    })
    expect(result.current.error).toBe(
      'Unable to resize this image. Please try smaller dimensions.',
    )
    expect(result.current.error).not.toContain('secret-detail')
  })
})
