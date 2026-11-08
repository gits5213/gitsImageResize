import { PRACTICAL_MAX_PIXELS } from '../config/limits.ts'
import type {
  CanvasLimits,
  LoadedImage,
  ResizeRequest,
  ResizedImage,
} from '../types/image.types.ts'
import { mimeForFormat } from '../utils/imageHelpers.ts'
import { validateImageFile } from '../utils/imageValidation.ts'
import { backgroundKey } from './backgrounds.ts'
import { composeBackground } from './backgroundCompose.ts'
import { selectBlobUnderLimit } from './fileSizeLimit.ts'
import { ImageProcessingError } from './imageErrors.ts'

const DECODE_MESSAGE =
  'This file could not be read as an image. It may be corrupted or incomplete.'

const SIZE_MESSAGE = 'Unable to resize this image. Please try smaller dimensions.'

export function detectCanvasLimits(): CanvasLimits {
  const canvas = document.createElement('canvas')
  let maxSide = 1024
  for (const side of [2048, 4096, 8192, 16384]) {
    try {
      canvas.width = side
      canvas.height = 1
    } catch {
      break
    }
    if (canvas.width !== side) break
    maxSide = side
  }
  canvas.width = 0
  canvas.height = 0
  return { maxSide, maxPixels: Math.min(PRACTICAL_MAX_PIXELS, maxSide * maxSide) }
}

export async function readSourceImage(file: File): Promise<LoadedImage> {
  const validation = await validateImageFile(file)
  if (!validation.ok) throw new ImageProcessingError(validation.message)

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new ImageProcessingError(DECODE_MESSAGE)
  }

  if (bitmap.width < 1 || bitmap.height < 1) {
    bitmap.close()
    throw new ImageProcessingError('This image has invalid dimensions.')
  }

  return {
    bitmap,
    image: {
      filename: file.name,
      format: validation.format,
      width: bitmap.width,
      height: bitmap.height,
      byteSize: file.size,
      previewUrl: URL.createObjectURL(file),
    },
  }
}

async function bitmapForOutput(
  source: ImageBitmap,
  width: number,
  height: number,
): Promise<{ bitmap: ImageBitmap; closeAfterDraw: boolean }> {
  if (
    typeof createImageBitmap !== 'function' ||
    (source.width === width && source.height === height)
  ) {
    return { bitmap: source, closeAfterDraw: false }
  }
  try {
    const scaled = await createImageBitmap(source, {
      resizeWidth: width,
      resizeHeight: height,
      resizeQuality: 'high',
    })
    return { bitmap: scaled, closeAfterDraw: true }
  } catch {
    return { bitmap: source, closeAfterDraw: false }
  }
}

export async function resizeImage(
  source: ImageBitmap,
  request: ResizeRequest,
): Promise<ResizedImage> {
  const { width, height, format } = request
  const canvas = document.createElement('canvas')
  try {
    canvas.width = width
    canvas.height = height
  } catch {
    throw new ImageProcessingError(SIZE_MESSAGE)
  }
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = 0
    canvas.height = 0
    throw new ImageProcessingError(SIZE_MESSAGE)
  }

  const context = canvas.getContext('2d', { alpha: format !== 'jpeg' })
  if (!context) {
    canvas.width = 0
    canvas.height = 0
    throw new ImageProcessingError(
      'This browser could not prepare a canvas for resizing.',
    )
  }

  const scaled = await bitmapForOutput(source, width, height)
  const subject = document.createElement('canvas')
  try {
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    const editBackground =
      request.background.mode !== 'original' || request.background.lightFocus > 0
    if (!editBackground) {
      if (format === 'jpeg') {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
      }
      context.drawImage(scaled.bitmap, 0, 0, width, height)
    } else {
      subject.width = width
      subject.height = height
      const subjectContext = subject.getContext('2d', { alpha: true })
      if (!subjectContext) {
        throw new ImageProcessingError(
          'This browser could not prepare the new background.',
        )
      }
      subjectContext.imageSmoothingEnabled = true
      subjectContext.imageSmoothingQuality = 'high'
      subjectContext.drawImage(scaled.bitmap, 0, 0, width, height)
      await composeBackground(context, subject, request.background, format === 'jpeg')
    }
  } catch (error) {
    if (error instanceof ImageProcessingError) throw error
    throw new ImageProcessingError(SIZE_MESSAGE)
  } finally {
    subject.width = 0
    subject.height = 0
    if (scaled.closeAfterDraw) scaled.bitmap.close()
  }

  const mime = mimeForFormat(format)
  const blob = await selectBlobUnderLimit({
    format,
    maxBytes: request.maxBytes,
    preferredBytes: request.preferredBytes,
    encode: (quality) =>
      new Promise<Blob | null>((resolve) => {
        canvas.toBlob((value) => resolve(value), mime, quality)
      }),
  })
  canvas.width = 0
  canvas.height = 0

  const previewUrl = URL.createObjectURL(blob)
  let decoded: ImageBitmap | null = null
  try {
    decoded = await createImageBitmap(blob)
    if (decoded.width !== width || decoded.height !== height) {
      throw new ImageProcessingError(
        'The resized image did not match the requested dimensions. Please try again.',
      )
    }
  } catch (error) {
    URL.revokeObjectURL(previewUrl)
    if (error instanceof ImageProcessingError) throw error
    throw new ImageProcessingError(
      'The resized image could not be verified. Please try again.',
    )
  } finally {
    decoded?.close()
  }

  return {
    width,
    height,
    byteSize: blob.size,
    format,
    previewUrl,
    blob,
    maxBytes: request.maxBytes,
    compression: request.compression,
    backgroundKey: backgroundKey(request.background),
  }
}
