import type { SourceFormat } from '../../types/image.types.ts'
import {
  formatDimensions,
  formatFileSize,
  formatLabel,
} from '../../utils/imageHelpers.ts'

interface PreviewCardProps {
  title: string
  cardTestId: string
  imageTestId: string
  metaTestId?: string
  empty: string
  alt: string
  image: {
    previewUrl: string
    width: number
    height: number
    byteSize: number
    format: SourceFormat
  } | null
  busy?: boolean
}

export function PreviewCard({
  title,
  cardTestId,
  imageTestId,
  metaTestId,
  empty,
  alt,
  image,
  busy = false,
}: PreviewCardProps) {
  return (
    <article
      data-testid={cardTestId}
      className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {title}
      </h3>
      <div className="checkerboard relative mt-3 flex min-h-56 items-center justify-center overflow-hidden rounded-xl">
        {image ? (
          <img
            data-testid={imageTestId}
            src={image.previewUrl}
            alt={alt}
            className="max-h-80 w-full object-contain"
          />
        ) : (
          <p className="px-4 text-center text-sm text-slate-600 dark:text-slate-300">
            {empty}
          </p>
        )}
        {busy ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75 text-sm font-medium text-slate-800 dark:bg-slate-950/75 dark:text-slate-100">
            Resizing…
          </div>
        ) : null}
      </div>
      {image && metaTestId ? (
        <dl data-testid={metaTestId} className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Dimensions</dt>
            <dd className="font-medium">{formatDimensions(image.width, image.height)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">File size</dt>
            <dd className="font-medium">{formatFileSize(image.byteSize)}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Format</dt>
            <dd className="font-medium">{formatLabel(image.format)}</dd>
          </div>
        </dl>
      ) : null}
    </article>
  )
}
