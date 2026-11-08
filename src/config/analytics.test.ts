import { describe, expect, it } from 'vitest'
import {
  CLOUDFLARE_BEACON_SRC,
  mountAnalyticsBeacon,
  resolveAnalyticsConfig,
} from './analytics.ts'
import { normalizeBasename } from './routerBase.ts'

describe('resolveAnalyticsConfig', () => {
  it('stays off unless explicitly enabled with a token', () => {
    expect(
      resolveAnalyticsConfig({ enabled: 'false', token: 'public-token' }).enabled,
    ).toBe(false)
    expect(resolveAnalyticsConfig({ enabled: 'true', token: '   ' }).enabled).toBe(false)
    expect(resolveAnalyticsConfig({ enabled: undefined, token: undefined }).enabled).toBe(
      false,
    )
    expect(resolveAnalyticsConfig({ enabled: 'true', token: ' public-token ' })).toEqual({
      enabled: true,
      token: 'public-token',
    })
  })
})

describe('mountAnalyticsBeacon', () => {
  it('does not add a script when analytics is disabled', () => {
    const host = document.createElement('div')
    document.body.append(host)
    mountAnalyticsBeacon(document, { enabled: false, token: null })
    expect(document.querySelector('script[src*="cloudflareinsights"]')).toBeNull()
  })

  it('adds only the official beacon and the public token', () => {
    const remove = mountAnalyticsBeacon(document, { enabled: true, token: 'site-token' })
    const script = document.querySelector('script[src*="cloudflareinsights"]')
    expect(script).not.toBeNull()
    expect(script?.getAttribute('src')).toBe(CLOUDFLARE_BEACON_SRC)
    expect(script?.getAttribute('data-cf-beacon')).toBe('{"token":"site-token"}')
    expect(script?.getAttribute('data-cf-beacon')).not.toMatch(/filename|width|png/i)
    remove()
    expect(document.querySelector('script[src*="cloudflareinsights"]')).toBeNull()
  })
})

describe('normalizeBasename', () => {
  it('prepares a GitHub Pages project path for the router', () => {
    expect(normalizeBasename('/gitsImageResize/')).toBe('/gitsImageResize')
    expect(normalizeBasename('/')).toBeUndefined()
    expect(normalizeBasename(undefined)).toBeUndefined()
  })
})
