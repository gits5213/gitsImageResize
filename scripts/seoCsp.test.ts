import { describe, expect, it } from 'vitest'
import { hashInlineJsonLd } from './seoCsp.ts'

const policy = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://static.cloudflareinsights.com" />`

describe('hashInlineJsonLd', () => {
  it('adds a script hash for the JSON-LD body', () => {
    const html = `${policy}<script data-seo-jsonld type="application/ld+json">{"ok":true}</script>`
    const hashed = hashInlineJsonLd(html)
    expect(hashed).toContain(`script-src 'self' 'sha256-`)
    expect(hashed).toContain('https://static.cloudflareinsights.com')
    expect(hashInlineJsonLd(hashed)).toBe(hashed)
  })

  it('leaves HTML unchanged when there is no content security policy', () => {
    const html = `<script data-seo-jsonld type="application/ld+json">{"ok":true}</script>`
    expect(hashInlineJsonLd(html)).toBe(html)
  })
})
