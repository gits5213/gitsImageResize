import type { OutputFormat } from '../types/image.types.ts'
import { formatFileSize } from '../utils/imageHelpers.ts'
import { ImageProcessingError } from './imageErrors.ts'

const JPEG_HIGH = 0.92
const JPEG_LOW = 0.05
const ENCODE_FAILURE =
  'This browser could not create the resized image. Try PNG or JPG, or smaller dimensions.'

export async function selectBlobUnderLimit(options: {
  format: OutputFormat
  maxBytes: number | null
  encode: (quality?: number) => Promise<Blob | null>
}): Promise<Blob> {
  const { format, maxBytes, encode } = options
  if (format === 'png' || maxBytes === null) {
    const blob = await encode(format === 'jpeg' ? JPEG_HIGH : undefined)
    if (!blob) throw new ImageProcessingError(ENCODE_FAILURE)
    if (maxBytes !== null && blob.size > maxBytes) {
      throw new ImageProcessingError(
        `PNG cannot be compressed to ${formatFileSize(maxBytes)}. This PNG is ${formatFileSize(blob.size)}. Choose JPG to reduce the file size, or raise the maximum.`,
      )
    }
    return blob
  }

  const first = await encode(JPEG_HIGH)
  if (!first) throw new ImageProcessingError(ENCODE_FAILURE)
  if (first.size <= maxBytes) return first

  let low = JPEG_LOW
  let high = JPEG_HIGH
  let best: Blob | null = null
  let smallest = first
  for (let step = 0; step < 7; step += 1) {
    const quality = (low + high) / 2
    const blob = await encode(quality)
    if (!blob) continue
    if (blob.size < smallest.size) smallest = blob
    if (blob.size <= maxBytes) {
      best = blob
      low = quality
    } else {
      high = quality
    }
  }

  if (best) return best
  const floor = await encode(JPEG_LOW)
  if (floor && floor.size <= maxBytes) return floor
  const smallestSize = floor && floor.size < smallest.size ? floor.size : smallest.size
  throw new ImageProcessingError(
    `This image cannot be reduced to ${formatFileSize(maxBytes)}. The smallest JPG file is ${formatFileSize(smallestSize)}. Raise the maximum size or use smaller dimensions.`,
  )
}
