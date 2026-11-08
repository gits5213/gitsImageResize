const COUNTER_HOST = 'https://abacus.jasoncameron.dev'
const COUNTER_NAMESPACE = 'gits5213.github.io'
const COUNTER_KEY = 'gitsImageResize'
const SESSION_KEY = 'gits-image-resize-visitor-counted'

export function visitorCountRequest(alreadyCounted: boolean): string {
  const action = alreadyCounted ? 'get' : 'hit'
  return `${COUNTER_HOST}/${action}/${COUNTER_NAMESPACE}/${COUNTER_KEY}`
}

export function parseVisitorCount(payload: unknown): number | null {
  if (!payload || typeof payload !== 'object' || !('value' in payload)) return null
  const value = (payload as { value: unknown }).value
  const count = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(count) || count < 0) return null
  return count
}

function alreadyCounted(storage: Storage): boolean {
  try {
    return storage.getItem(SESSION_KEY) === '1'
  } catch {
    return false
  }
}

function rememberCount(storage: Storage): void {
  try {
    storage.setItem(SESSION_KEY, '1')
  } catch {
    // Private browsing can block storage. The count can still be shown.
  }
}

export async function readVisitorCount(
  storage: Storage = sessionStorage,
  fetchImpl: typeof fetch = fetch,
): Promise<number | null> {
  const counted = alreadyCounted(storage)
  try {
    const response = await fetchImpl(visitorCountRequest(counted))
    if (!response.ok) return null
    const count = parseVisitorCount(await response.json())
    if (count !== null && !counted) rememberCount(storage)
    return count
  } catch {
    return null
  }
}
