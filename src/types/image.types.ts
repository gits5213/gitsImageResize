export type ImageFormat = 'jpeg' | 'png' | 'webp'

export interface SourceImage {
  filename: string
  format: ImageFormat
  width: number
  height: number
  byteSize: number
  previewUrl: string
}

export interface ResizedImage {
  width: number
  height: number
  byteSize: number
  format: ImageFormat
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
  format: ImageFormat
}

export type DimensionAxis = 'width' | 'height'

export type DimensionParse = { ok: true; value: number } | { ok: false; message: string }

export type FileValidation =
  { ok: true; format: ImageFormat } | { ok: false; message: string }
