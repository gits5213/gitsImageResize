export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageProcessingError'
  }
}

export function toUserMessage(error: unknown): string {
  if (error instanceof ImageProcessingError) return error.message

  const detail = error instanceof Error ? error.message : ''
  if (/memory|allocation|out of memory|quota/i.test(detail)) {
    return 'Unable to resize this image. Please try smaller dimensions.'
  }

  return 'Unable to resize this image. Please try a different file or smaller dimensions.'
}
