import { describe, expect, it } from 'vitest'
import template from '../../index.html?raw'
import {
  INDEX_ROBOTS,
  NOT_FOUND_PAGE,
  SEO_PAGES,
  buildJsonLd,
  canonicalUrl,
  pageForPath,
  publicAssetUrl,
  renderRobots,
  renderRouteHtml,
  renderSitemap,
  resolveSiteOrigin,
  seoIdentity,
  type SeoRenderContext,
} from './seo.ts'

const context: SeoRenderContext = {
  origin: 'https://gits5213.github.io',
  basePath: '/',
  lastmod: '2026-11-08',
  githubRepoUrl: seoIdentity.defaultGithubRepoUrl,
}

describe('public URLs', () => {
  it('builds trailing-slash canonicals for the site root and a project path', () => {
    expect(canonicalUrl('https://gits5213.github.io', '/', '/')).toBe(
      'https://gits5213.github.io/',
    )
    expect(
      canonicalUrl('https://gits5213.github.io/', '/gitsImageResize', '/about'),
    ).toBe('https://gits5213.github.io/gitsImageResize/about/')
    expect(
      publicAssetUrl('https://gits5213.github.io', '/gitsImageResize/', 'sitemap.xml'),
    ).toBe('https://gits5213.github.io/gitsImageResize/sitemap.xml')
  })

  it('accepts an origin and rejects a URL with a path', () => {
    expect(resolveSiteOrigin('https://Example.com/', seoIdentity.defaultOrigin)).toBe(
      'https://example.com',
    )
    expect(resolveSiteOrigin('  ', seoIdentity.defaultOrigin)).toBe(
      seoIdentity.defaultOrigin,
    )
    expect(() =>
      resolveSiteOrigin('https://example.com/app', seoIdentity.defaultOrigin),
    ).toThrow(/without a path/)
  })
})

describe('page metadata', () => {
  it('matches routes with or without a trailing slash', () => {
    expect(pageForPath('/about/').title).toBe(pageForPath('/about').title)
    expect(pageForPath('resize').path).toBe('/resize')
    expect(pageForPath('/missing').index).toBe(false)
  })

  it('gives every indexable route a distinct title and description', () => {
    const titles = new Set(SEO_PAGES.map((page) => page.title))
    const descriptions = new Set(SEO_PAGES.map((page) => page.description))
    expect(titles.size).toBe(SEO_PAGES.length)
    expect(descriptions.size).toBe(SEO_PAGES.length)
    expect(SEO_PAGES.every((page) => page.index)).toBe(true)
  })
})

describe('sitemap and robots', () => {
  it('lists indexable routes and points robots at the sitemap', () => {
    const xml = renderSitemap(SEO_PAGES, context)
    expect(xml).toContain('https://gits5213.github.io/about/')
    expect(xml).toContain('<lastmod>2026-11-08</lastmod>')
    expect(xml).not.toContain('missing')
    const sitemapUrl = publicAssetUrl(context.origin, context.basePath, 'sitemap.xml')
    expect(renderRobots(sitemapUrl)).toContain(`Sitemap: ${sitemapUrl}`)
    expect(renderRobots(sitemapUrl)).toContain('Allow: /')
  })
})

describe('route HTML', () => {
  it('fills the home page with indexable metadata and FAQ structured data', () => {
    const html = renderRouteHtml(template, pageForPath('/'), context)
    const home = SEO_PAGES[0]
    expect(home).toBeDefined()
    expect(html).toContain(`<title data-seo-title>${home?.title}</title>`)
    expect(html).toContain(`content="${INDEX_ROBOTS}"`)
    expect(html).toContain('href="https://gits5213.github.io/"')
    expect(html).toContain('FAQPage')
    expect(html).toContain('SoftwareApplication')
    expect(html).toContain('Are my images uploaded?')
    expect(html).toContain('rel="sitemap"')
    expect(buildJsonLd(home!, context)).not.toContain('<')
  })

  it('writes unique copy for an inner page and escapes the security title', () => {
    const about = renderRouteHtml(template, pageForPath('/about'), context)
    expect(about).toContain('About Image Resizer Pro | Global I Tech Solutions')
    expect(about).toContain('href="https://gits5213.github.io/about/"')
    expect(about).toContain('BreadcrumbList')
    expect(about).not.toContain('FAQPage')

    const security = renderRouteHtml(template, pageForPath('/security'), context)
    expect(security).toContain('Security &amp; Privacy | Image Resizer Pro')
  })

  it('marks the unknown-page shell as noindex and omits a canonical', () => {
    const html = renderRouteHtml(template, NOT_FOUND_PAGE, context)
    expect(html).toContain('content="noindex, follow"')
    expect(html).not.toContain('data-seo-canonical')
    expect(html).toContain('Page not found | Image Resizer Pro')
  })

  it('adds a search console token only when the token is a single safe word', () => {
    const withToken = renderRouteHtml(template, pageForPath('/'), {
      ...context,
      googleSiteVerification: 'abc_123-XYZ',
    })
    expect(withToken).toContain('name="google-site-verification" content="abc_123-XYZ"')
    const rejected = renderRouteHtml(template, pageForPath('/'), {
      ...context,
      googleSiteVerification: 'bad token',
    })
    expect(rejected).not.toContain('google-site-verification')
  })
})
