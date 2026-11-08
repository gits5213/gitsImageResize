import { AlertTriangle, Lock, Unlock } from 'lucide-react'
import type { ImageFormat } from '../../types/image.types.ts'
import { isImageFormat } from '../../utils/imageHelpers.ts'
import { Button } from '../ui/Button.tsx'

interface DimensionControlsProps {
  widthInput: string
  heightInput: string
  widthError: string | null
  heightError: string | null
  lockAspect: boolean
  outputFormat: ImageFormat
  inputsDisabled: boolean
  resizing: boolean
  canResize: boolean
  jpegWarning: boolean
  distortionWarning: boolean
  onWidthChange: (value: string) => void
  onHeightChange: (value: string) => void
  onToggleLock: () => void
  onOutputFormatChange: (format: ImageFormat) => void
  onResize: () => void
}

export function DimensionControls({
  widthInput,
  heightInput,
  widthError,
  heightError,
  lockAspect,
  outputFormat,
  inputsDisabled,
  resizing,
  canResize,
  jpegWarning,
  distortionWarning,
  onWidthChange,
  onHeightChange,
  onToggleLock,
  onOutputFormatChange,
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
              if (isImageFormat(event.target.value))
                onOutputFormatChange(event.target.value)
            }}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
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
