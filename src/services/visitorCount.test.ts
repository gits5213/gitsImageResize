import { describe, expect, it, vi } from 'vitest'
import {
  parseVisitorCount,
  readVisitorCount,
  visitorCountRequest,
} from './visitorCount.ts'

function memoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

describe('visitorCountRequest', () => {
  it('counts a new visit and only reads after that visit is recorded', () => {
    expect(visitorCountRequest(false)).toBe(
      'https://abacus.jasoncameron.dev/hit/gits5213.github.io/gitsImageResize',
    )
    expect(visitorCountRequest(true)).toBe(
      'https://abacus.jasoncameron.dev/get/gits5213.github.io/gitsImageResize',
    )
  })
})

describe('parseVisitorCount', () => {
  it('accepts a whole number and rejects anything else', () => {
    expect(parseVisitorCount({ value: 12 })).toBe(12)
    expect(parseVisitorCount({ value: '12' })).toBe(12)
    expect(parseVisitorCount({ value: 1.5 })).toBeNull()
    expect(parseVisitorCount({ value: -1 })).toBeNull()
    expect(parseVisitorCount({})).toBeNull()
    expect(parseVisitorCount(null)).toBeNull()
  })
})

describe('readVisitorCount', () => {
  it('records one visit per browser session and does not send image data', async () => {
    const storage = memoryStorage()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 4 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ value: 4 }), { status: 200 }))

    await expect(readVisitorCount(storage, fetchImpl)).resolves.toBe(4)
    await expect(readVisitorCount(storage, fetchImpl)).resolves.toBe(4)

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      'https://abacus.jasoncameron.dev/hit/gits5213.github.io/gitsImageResize',
    )
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      'https://abacus.jasoncameron.dev/get/gits5213.github.io/gitsImageResize',
    )
    expect(String(fetchImpl.mock.calls)).not.toMatch(/png|filename|width/i)
  })

  it('returns null when the counter cannot be read', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(readVisitorCount(memoryStorage(), fetchImpl)).resolves.toBeNull()
  })
})
