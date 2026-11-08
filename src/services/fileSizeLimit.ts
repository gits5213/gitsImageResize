import type { OutputFormat } from '../types/image.types.ts'
import { formatFileSize } from '../utils/imageHelpers.ts'
import { ImageProcessingError } from './imageErrors.ts'

const JPEG_HIGH = 0.92
const JPEG_LOW = 0.05
const ENCODE_FAILURE =
  'This browser could not create the resized image. Try PNG or JPG, or smaller dimensions.'

async function encodeJpegWithin(
  encode: (quality?: number) => Promise<Blob | null>,
  limit: number,
): Promise<{ fit: Blob | null; smallest: Blob | null }> {
  const first = await encode(JPEG_HIGH)
  if (!first) return { fit: null, smallest: null }
  if (first.size <= limit) return { fit: first, smallest: first }

  let low = JPEG_LOW
  let high = JPEG_HIGH
  let best: Blob | null = null
  let smallest = first
  for (let step = 0; step < 7; step += 1) {
    const quality = (low + high) / 2
    const blob = await encode(quality)
    if (!blob) continue
    if (blob.size < smallest.size) smallest = blob
    if (blob.size <= limit) {
      best = blob
      low = quality
    } else {
      high = quality
    }
  }

  if (best) return { fit: best, smallest }
  const floor = await encode(JPEG_LOW)
  if (floor && floor.size < smallest.size) smallest = floor
  if (floor && floor.size <= limit) return { fit: floor, smallest }
  return { fit: null, smallest }
}

export async function selectBlobUnderLimit(options: {
  format: OutputFormat
  maxBytes: number | null
  preferredBytes: number | null
  encode: (quality?: number) => Promise<Blob | null>
}): Promise<Blob> {
  const { format, maxBytes, preferredBytes, encode } = options
  if (format === 'png') {
    const blob = await encode(undefined)
    if (!blob) throw new ImageProcessingError(ENCODE_FAILURE)
    if (maxBytes !== null && blob.size > maxBytes) {
      throw new ImageProcessingError(
        `PNG cannot be compressed to ${formatFileSize(maxBytes)}. This PNG is ${formatFileSize(blob.size)}. Choose JPG to reduce the file size, or raise the maximum.`,
      )
    }
    return blob
  }

  const ceilings = [maxBytes, preferredBytes].filter(
    (value): value is number => value !== null,
  )
  if (ceilings.length === 0) {
    const blob = await encode(JPEG_HIGH)
    if (!blob) throw new ImageProcessingError(ENCODE_FAILURE)
    return blob
  }

  const goal = Math.min(...ceilings)
  const { fit, smallest } = await encodeJpegWithin(encode, goal)
  if (!smallest) throw new ImageProcessingError(ENCODE_FAILURE)
  if (fit) return fit
  if (maxBytes !== null && smallest.size > maxBytes) {
    throw new ImageProcessingError(
      `This image cannot be reduced to ${formatFileSize(maxBytes)}. The smallest JPG file is ${formatFileSize(smallest.size)}. Raise the maximum size or use smaller dimensions.`,
    )
  }
  return smallest
}
