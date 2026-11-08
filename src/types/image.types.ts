export type OutputFormat = 'jpeg' | 'png'

export type SourceFormat =
  OutputFormat | 'gif' | 'webp' | 'bmp' | 'avif' | 'ico' | 'svg' | 'tiff' | 'heic'

export interface SourceImage {
  filename: string
  format: SourceFormat
  width: number
  height: number
  byteSize: number
  previewUrl: string
}

export interface ResizedImage {
  width: number
  height: number
  byteSize: number
  format: OutputFormat
  previewUrl: string
  blob: Blob
}

export interface LoadedImage {
  image: SourceImage
  bitmap: ImageBitmap
}

export interface CanvasLimits {
  maxSide: number
  maxPixels: number
}

export interface ResizeRequest {
  width: number
  height: number
  format: OutputFormat
}

export type DimensionAxis = 'width' | 'height'

export type DimensionParse = { ok: true; value: number } | { ok: false; message: string }

export type FileValidation =
  { ok: true; format: SourceFormat } | { ok: false; message: string }
