import { ImageWorkspace } from '../components/image/ImageWorkspace.tsx'

export function ResizeImage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Resize an image</h1>
      <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
        Choose an image file. Set the new pixel size, preview the result, and download PNG
        or JPG. Processing stays in this browser.
      </p>
      <div className="mt-8">
        <ImageWorkspace />
      </div>
    </div>
  )
}
