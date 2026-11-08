/** React Router basename from Vite's base, without a trailing slash. */
export function normalizeBasename(base: string | undefined): string | undefined {
  if (!base || base === '/') return undefined
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base
  if (!trimmed || trimmed === '/') return undefined
  return trimmed
}
