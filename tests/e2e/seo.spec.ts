import { expect, test } from '@playwright/test'

test('homepage metadata and FAQ are available to crawlers', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.ok()).toBeTruthy()
  await expect(page).toHaveTitle(
    'Resize Images for Free in Your Browser | Image Resizer Pro',
  )
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /your browser/,
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    /index, follow/,
  )
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent()
  expect(jsonLd).toContain('FAQPage')
  expect(jsonLd).toContain('SoftwareApplication')
  await expect(
    page.getByRole('heading', { level: 2, name: 'Common questions' }),
  ).toBeVisible()
  await expect(page.getByText('Are my images uploaded?')).toBeVisible()
})

test('each public route is a real HTML document', async ({ request }) => {
  const about = await request.get('/about/')
  expect(about.ok()).toBeTruthy()
  const html = await about.text()
  expect(html).toContain(
    '<title data-seo-title>About Image Resizer Pro | Global I Tech Solutions</title>',
  )
  expect(html).toContain('BreadcrumbList')
  expect(html).not.toContain('FAQPage')

  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBeTruthy()
  const robotsText = await robots.text()
  expect(robotsText).toContain('Allow: /')
  expect(robotsText).toMatch(/Sitemap: https?:\/\/\S+\/sitemap\.xml/)

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok()).toBeTruthy()
  const xml = await sitemap.text()
  expect(xml).toContain('/about/')
  expect(xml).toContain('/resize/')
  expect(xml).not.toContain('missing-page')
})

test('client navigation updates the document title', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'About' })
    .click()
  await expect(page).toHaveTitle('About Image Resizer Pro | Global I Tech Solutions')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/about\/$/,
  )
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
})

test('unknown routes are noindex', async ({ page }) => {
  await page.goto('/missing-page')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Page not found' }),
  ).toBeVisible()
  await expect(page).toHaveTitle('Page not found | Image Resizer Pro')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})
