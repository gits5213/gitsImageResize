import { MAX_FILE_BYTES } from '../config/limits.ts'
import type {
  CanvasLimits,
  DimensionParse,
  FileValidation,
  SourceFormat,
} from '../types/image.types.ts'

const DIMENSION_MESSAGE =
  'Enter a positive whole number of pixels. Zero, decimals, and negative values are not allowed.'

export const SUPPORTED_UPLOAD_SUMMARY =
  'JPG, PNG, GIF, WebP, BMP, AVIF, ICO, SVG, TIFF, or HEIC'

const UNSUPPORTED_MESSAGE = `This file type is not supported. Upload a ${SUPPORTED_UPLOAD_SUMMARY} image.`

const CORRUPT_MESSAGE =
  'This file could not be read as a valid image. It may be corrupted.'

const MISMATCH_MESSAGE = `The file extension does not match the image type. Upload a ${SUPPORTED_UPLOAD_SUMMARY} image.`

const SVG_SCRIPT_MESSAGE =
  'This SVG file cannot be resized because it contains active content.'

const EXTENSIONS: Record<string, SourceFormat> = {
  jpg: 'jpeg',
  jpeg: 'jpeg',
  jpe: 'jpeg',
  jfif: 'jpeg',
  png: 'png',
  apng: 'png',
  gif: 'gif',
  webp: 'webp',
  bmp: 'bmp',
  dib: 'bmp',
  avif: 'avif',
  ico: 'ico',
  cur: 'ico',
  svg: 'svg',
  tif: 'tiff',
  tiff: 'tiff',
  heic: 'heic',
  heif: 'heic',
  heics: 'heic',
}

const MIMES: Record<string, SourceFormat> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/pjpeg': 'jpeg',
  'image/png': 'png',
  'image/apng': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/x-ms-bmp': 'bmp',
  'image/x-bmp': 'bmp',
  'image/avif': 'avif',
  'image/vnd.microsoft.icon': 'ico',
  'image/x-icon': 'ico',
  'image/svg+xml': 'svg',
  'image/tiff': 'tiff',
  'image/tif': 'tiff',
  'image/heic': 'heic',
  'image/heif': 'heic',
  'image/heic-sequence': 'heic',
}

export const IMAGE_FILE_ACCEPT = [
  'image/*',
  '.jpg',
  '.jpeg',
  '.jpe',
  '.jfif',
  '.png',
  '.gif',
  '.webp',
  '.bmp',
  '.avif',
  '.ico',
  '.cur',
  '.svg',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
].join(',')

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

function formatFromExtension(name: string): SourceFormat | null {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSIONS[extension] ?? null
}

function formatFromMime(mime: string): SourceFormat | null {
  return MIMES[mime.toLowerCase().trim()] ?? null
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  let text = ''
  for (let index = 0; index < length; index += 1) {
    text += String.fromCharCode(bytes[start + index] ?? 0)
  }
  return text
}

function detectSignature(bytes: Uint8Array): SourceFormat | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png'
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg'
  }
  const gif = ascii(bytes, 0, 6)
  if (gif === 'GIF87a' || gif === 'GIF89a') return 'gif'
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp'
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return 'bmp'
  if (
    bytes.length >= 4 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0 && bytes[3] === 0x2a))
  ) {
    return 'tiff'
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0 &&
    bytes[1] === 0 &&
    bytes[3] === 0 &&
    (bytes[2] === 1 || bytes[2] === 2)
  ) {
    return 'ico'
  }
  if (ascii(bytes, 4, 4) === 'ftyp') {
    const brand = ascii(bytes, 8, 4).toLowerCase()
    if (brand === 'avif' || brand === 'avis') return 'avif'
    if (
      brand === 'heic' ||
      brand === 'heix' ||
      brand === 'hevc' ||
      brand === 'hevx' ||
      brand === 'heim' ||
      brand === 'heis' ||
      brand === 'mif1' ||
      brand === 'msf1'
    ) {
      return 'heic'
    }
  }
  return null
}

function svgSample(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, 4096))
}

function svgHasActiveContent(sample: string): boolean {
  return /<script[\s>/]/i.test(sample) || /javascript:/i.test(sample)
}

function looksLikeSvg(sample: string): boolean {
  const trimmed = sample.trimStart()
  return (
    /^<svg[\s>]/i.test(trimmed) ||
    (/^<\?xml/i.test(trimmed) && /<svg[\s>]/i.test(trimmed))
  )
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
    return { ok: false, message: MISMATCH_MESSAGE }
  }

  const header = new Uint8Array(await file.slice(0, 4096).arrayBuffer())
  const signature = detectSignature(header)
  const declared = fromMime ?? fromName
  if (signature && declared && signature !== declared) {
    return { ok: false, message: MISMATCH_MESSAGE }
  }
  if (signature) return { ok: true, format: signature }

  if (declared === 'svg' || (!declared && looksLikeSvg(svgSample(header)))) {
    const sample = svgSample(header)
    if (svgHasActiveContent(sample)) return { ok: false, message: SVG_SCRIPT_MESSAGE }
    if (!looksLikeSvg(sample)) return { ok: false, message: CORRUPT_MESSAGE }
    return { ok: true, format: 'svg' }
  }

  if (declared) return { ok: false, message: CORRUPT_MESSAGE }
  return { ok: false, message: UNSUPPORTED_MESSAGE }
}
