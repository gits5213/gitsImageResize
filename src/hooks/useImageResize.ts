import { useEffect, useMemo, useRef, useState } from 'react'
import {
  detectCanvasLimits,
  readSourceImage,
  resizeImage,
} from '../services/imageResizeService.ts'
import { toUserMessage } from '../services/imageErrors.ts'
import {
  type BackgroundChoice,
  DEFAULT_BACKGROUND,
  backgroundKey,
  clampLightFocus,
} from '../services/backgrounds.ts'
import type {
  FileSizeUnit,
  OutputFormat,
  ResizedImage,
  SourceImage,
} from '../types/image.types.ts'
import {
  buildDownloadFilename,
  clampCompression,
  compressionTargetBytes,
  DEFAULT_COMPRESSION,
  downloadBlob,
  formatFileSize,
  linkedDimension,
  maxBytesFromInput,
  reductionPercent,
  revokeObjectUrl,
} from '../utils/imageHelpers.ts'
import { parseDimensionInput, validatePixelSize } from '../utils/imageValidation.ts'

export function useImageResize() {
  const [source, setSource] = useState<SourceImage | null>(null)
  const [resized, setResized] = useState<ResizedImage | null>(null)
  const [widthInput, setWidthInput] = useState('')
  const [heightInput, setHeightInput] = useState('')
  const [lockAspect, setLockAspect] = useState(true)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png')
  const [maxSizeInput, setMaxSizeInput] = useState('')
  const [maxSizeUnit, setMaxSizeUnit] = useState<FileSizeUnit>('kb')
  const [compression, setCompression] = useState(DEFAULT_COMPRESSION)
  const [background, setBackground] = useState<BackgroundChoice>(DEFAULT_BACKGROUND)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [phase, setPhase] = useState<'idle' | 'reading' | 'resizing'>('idle')
  const [hasBitmap, setHasBitmap] = useState(false)

  const bitmapRef = useRef<ImageBitmap | null>(null)
  const sourceUrlRef = useRef<string | null>(null)
  const resizedUrlRef = useRef<string | null>(null)
  const requestId = useRef(0)
  const resizeGeneration = useRef(0)
  const limits = useMemo(() => detectCanvasLimits(), [])

  const releaseResources = () => {
    bitmapRef.current?.close()
    bitmapRef.current = null
    revokeObjectUrl(sourceUrlRef.current)
    revokeObjectUrl(resizedUrlRef.current)
    sourceUrlRef.current = null
    resizedUrlRef.current = null
  }

  useEffect(() => {
    const bitmap = bitmapRef
    const sourceUrl = sourceUrlRef
    const resizedUrl = resizedUrlRef
    return () => {
      bitmap.current?.close()
      bitmap.current = null
      revokeObjectUrl(sourceUrl.current)
      revokeObjectUrl(resizedUrl.current)
      sourceUrl.current = null
      resizedUrl.current = null
    }
  }, [])

  const widthParsed = parseDimensionInput(widthInput)
  const heightParsed = parseDimensionInput(heightInput)
  const widthError = source && !widthParsed.ok ? widthParsed.message : null
  const heightError = source && !heightParsed.ok ? heightParsed.message : null
  const maxParsed = maxBytesFromInput(maxSizeInput, maxSizeUnit)
  const maxSizeError = source && !maxParsed.ok ? maxParsed.message : null
  const sizeError =
    source && widthParsed.ok && heightParsed.ok
      ? validatePixelSize(widthParsed.value, heightParsed.value, limits)
      : null

  const dimensionsMatch =
    widthParsed.ok &&
    heightParsed.ok &&
    resized !== null &&
    resized.width === widthParsed.value &&
    resized.height === heightParsed.value &&
    resized.format === outputFormat &&
    resized.maxBytes === (maxParsed.ok ? maxParsed.bytes : null) &&
    (outputFormat === 'png' || resized.compression === compression) &&
    resized.backgroundKey === backgroundKey(background)
  const previewStale = Boolean(resized) && !dimensionsMatch

  const canResize = Boolean(
    source &&
    hasBitmap &&
    phase === 'idle' &&
    !widthError &&
    !heightError &&
    !maxSizeError &&
    !sizeError,
  )
  const canDownload = Boolean(resized && !previewStale && phase === 'idle')

  const selectFile = async (file: File, ignoredExtras = false) => {
    const id = ++requestId.current
    setPhase('reading')
    setError(null)
    setStatusMessage(null)
    try {
      const loaded = await readSourceImage(file)
      if (id !== requestId.current) {
        loaded.bitmap.close()
        revokeObjectUrl(loaded.image.previewUrl)
        return
      }
      bitmapRef.current?.close()
      revokeObjectUrl(sourceUrlRef.current)
      revokeObjectUrl(resizedUrlRef.current)
      bitmapRef.current = loaded.bitmap
      setHasBitmap(true)
      sourceUrlRef.current = loaded.image.previewUrl
      resizedUrlRef.current = null
      setSource(loaded.image)
      setResized(null)
      setWidthInput(String(loaded.image.width))
      setHeightInput(String(loaded.image.height))
      setLockAspect(true)
      setOutputFormat(loaded.image.format === 'jpeg' ? 'jpeg' : 'png')
      setMaxSizeInput('')
      setMaxSizeUnit('kb')
      setCompression(DEFAULT_COMPRESSION)
      setBackground(DEFAULT_BACKGROUND)
      setStatusMessage(
        ignoredExtras
          ? 'Only one image can be resized at a time. The first file was used.'
          : 'Image ready. Set the new dimensions, then resize.',
      )
    } catch (caught) {
      if (id !== requestId.current) return
      setError(toUserMessage(caught))
    } finally {
      if (id === requestId.current) setPhase('idle')
    }
  }

  const changeWidth = (value: string) => {
    setWidthInput(value)
    setStatusMessage(null)
    if (!lockAspect || !source) return
    const parsed = parseDimensionInput(value)
    if (!parsed.ok) return
    setHeightInput(
      String(linkedDimension(source.width, source.height, parsed.value, 'width')),
    )
  }

  const changeHeight = (value: string) => {
    setHeightInput(value)
    setStatusMessage(null)
    if (!lockAspect || !source) return
    const parsed = parseDimensionInput(value)
    if (!parsed.ok) return
    setWidthInput(
      String(linkedDimension(source.width, source.height, parsed.value, 'height')),
    )
  }

  const toggleLock = () => {
    const next = !lockAspect
    setLockAspect(next)
    if (next && source) {
      const parsed = parseDimensionInput(widthInput)
      if (parsed.ok) {
        setHeightInput(
          String(linkedDimension(source.width, source.height, parsed.value, 'width')),
        )
      }
    }
  }

  const changeOutputFormat = (format: OutputFormat) => {
    setOutputFormat(format)
    setStatusMessage(null)
  }

  const changeMaxSize = (value: string) => {
    setMaxSizeInput(value)
    setStatusMessage(null)
  }

  const changeMaxSizeUnit = (unit: FileSizeUnit) => {
    setMaxSizeUnit(unit)
    setStatusMessage(null)
  }

  const changeCompression = (value: number) => {
    setCompression(clampCompression(value))
    setStatusMessage(null)
  }

  const changeBackground = (next: BackgroundChoice) => {
    setBackground({
      ...next,
      lightFocus: clampLightFocus(next.lightFocus),
    })
    setStatusMessage(null)
  }

  const resize = async () => {
    const bitmap = bitmapRef.current
    if (!source || !bitmap) return
    const width = parseDimensionInput(widthInput)
    const height = parseDimensionInput(heightInput)
    if (!width.ok || !height.ok) {
      setError('Enter positive whole-number dimensions before resizing.')
      return
    }
    if (!maxParsed.ok) {
      setError(maxParsed.message)
      return
    }
    const sizeProblem = validatePixelSize(width.value, height.value, limits)
    if (sizeProblem) {
      setError(sizeProblem)
      return
    }

    const generation = ++resizeGeneration.current
    const activeRequest = requestId.current
    setPhase('resizing')
    setError(null)
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 0)
    })
    const current =
      generation === resizeGeneration.current && activeRequest === requestId.current
    if (!current) return
    try {
      const result = await resizeImage(bitmap, {
        width: width.value,
        height: height.value,
        format: outputFormat,
        maxBytes: maxParsed.bytes,
        preferredBytes: compressionTargetBytes(source.byteSize, compression),
        compression,
        background,
      })
      if (
        generation !== resizeGeneration.current ||
        activeRequest !== requestId.current
      ) {
        revokeObjectUrl(result.previewUrl)
        return
      }
      revokeObjectUrl(resizedUrlRef.current)
      resizedUrlRef.current = result.previewUrl
      setResized(result)
      const saved = source ? reductionPercent(source.byteSize, result.byteSize) : null
      const sizeLimited = maxParsed.bytes !== null || compression > 0
      const sizeNote = !sizeLimited
        ? ''
        : saved === null
          ? ` File size is ${formatFileSize(result.byteSize)}.`
          : ` File size reduced by ${saved}% to ${formatFileSize(result.byteSize)}.`
      setStatusMessage(
        `Resized image ready at ${result.width} by ${result.height} pixels.${sizeNote}`,
      )
    } catch (caught) {
      if (generation !== resizeGeneration.current || activeRequest !== requestId.current)
        return
      setError(toUserMessage(caught))
    } finally {
      if (
        generation === resizeGeneration.current &&
        activeRequest === requestId.current
      ) {
        setPhase('idle')
      }
    }
  }

  const resetDimensions = () => {
    if (!source) return
    setWidthInput(String(source.width))
    setHeightInput(String(source.height))
    setLockAspect(true)
    setError(null)
    setStatusMessage('Dimensions restored to the original image.')
  }

  const clearImage = () => {
    requestId.current += 1
    releaseResources()
    setHasBitmap(false)
    setSource(null)
    setResized(null)
    setWidthInput('')
    setHeightInput('')
    setLockAspect(true)
    setOutputFormat('png')
    setMaxSizeInput('')
    setMaxSizeUnit('kb')
    setCompression(DEFAULT_COMPRESSION)
    setBackground(DEFAULT_BACKGROUND)
    setError(null)
    setPhase('idle')
    setStatusMessage('Image cleared from this page.')
  }

  const download = () => {
    if (!source || !resized || previewStale) return
    try {
      downloadBlob(
        resized.blob,
        buildDownloadFilename(
          source.filename,
          resized.width,
          resized.height,
          resized.format,
        ),
      )
      setStatusMessage(
        'Download started. Your browser saves the file. This page does not keep a copy.',
      )
    } catch {
      setError('The image could not be downloaded. Please try again.')
    }
  }

  return {
    source,
    resized,
    widthInput,
    heightInput,
    lockAspect,
    outputFormat,
    maxSizeInput,
    maxSizeUnit,
    compression,
    background,
    error,
    widthError,
    heightError,
    maxSizeError,
    sizeError,
    statusMessage,
    phase,
    jpegWarning: outputFormat === 'jpeg',
    distortionWarning: Boolean(source) && !lockAspect,
    canResize,
    canDownload,
    previewStale,
    selectFile,
    changeWidth,
    changeHeight,
    toggleLock,
    changeOutputFormat,
    changeMaxSize,
    changeMaxSizeUnit,
    changeCompression,
    changeBackground,
    resize,
    resetDimensions,
    clearImage,
    download,
  }
}
