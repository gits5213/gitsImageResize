import { createHash } from 'node:crypto'

/** Lets the inline JSON-LD block satisfy the production script-src policy. */
export function hashInlineJsonLd(html: string): string {
  const match = html.match(/<script\b[^>]*\bdata-seo-jsonld\b[^>]*>([\s\S]*?)<\/script>/i)
  if (!match?.[1]) return html
  if (!html.includes('Content-Security-Policy')) return html
  const digest = createHash('sha256').update(match[1], 'utf8').digest('base64')
  const hash = `'sha256-${digest}'`
  return html.replace(
    /(<meta\b[^>]*http-equiv="Content-Security-Policy"[^>]*content=")([^"]*)(")/i,
    (_full, start: string, policy: string, end: string) => {
      if (policy.includes(hash)) return `${start}${policy}${end}`
      if (!policy.includes("script-src 'self'")) return `${start}${policy}${end}`
      return `${start}${policy.replace("script-src 'self'", `script-src 'self' ${hash}`)}${end}`
    },
  )
}
