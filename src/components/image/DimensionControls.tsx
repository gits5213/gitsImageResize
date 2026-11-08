import { AlertTriangle, Lock, Unlock } from 'lucide-react'
import type { FileSizeUnit, OutputFormat } from '../../types/image.types.ts'
import {
  compressionTargetBytes,
  formatFileSize,
  isOutputFormat,
  MAX_COMPRESSION,
} from '../../utils/imageHelpers.ts'
import { Button } from '../ui/Button.tsx'

interface DimensionControlsProps {
  widthInput: string
  heightInput: string
  widthError: string | null
  heightError: string | null
  lockAspect: boolean
  outputFormat: OutputFormat
  maxSizeInput: string
  maxSizeUnit: FileSizeUnit
  maxSizeError: string | null
  compression: number
  originalBytes: number | null
  inputsDisabled: boolean
  resizing: boolean
  canResize: boolean
  jpegWarning: boolean
  distortionWarning: boolean
  onWidthChange: (value: string) => void
  onHeightChange: (value: string) => void
  onToggleLock: () => void
  onOutputFormatChange: (format: OutputFormat) => void
  onMaxSizeChange: (value: string) => void
  onMaxSizeUnitChange: (unit: FileSizeUnit) => void
  onCompressionChange: (value: number) => void
  onResize: () => void
}

function compressionNote(
  format: OutputFormat,
  originalBytes: number | null,
  compression: number,
): string {
  if (format === 'png') {
    return originalBytes === null
      ? 'PNG stays lossless. Choose JPG to compress the download below the original file size.'
      : `PNG stays lossless. Choose JPG to compress the download below the original ${formatFileSize(originalBytes)}.`
  }
  if (originalBytes === null) {
    return 'JPG downloads are compressed below the original upload size.'
  }
  if (compression <= 0) {
    return `Compression is off. The JPG may be larger than the original ${formatFileSize(originalBytes)}.`
  }
  const target = compressionTargetBytes(originalBytes, compression)
  const targetLabel =
    target === null ? formatFileSize(originalBytes) : formatFileSize(target)
  return `A ${formatFileSize(originalBytes)} upload is compressed by ${compression}% for download, to about ${targetLabel} or smaller.`
}

export function DimensionControls({
  widthInput,
  heightInput,
  widthError,
  heightError,
  lockAspect,
  outputFormat,
  maxSizeInput,
  maxSizeUnit,
  maxSizeError,
  compression,
  originalBytes,
  inputsDisabled,
  resizing,
  canResize,
  jpegWarning,
  distortionWarning,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onOutputFormatChange,
  onMaxSizeChange,
  onMaxSizeUnitChange,
  onCompressionChange,
  onResize,
}: DimensionControlsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="width-input"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Width (pixels)
          </label>
          <input
            id="width-input"
            data-testid="width-input"
            className="mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={widthError ? true : undefined}
            aria-describedby={widthError ? 'width-error' : undefined}
            disabled={inputsDisabled}
            value={widthInput}
            onChange={(event) => onWidthChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onResize()
              }
            }}
          />
          {widthError ? (
            <p
              id="width-error"
              className="mt-1 flex items-start gap-1 text-sm text-red-700 dark:text-red-300"
            >
              <AlertTriangle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {widthError}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="height-input"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Height (pixels)
          </label>
          <input
            id="height-input"
            data-testid="height-input"
            className="mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={heightError ? true : undefined}
            aria-describedby={heightError ? 'height-error' : undefined}
            disabled={inputsDisabled}
            value={heightInput}
            onChange={(event) => onHeightChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                onResize()
              }
            }}
          />
          {heightError ? (
            <p
              id="height-error"
              className="mt-1 flex items-start gap-1 text-sm text-red-700 dark:text-red-300"
            >
              <AlertTriangle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
              {heightError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          role="switch"
          data-testid="aspect-lock"
          aria-checked={lockAspect}
          disabled={inputsDisabled}
          onClick={onToggleLock}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          {lockAspect ? (
            <Lock aria-hidden="true" size={16} />
          ) : (
            <Unlock aria-hidden="true" size={16} />
          )}
          Lock aspect ratio
        </button>
        <div className="min-w-40">
          <label
            htmlFor="output-format"
            className="text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            Download format
          </label>
          <select
            id="output-format"
            data-testid="output-format"
            className="mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
            value={outputFormat}
            disabled={inputsDisabled}
            onChange={(event) => {
              if (isOutputFormat(event.target.value))
                onOutputFormatChange(event.target.value)
            }}
          >
            <option value="jpeg">JPG</option>
            <option value="png">PNG</option>
          </select>
        </div>
      </div>

      <div className="max-w-sm">
        <label
          htmlFor="max-file-size"
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Maximum file size
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="max-file-size"
            data-testid="max-file-size"
            inputMode="decimal"
            placeholder="No limit"
            aria-invalid={Boolean(maxSizeError)}
            aria-describedby="max-file-size-note"
            disabled={inputsDisabled}
            value={maxSizeInput}
            onChange={(event) => onMaxSizeChange(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
          />
          <select
            aria-label="Maximum file size unit"
            data-testid="max-file-size-unit"
            className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 dark:border-slate-700 dark:bg-slate-950"
            value={maxSizeUnit}
            disabled={inputsDisabled}
            onChange={(event) => {
              if (event.target.value === 'kb' || event.target.value === 'mb') {
                onMaxSizeUnitChange(event.target.value)
              }
            }}
          >
            <option value="kb">KB</option>
            <option value="mb">MB</option>
          </select>
        </div>
        <p
          id="max-file-size-note"
          className={`mt-1 text-sm ${maxSizeError ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}
        >
          {maxSizeError ??
            'Optional. A JPG also stays at or below this size when you set one.'}
        </p>
      </div>

      <div className="max-w-md">
        <label
          htmlFor="compression"
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Compression ({compression}% smaller)
        </label>
        <input
          id="compression"
          data-testid="compression"
          type="range"
          min={0}
          max={MAX_COMPRESSION}
          step={5}
          value={compression}
          disabled={inputsDisabled}
          aria-describedby="compression-note"
          onChange={(event) => onCompressionChange(Number(event.target.value))}
          className="mt-2 w-full"
        />
        <p
          id="compression-note"
          data-testid="compression-note"
          className="mt-1 text-sm text-slate-600 dark:text-slate-300"
        >
          {compressionNote(outputFormat, originalBytes, compression)}
        </p>
      </div>

      {distortionWarning ? (
        <p
          data-testid="distortion-warning"
          className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <AlertTriangle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          Aspect ratio lock is off. Changing width and height independently may stretch or
          squash the image.
        </p>
      ) : null}

      {jpegWarning ? (
        <p
          data-testid="jpeg-warning"
          className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <AlertTriangle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          JPEG does not support transparency. Transparent areas will be filled with white.
        </p>
      ) : null}

      <p id="resize-note" className="text-sm text-slate-600 dark:text-slate-300">
        Larger dimensions do not add detail or recover resolution that was not in the
        original image.
      </p>

      <Button data-testid="resize-button" onClick={onResize} disabled={!canResize}>
        {resizing ? 'Resizing…' : 'Resize image'}
      </Button>
    </div>
  )
}
