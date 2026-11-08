import { AlertTriangle, Download, RotateCcw, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useImageResize } from '../../hooks/useImageResize.ts'
import {
  formatDimensions,
  formatFileSize,
  formatLabel,
  reductionPercent,
} from '../../utils/imageHelpers.ts'
import { Button } from '../ui/Button.tsx'
import { BackgroundControls } from './BackgroundControls.tsx'
import { DimensionControls } from './DimensionControls.tsx'
import { ImageUploader } from './ImageUploader.tsx'
import { PreviewCard } from './PreviewCard.tsx'

function sizeComparison(originalBytes: number, resultBytes: number): string {
  const original = formatFileSize(originalBytes)
  const result = formatFileSize(resultBytes)
  const saved = reductionPercent(originalBytes, resultBytes)
  if (saved === null) return `Original ${original}. Resized file ${result}.`
  return `Original ${original}. Resized file ${result}, ${saved}% smaller.`
}

export function ImageWorkspace() {
  const editor = useImageResize()
  const busy = editor.phase !== 'idle'
  const alertMessage = editor.error ?? editor.sizeError
  const selectionKey = `${editor.background.mode}:${editor.background.scene}:${editor.background.color}`
  const appliedSelection = useRef<string | null>(null)
  const resizeRef = useRef(editor.resize)
  resizeRef.current = editor.resize

  useEffect(() => {
    if (!editor.source) {
      appliedSelection.current = selectionKey
      return
    }
    if (appliedSelection.current === selectionKey) return
    appliedSelection.current = selectionKey
    void resizeRef.current()
  }, [editor.source, selectionKey])

  return (
    <section id="workspace" aria-busy={busy} className="space-y-6">
      <ImageUploader
        hasImage={Boolean(editor.source)}
        busy={editor.phase === 'reading'}
        onFile={editor.selectFile}
      />

      {alertMessage ? (
        <p
          role="alert"
          data-testid="error-message"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          <AlertTriangle aria-hidden="true" size={16} className="mt-0.5 shrink-0" />
          {alertMessage}
        </p>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {editor.statusMessage ?? ''}
      </p>
      {editor.statusMessage ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {editor.statusMessage}
        </p>
      ) : null}

      {editor.source ? (
        <div
          data-testid="original-meta"
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="text-lg font-semibold">Original image</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Filename</dt>
              <dd className="font-medium break-all">{editor.source.filename}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Dimensions</dt>
              <dd className="font-medium">
                {formatDimensions(editor.source.width, editor.source.height)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">File size</dt>
              <dd className="font-medium">{formatFileSize(editor.source.byteSize)}</dd>
            </div>
            <div>
              <dt className="text-slate-500 dark:text-slate-400">Format</dt>
              <dd className="font-medium">{formatLabel(editor.source.format)}</dd>
            </div>
          </dl>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">New dimensions</h2>
        <div className="mt-4">
          <DimensionControls
            widthInput={editor.widthInput}
            heightInput={editor.heightInput}
            widthError={editor.widthError}
            heightError={editor.heightError}
            lockAspect={editor.lockAspect}
            outputFormat={editor.outputFormat}
            maxSizeInput={editor.maxSizeInput}
            maxSizeUnit={editor.maxSizeUnit}
            maxSizeError={editor.maxSizeError}
            compression={editor.compression}
            originalBytes={editor.source?.byteSize ?? null}
            inputsDisabled={!editor.source || busy}
            resizing={editor.phase === 'resizing'}
            canResize={editor.canResize}
            jpegWarning={editor.jpegWarning}
            distortionWarning={editor.distortionWarning}
            onWidthChange={editor.changeWidth}
            onHeightChange={editor.changeHeight}
            onToggleLock={editor.toggleLock}
            onOutputFormatChange={editor.changeOutputFormat}
            onMaxSizeChange={editor.changeMaxSize}
            onMaxSizeUnitChange={editor.changeMaxSizeUnit}
            onCompressionChange={editor.changeCompression}
            onResize={() => {
              void editor.resize()
            }}
          />
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="secondary"
            data-testid="reset-dimensions"
            onClick={editor.resetDimensions}
            disabled={!editor.source || busy}
          >
            <RotateCcw aria-hidden="true" size={16} />
            Reset dimensions
          </Button>
          <Button
            variant="danger"
            data-testid="clear-image"
            onClick={editor.clearImage}
            disabled={!editor.source && !editor.error}
          >
            <Trash2 aria-hidden="true" size={16} />
            Clear image
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Background</h2>
        <div className="mt-4">
          <BackgroundControls
            value={editor.background}
            disabled={busy}
            onChange={editor.changeBackground}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PreviewCard
          title="Original"
          cardTestId="original-preview-card"
          imageTestId="original-preview"
          empty="The original image will appear here after you choose a file."
          alt="Preview of the original image"
          image={editor.source}
        />
        <PreviewCard
          title="Resized"
          cardTestId="resized-preview-card"
          imageTestId="resized-preview"
          metaTestId="resized-meta"
          empty="Resize the image to preview the result."
          alt="Preview of the resized image"
          image={editor.resized}
          busy={editor.phase === 'resizing'}
        />
      </div>

      {editor.source && editor.resized ? (
        <p
          data-testid="size-comparison"
          className="text-sm text-slate-600 dark:text-slate-300"
        >
          {sizeComparison(editor.source.byteSize, editor.resized.byteSize)}
        </p>
      ) : null}

      {editor.previewStale ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The preview is from the previous resize. Resize again before downloading so the
          file matches the dimensions, format, maximum size, compression, and background
          you chose.
        </p>
      ) : null}

      <Button
        data-testid="download-button"
        onClick={editor.download}
        disabled={!editor.canDownload}
      >
        <Download aria-hidden="true" size={16} />
        Download resized image
      </Button>
    </section>
  )
}
