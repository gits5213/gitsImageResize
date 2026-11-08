/** Practical guard so a single resize cannot allocate an unbounded canvas. */
export const MAX_FILE_BYTES = 50 * 1024 * 1024

/** 16 million output pixels. This is a product safety limit, not a browser maximum. */
export const PRACTICAL_MAX_PIXELS = 16_000_000

export const THEME_STORAGE_KEY = 'gits-image-resize-theme'
