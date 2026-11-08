import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router'
import {
  INDEX_ROBOTS,
  NOINDEX_ROBOTS,
  canonicalUrl,
  pageForPath,
  resolveSiteOrigin,
  seoIdentity,
} from '../../config/seo.ts'

export function DocumentHead() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    const page = pageForPath(pathname)
    const origin = resolveSiteOrigin(
      import.meta.env.VITE_SITE_URL,
      window.location.origin,
    )
    const url = page.index
      ? canonicalUrl(origin, import.meta.env.BASE_URL, page.path)
      : canonicalUrl(origin, import.meta.env.BASE_URL, '/')

    document.title = page.title
    upsertMeta('name', 'description', 'description', page.description)
    upsertMeta('name', 'robots', 'robots', page.index ? INDEX_ROBOTS : NOINDEX_ROBOTS)
    upsertMeta('property', 'og:title', 'og-title', page.title)
    upsertMeta('property', 'og:description', 'og-description', page.description)
    upsertMeta('property', 'og:url', 'og-url', url)
    upsertMeta('property', 'og:site_name', 'og-site-name', seoIdentity.name)
    upsertMeta('name', 'twitter:title', 'twitter-title', page.title)
    upsertMeta('name', 'twitter:description', 'twitter-description', page.description)
    upsertCanonical(page.index ? url : null)
  }, [pathname])

  return null
}

function upsertMeta(
  attribute: 'name' | 'property',
  key: string,
  marker: string,
  content: string,
): void {
  const selector = `meta[data-seo-${marker}]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(`data-seo-${marker}`, '')
    element.setAttribute(attribute, key)
    document.head.append(element)
  }
  element.setAttribute('content', content)
}

function upsertCanonical(href: string | null): void {
  const current = document.head.querySelector<HTMLLinkElement>('link[data-seo-canonical]')
  if (!href) {
    current?.remove()
    return
  }
  const link = current ?? document.createElement('link')
  link.setAttribute('data-seo-canonical', '')
  link.rel = 'canonical'
  link.setAttribute('href', href)
  if (!current) document.head.append(link)
}
