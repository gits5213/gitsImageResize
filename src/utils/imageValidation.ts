import { MAX_FILE_BYTES } from '../config/limits.ts'
import type {
  CanvasLimits,
  DimensionParse,
  FileValidation,
  ImageFormat,
} from '../types/image.types.ts'

const DIMENSION_MESSAGE =
  'Enter a positive whole number of pixels. Zero, decimals, and negative values are not allowed.'

const UNSUPPORTED_MESSAGE =
  'This file type is not supported. Upload a JPEG, PNG, or WebP image.'

const CORRUPT_MESSAGE =
  'This file could not be read as a valid JPEG, PNG, or WebP image. It may be corrupted.'

export function fileSizeMessage(size: number): string | null {
  if (!Number.isFinite(size) || size <= 0) return 'The selected file is empty.'
  if (size > MAX_FILE_BYTES) {
    return 'This file is too large to process safely in the browser. The limit is 50 MB.'
  }
  return null
}

export function parseDimensionInput(raw: string): DimensionParse {
  const value = raw.trim()
  if (!/^[1-9]\d*$/.test(value)) return { ok: false, message: DIMENSION_MESSAGE }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) {
    return { ok: false, message: 'That dimension is too large to process.' }
  }
  return { ok: true, value: parsed }
}

export function validatePixelSize(
  width: number,
  height: number,
  limits: CanvasLimits,
): string | null {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1
  ) {
    return DIMENSION_MESSAGE
  }
  if (width > limits.maxSide || height > limits.maxSide) {
    return `These dimensions exceed what this browser can draw. The maximum side length here is ${limits.maxSide.toLocaleString()} pixels. Try a smaller size.`
  }
  if (width * height > limits.maxPixels) {
    return 'Unable to resize this image. Please try smaller dimensions.'
  }
  return null
}

function formatFromExtension(name: string): ImageFormat | null {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'jpg' || extension === 'jpeg') return 'jpeg'
  if (extension === 'png') return 'png'
  if (extension === 'webp') return 'webp'
  return null
}

function formatFromMime(mime: string): ImageFormat | null {
  const normalized = mime.toLowerCase().trim()
  if (
    normalized === 'image/jpeg' ||
    normalized === 'image/jpg' ||
    normalized === 'image/pjpeg'
  ) {
    return 'jpeg'
  }
  if (normalized === 'image/png') return 'png'
  if (normalized === 'image/webp') return 'webp'
  return null
}

function matchesMagic(bytes: Uint8Array, format: ImageFormat): boolean {
  if (format === 'png') {
    return (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    )
  }
  if (format === 'jpeg') {
    return (
      bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    )
  }
  if (bytes.length < 12) return false
  const riff = String.fromCharCode(
    bytes[0] ?? 0,
    bytes[1] ?? 0,
    bytes[2] ?? 0,
    bytes[3] ?? 0,
  )
  const webp = String.fromCharCode(
    bytes[8] ?? 0,
    bytes[9] ?? 0,
    bytes[10] ?? 0,
    bytes[11] ?? 0,
  )
  return riff === 'RIFF' && webp === 'WEBP'
}

export async function validateImageFile(file: File): Promise<FileValidation> {
  const sizeMessage = fileSizeMessage(file.size)
  if (sizeMessage) return { ok: false, message: sizeMessage }

  const fromMime = file.type ? formatFromMime(file.type) : null
  const mimeIsGeneric = file.type === '' || file.type === 'application/octet-stream'
  if (file.type && !mimeIsGeneric && !fromMime) {
    return { ok: false, message: UNSUPPORTED_MESSAGE }
  }

  const fromName = formatFromExtension(file.name)
  if (fromMime && fromName && fromMime !== fromName) {
    return {
      ok: false,
      message:
        'The file extension does not match the image type. Upload a JPEG, PNG, or WebP image.',
    }
  }

  const format = fromMime ?? fromName
  if (!format) return { ok: false, message: UNSUPPORTED_MESSAGE }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer())
  if (!matchesMagic(header, format)) return { ok: false, message: CORRUPT_MESSAGE }

  return { ok: true, format }
}
