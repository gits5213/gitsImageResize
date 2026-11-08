import { ImagePlus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  IMAGE_FILE_ACCEPT,
  SUPPORTED_UPLOAD_SUMMARY,
} from '../../utils/imageValidation.ts'

interface ImageUploaderProps {
  hasImage: boolean
  busy: boolean
  onFile: (file: File, ignoredExtras: boolean) => void
}

export function ImageUploader({ hasImage, busy, onFile }: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const depth = useRef(0)

  useEffect(() => {
    const preventNavigation = (event: DragEvent) => {
      event.preventDefault()
    }
    window.addEventListener('dragover', preventNavigation)
    window.addEventListener('drop', preventNavigation)
    return () => {
      window.removeEventListener('dragover', preventNavigation)
      window.removeEventListener('drop', preventNavigation)
    }
  }, [])

  const takeFiles = (list: FileList | null) => {
    const file = list?.[0]
    if (!file) return
    onFile(file, (list?.length ?? 0) > 1)
  }

  return (
    <div
      data-testid="dropzone"
      onDragEnter={(event) => {
        event.preventDefault()
        depth.current += 1
        setDragOver(true)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'copy'
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        depth.current = Math.max(0, depth.current - 1)
        if (depth.current === 0) setDragOver(false)
      }}
      onDrop={(event) => {
        event.preventDefault()
        depth.current = 0
        setDragOver(false)
        takeFiles(event.dataTransfer.files)
      }}
      className={`rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
        dragOver
          ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-slate-900'
          : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900'
      }`}
    >
      <ImagePlus
        className="mx-auto text-blue-600 dark:text-blue-300"
        aria-hidden="true"
      />
      <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
        {hasImage ? 'Drop a new image to replace the current one' : 'Drop an image here'}
      </p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {SUPPORTED_UPLOAD_SUMMARY}. Download is PNG or JPG. The file stays in this
        browser.
      </p>
      <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
        <input
          id="image-file"
          data-testid="file-input"
          className="sr-only"
          type="file"
          accept={IMAGE_FILE_ACCEPT}
          disabled={busy}
          onChange={(event) => {
            takeFiles(event.target.files)
            event.target.value = ''
          }}
        />
        {busy ? 'Reading image…' : hasImage ? 'Replace image' : 'Browse files'}
      </label>
    </div>
  )
}
