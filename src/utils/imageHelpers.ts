import { MAX_FILE_BYTES } from '../config/limits.ts'
import type {
  DimensionAxis,
  FileSizeUnit,
  OutputFormat,
  SourceFormat,
} from '../types/image.types.ts'

const MAX_SIZE_MESSAGE = 'Enter a maximum file size such as 500 KB or 2 MB.'

const SOURCE_LABELS: Record<SourceFormat, string> = {
  jpeg: 'JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WebP',
  bmp: 'BMP',
  avif: 'AVIF',
  ico: 'ICO',
  svg: 'SVG',
  tiff: 'TIFF',
  heic: 'HEIC',
}

export function isOutputFormat(value: string): value is OutputFormat {
  return value === 'jpeg' || value === 'png'
}

export function formatLabel(format: SourceFormat): string {
  return SOURCE_LABELS[format]
}

export function mimeForFormat(format: OutputFormat): string {
  return format === 'jpeg' ? 'image/jpeg' : 'image/png'
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return 'Unknown size'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  const digits = value >= 100 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

export function maxBytesFromInput(
  raw: string,
  unit: FileSizeUnit,
): { ok: true; bytes: number | null } | { ok: false; message: string } {
  const value = raw.trim()
  if (value === '') return { ok: true, bytes: null }
  if (!/^\d+(\.\d+)?$/.test(value)) return { ok: false, message: MAX_SIZE_MESSAGE }
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0)
    return { ok: false, message: MAX_SIZE_MESSAGE }
  const bytes = Math.round(amount * (unit === 'mb' ? 1024 * 1024 : 1024))
  if (bytes < 1024) return { ok: false, message: 'The smallest maximum size is 1 KB.' }
  if (bytes > MAX_FILE_BYTES) {
    return { ok: false, message: 'The maximum size cannot be more than 50 MB.' }
  }
  return { ok: true, bytes }
}

export function reductionPercent(
  originalBytes: number,
  resultBytes: number,
): number | null {
  if (originalBytes <= 0 || resultBytes >= originalBytes) return null
  return Math.round((1 - resultBytes / originalBytes) * 100)
}

export function formatDimensions(width: number, height: number): string {
  return `${width} × ${height} pixels`
}

export function linkedDimension(
  sourceWidth: number,
  sourceHeight: number,
  value: number,
  axis: DimensionAxis,
): number {
  if (sourceWidth < 1 || sourceHeight < 1 || value < 1) return 1
  const raw =
    axis === 'width'
      ? (value * sourceHeight) / sourceWidth
      : (value * sourceWidth) / sourceHeight
  return Math.max(1, Math.round(raw))
}

export function sanitizeBaseName(filename: string): string {
  const leaf = filename.split(/[/\\]/).pop() ?? 'image'
  const withoutExtension = leaf.replace(/\.[^.]+$/, '')
  const cleaned = withoutExtension
    .replace(/[^\p{L}\p{N}._-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80)
  return cleaned || 'image'
}

export function buildDownloadFilename(
  originalName: string,
  width: number,
  height: number,
  format: OutputFormat,
): string {
  const extension = format === 'jpeg' ? 'jpg' : 'png'
  return `${sanitizeBaseName(originalName)}-${width}x${height}.${extension}`
}

export function revokeObjectUrl(url: string | null): void {
  if (!url) return
  URL.revokeObjectURL(url)
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}
