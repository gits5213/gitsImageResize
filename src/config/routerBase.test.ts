import { describe, expect, it } from 'vitest'
import { normalizeBasename } from './routerBase.ts'

describe('normalizeBasename', () => {
  it('uses an undefined basename for local root hosting', () => {
    expect(normalizeBasename('/')).toBeUndefined()
    expect(normalizeBasename(undefined)).toBeUndefined()
    expect(normalizeBasename('')).toBeUndefined()
  })

  it('strips the trailing slash for a GitHub Pages project path', () => {
    expect(normalizeBasename('/gitsImageResize/')).toBe('/gitsImageResize')
  })
})
