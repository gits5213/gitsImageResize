export const seoIdentity = {
  name: 'Image Resizer Pro',
  companyName: 'Global I Tech Solutions',
  companyLegalName: 'Global I Tech Solutions Inc.',
  companyLocation: 'In the City of New York',
  companyUrl: 'https://gitsuniversity.org/',
  defaultGithubRepoUrl: 'https://github.com/gits5213/gitsImageResize',
  defaultOrigin: 'https://gits5213.github.io',
} as const

export const INDEX_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

export const NOINDEX_ROBOTS = 'noindex, follow'

export const homeFaq = [
  {
    question: 'Are my images uploaded?',
    answer:
      'No. Image Resizer Pro resizes files in your browser. Image contents are not sent to an application server or stored by the app.',
  },
  {
    question: 'Which image formats can I resize?',
    answer:
      'You can open JPG, PNG, GIF, WebP, BMP, AVIF, ICO, SVG, TIFF, and HEIC when your browser can decode them. Downloads are PNG or JPG.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No. The resizer is free to open, and this version does not ask you to register or sign in.',
  },
  {
    question: 'Will enlarging an image add detail?',
    answer:
      'No. A larger pixel size does not recreate detail that was not in the original file.',
  },
] as const

export interface SeoPage {
  path: string
  title: string
  description: string
  breadcrumb: string
  index: boolean
}

export const SEO_PAGES: readonly SeoPage[] = [
  {
    path: '/',
    title: 'Resize Images for Free in Your Browser | Image Resizer Pro',
    description:
      'Resize JPG, PNG, WebP, GIF, and other images in your browser. Free, with no account and no upload of image files to an application server.',
    breadcrumb: 'Home',
    index: true,
  },
  {
    path: '/resize',
    title: 'Resize JPG, PNG, and WebP Online | Image Resizer Pro',
    description:
      'Choose a new pixel width and height, preview the image, and download PNG or JPG. Processing stays in your browser.',
    breadcrumb: 'Resize an image',
    index: true,
  },
  {
    path: '/about',
    title: 'About Image Resizer Pro | Global I Tech Solutions',
    description:
      'Image Resizer Pro is a free browser tool from Global I Tech Solutions for resizing images without an account or an upload API.',
    breadcrumb: 'About',
    index: true,
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Image Resizer Pro',
    description:
      'How Image Resizer Pro handles images in your browser, what GitHub Pages may log, and how optional analytics stays separate from image files.',
    breadcrumb: 'Privacy Policy',
    index: true,
  },
  {
    path: '/terms',
    title: 'Terms of Use | Image Resizer Pro',
    description:
      'Draft terms for Image Resizer Pro, a free in-browser image resizer with no account and no application-side image storage.',
    breadcrumb: 'Terms of Use',
    index: true,
  },
  {
    path: '/security',
    title: 'Security & Privacy | Image Resizer Pro',
    description:
      'How Image Resizer Pro resizes files on your device, what it does not upload, and the limits of browser-based image processing.',
    breadcrumb: 'Security & Privacy',
    index: true,
  },
  {
    path: '/disclaimer',
    title: 'Disclaimer | Image Resizer Pro',
    description:
      'Image Resizer Pro is offered as available. Resizing does not add detail, and JPEG downloads do not keep transparency.',
    breadcrumb: 'Disclaimer',
    index: true,
  },
  {
    path: '/contact',
    title: 'Contact | Image Resizer Pro',
    description:
      'How to reach the operator of Image Resizer Pro. This site has no message form and does not upload the images you resize.',
    breadcrumb: 'Contact',
    index: true,
  },
]

export const NOT_FOUND_PAGE: SeoPage = {
  path: '',
  title: 'Page not found | Image Resizer Pro',
  description:
    'That address is not part of Image Resizer Pro. Go back to the free in-browser image resizer.',
  breadcrumb: 'Page not found',
  index: false,
}

export interface SeoRenderContext {
  origin: string
  basePath: string
  lastmod: string
  githubRepoUrl: string
  googleSiteVerification?: string
}

export function resolveSiteOrigin(
  configured: string | undefined,
  fallback: string,
): string {
  const value = (configured ?? '').trim().replace(/\/$/, '')
  if (!value) return normalizeOrigin(fallback)
  return normalizeOrigin(value)
}

function normalizeOrigin(value: string): string {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`Site origin must be an absolute http(s) URL. Received "${value}".`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`Site origin must use http or https. Received "${value}".`)
  }
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(
      'VITE_SITE_URL must be an origin such as https://example.com, without a path, query, or hash.',
    )
  }
  return url.origin
}

export function normalizeRoutePath(pathname: string): string {
  const withLeading = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withLeading.length > 1) return withLeading.replace(/\/+$/, '')
  return '/'
}

export function pageForPath(pathname: string): SeoPage {
  const normalized = normalizeRoutePath(pathname)
  return SEO_PAGES.find((page) => page.path === normalized) ?? NOT_FOUND_PAGE
}

export function canonicalUrl(
  origin: string,
  basePath: string,
  routePath: string,
): string {
  const root = publicRoot(origin, basePath)
  const route = routePath === '/' ? '' : routePath.replace(/^\//, '').replace(/\/$/, '')
  const url = new URL(route, root)
  const href = url.href
  return href.endsWith('/') ? href : `${href}/`
}

export function publicAssetUrl(
  origin: string,
  basePath: string,
  assetPath: string,
): string {
  const root = publicRoot(origin, basePath)
  return new URL(assetPath.replace(/^\//, ''), root).href
}

function publicRoot(origin: string, basePath: string): URL {
  const normalizedOrigin = origin.trim().replace(/\/$/, '')
  const base = basePath.trim()
  const withLeading = base.startsWith('/') ? base : `/${base}`
  const directory = withLeading.endsWith('/') ? withLeading : `${withLeading}/`
  return new URL(directory, `${normalizedOrigin}/`)
}

export function renderSitemap(
  pages: readonly SeoPage[],
  context: Pick<SeoRenderContext, 'origin' | 'basePath' | 'lastmod'>,
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(context.lastmod)) {
    throw new Error(`Sitemap lastmod must be YYYY-MM-DD. Received "${context.lastmod}".`)
  }
  const urls = pages
    .filter((page) => page.index)
    .map((page) => {
      const loc = escapeHtml(canonicalUrl(context.origin, context.basePath, page.path))
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${context.lastmod}</lastmod>\n  </url>`
    })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function renderRobots(sitemapUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`
}

export function buildJsonLd(page: SeoPage, context: SeoRenderContext): string {
  const home = canonicalUrl(context.origin, context.basePath, '/')
  if (!page.index) {
    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title,
      description: page.description,
    }).replaceAll('<', '\\u003c')
  }

  const pageUrl = canonicalUrl(context.origin, context.basePath, page.path)
  const websiteId = `${home}#website`
  const organizationId = `${home}#organization`
  const graph: Record<string, unknown>[] = []

  if (page.path === '/') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: seoIdentity.companyLegalName,
        url: seoIdentity.companyUrl,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'New York',
          addressRegion: 'NY',
          addressCountry: 'US',
        },
        sameAs: sameAsLinks(context.githubRepoUrl),
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: home,
        name: seoIdentity.name,
        description: page.description,
        inLanguage: 'en',
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${home}#app`,
        name: seoIdentity.name,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        url: home,
        description: page.description,
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Pixel width and height resizing',
          'Aspect ratio lock',
          'PNG and JPG download',
          'Browser-based processing',
          'No account',
        ],
        provider: { '@id': organizationId },
      },
      {
        '@type': 'FAQPage',
        '@id': `${home}#faq`,
        url: home,
        isPartOf: { '@id': websiteId },
        mainEntity: homeFaq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    )
  }

  graph.push({
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: page.title,
    description: page.description,
    inLanguage: 'en',
    isPartOf: { '@id': websiteId },
  })

  if (page.path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: home,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: page.breadcrumb,
          item: pageUrl,
        },
      ],
    })
  }

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph,
  }).replaceAll('<', '\\u003c')
}

function sameAsLinks(githubRepoUrl: string): string[] {
  const links: string[] = []
  try {
    const parsed = new URL(githubRepoUrl)
    if (parsed.protocol === 'https:' && parsed.hostname === 'github.com')
      links.push(parsed.href)
  } catch {
    // Ignore an unpublished or invalid repository URL.
  }
  return links
}

export function renderRouteHtml(
  template: string,
  page: SeoPage,
  context: SeoRenderContext,
): string {
  const home = canonicalUrl(context.origin, context.basePath, '/')
  const pageUrl = page.index
    ? canonicalUrl(context.origin, context.basePath, page.path)
    : home
  const robots = page.index ? INDEX_ROBOTS : NOINDEX_ROBOTS
  let html = template
  html = replaceTextElement(html, 'title', 'data-seo-title', escapeHtml(page.title))
  html = replaceAttribute(html, 'data-seo-description', 'content', page.description)
  html = replaceAttribute(html, 'data-seo-robots', 'content', robots)
  html = replaceAttribute(html, 'data-seo-og-title', 'content', page.title)
  html = replaceAttribute(html, 'data-seo-og-description', 'content', page.description)
  html = replaceAttribute(html, 'data-seo-og-url', 'content', pageUrl)
  html = replaceAttribute(html, 'data-seo-twitter-title', 'content', page.title)
  html = replaceAttribute(
    html,
    'data-seo-twitter-description',
    'content',
    page.description,
  )
  html = page.index
    ? replaceAttribute(html, 'data-seo-canonical', 'href', pageUrl)
    : html.replace(/<link\b[^>]*\bdata-seo-canonical\b[^>]*>\s*/i, '')
  html = replaceTextElement(html, 'script', 'data-seo-jsonld', buildJsonLd(page, context))
  html = replaceTextElement(
    html,
    'noscript',
    'data-seo-noscript',
    noscriptFor(page, context),
  )
  html = upsertHeadTag(
    html,
    'rel="sitemap"',
    `<link rel="sitemap" type="application/xml" title="Sitemap" href="${escapeHtml(publicAssetUrl(context.origin, context.basePath, 'sitemap.xml'))}" />`,
  )
  const verification = verificationToken(context.googleSiteVerification)
  if (verification) {
    html = upsertHeadTag(
      html,
      'name="google-site-verification"',
      `<meta name="google-site-verification" content="${escapeHtml(verification)}" />`,
    )
  }
  return html
}

function noscriptFor(page: SeoPage, context: SeoRenderContext): string {
  const home = canonicalUrl(context.origin, context.basePath, '/')
  if (page.path === '/') {
    const links = SEO_PAGES.filter((item) => item.index && item.path !== '/')
      .map(
        (item) =>
          `<a href="${escapeHtml(canonicalUrl(context.origin, context.basePath, item.path))}">${escapeHtml(item.breadcrumb)}</a>`,
      )
      .join(' ')
    return `<p>${escapeHtml(page.description)} ${links}</p>`
  }
  return `<p>${escapeHtml(page.description)} <a href="${escapeHtml(home)}">Home</a></p>`
}

function verificationToken(token: string | undefined): string | null {
  const value = (token ?? '').trim()
  if (!value || /[<>"'&\s]/.test(value)) return null
  return value
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function replaceTextElement(
  html: string,
  tag: string,
  marker: string,
  text: string,
): string {
  const pattern = new RegExp(
    `<${tag}\\b[^>]*\\b${marker}\\b[^>]*>[\\s\\S]*?</${tag}>`,
    'i',
  )
  if (!pattern.test(html)) throw new Error(`SEO template is missing <${tag} ${marker}>.`)
  return html.replace(pattern, (match) => {
    const open = match.slice(0, match.indexOf('>') + 1)
    return `${open}${text}</${tag}>`
  })
}

function replaceAttribute(
  html: string,
  marker: string,
  attribute: string,
  value: string,
): string {
  const pattern = new RegExp(`<[a-z0-9]+\\b[^>]*\\b${marker}\\b[^>]*>`, 'i')
  const tag = html.match(pattern)?.[0]
  if (!tag) throw new Error(`SEO template is missing ${marker}.`)
  const attributePattern = new RegExp(`\\b${attribute}="[^"]*"`)
  if (!attributePattern.test(tag)) {
    throw new Error(`SEO template is missing ${attribute} on ${marker}.`)
  }
  const nextTag = tag.replace(attributePattern, `${attribute}="${escapeHtml(value)}"`)
  return html.replace(tag, nextTag)
}

function upsertHeadTag(html: string, marker: string, tag: string): string {
  const pattern = new RegExp(`<(?:link|meta)\\b[^>]*${marker}[^>]*>`, 'i')
  if (pattern.test(html)) return html.replace(pattern, tag)
  return html.replace('</head>', `    ${tag}\n  </head>`)
}
