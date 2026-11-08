export const CLOUDFLARE_BEACON_SRC = 'https://static.cloudflareinsights.com/beacon.min.js'

export interface AnalyticsConfig {
  enabled: boolean
  token: string | null
}

export function resolveAnalyticsConfig(env: {
  enabled: string | undefined
  token: string | undefined
}): AnalyticsConfig {
  const token = (env.token ?? '').trim()
  const enabled = env.enabled === 'true' && token.length > 0
  return { enabled, token: enabled ? token : null }
}

export function getAnalyticsConfig(): AnalyticsConfig {
  return resolveAnalyticsConfig({
    enabled: import.meta.env.VITE_ANALYTICS_ENABLED,
    token: import.meta.env.VITE_CF_BEACON_TOKEN,
  })
}

/** Inserts the official beacon only. The payload is the public site token and nothing else. */
export function mountAnalyticsBeacon(doc: Document, config: AnalyticsConfig): () => void {
  if (!config.enabled || !config.token) return () => undefined

  const script = doc.createElement('script')
  script.defer = true
  script.src = CLOUDFLARE_BEACON_SRC
  script.dataset.cfBeacon = JSON.stringify({ token: config.token })
  doc.body.appendChild(script)

  return () => {
    script.remove()
  }
}
