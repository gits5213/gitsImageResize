import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { loadEnv, type Plugin } from 'vite'
import { defineConfig } from 'vitest/config'
import { hashInlineJsonLd } from './scripts/seoCsp.ts'
import {
  NOT_FOUND_PAGE,
  SEO_PAGES,
  publicAssetUrl,
  renderRobots,
  renderRouteHtml,
  renderSitemap,
  resolveSiteOrigin,
  seoIdentity,
  type SeoRenderContext,
} from './src/config/seo.ts'

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' https://static.cloudflareinsights.com",
  "connect-src 'self' https://cloudflareinsights.com https://abacus.jasoncameron.dev",
  "worker-src 'self' blob:",
  "form-action 'none'",
].join('; ')

function contentSecurityPolicyPlugin(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml(html) {
      const meta = `<meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy}" />`
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    ${meta}`,
      )
    },
  }
}

function readPublicEnv(fileEnv: Record<string, string>, key: string): string {
  return (process.env[key] || fileEnv[key] || '').trim()
}

/** Writes one HTML file per route, plus robots.txt and sitemap.xml. */
function seoFilesPlugin(context: SeoRenderContext): Plugin {
  return {
    name: 'seo-files',
    apply: 'build',
    writeBundle() {
      const dist = resolve(process.cwd(), 'dist')
      const template = readFileSync(resolve(dist, 'index.html'), 'utf8')
      const writeHtml = (page: (typeof SEO_PAGES)[number], file: string) => {
        const html = hashInlineJsonLd(renderRouteHtml(template, page, context))
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html)
      }

      for (const page of SEO_PAGES) {
        const file =
          page.path === '/'
            ? resolve(dist, 'index.html')
            : resolve(dist, page.path.slice(1), 'index.html')
        writeHtml(page, file)
      }

      writeHtml(NOT_FOUND_PAGE, resolve(dist, '404.html'))
      writeFileSync(
        resolve(dist, 'robots.txt'),
        renderRobots(publicAssetUrl(context.origin, context.basePath, 'sitemap.xml')),
      )
      writeFileSync(resolve(dist, 'sitemap.xml'), renderSitemap(SEO_PAGES, context))
    },
  }
}

/** GitHub Pages serves 404.html for unknown paths while keeping the requested URL. */
function githubPagesSpaFallback(): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    writeBundle() {
      const dist = resolve(process.cwd(), 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const base = process.env.VITE_BASE_PATH || fileEnv.VITE_BASE_PATH || '/'
  const seoContext: SeoRenderContext = {
    origin: resolveSiteOrigin(
      readPublicEnv(fileEnv, 'VITE_SITE_URL'),
      seoIdentity.defaultOrigin,
    ),
    basePath: base,
    lastmod: new Date().toISOString().slice(0, 10),
    githubRepoUrl:
      readPublicEnv(fileEnv, 'VITE_GITHUB_REPO_URL') || seoIdentity.defaultGithubRepoUrl,
    googleSiteVerification: readPublicEnv(fileEnv, 'VITE_GOOGLE_SITE_VERIFICATION'),
  }

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      contentSecurityPolicyPlugin(),
      githubPagesSpaFallback(),
      seoFilesPlugin(seoContext),
    ],
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'scripts/**/*.test.ts'],
      setupFiles: ['./src/test/setup.ts'],
    },
  }
})
