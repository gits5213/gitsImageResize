import { expect, test } from '@playwright/test'
import { fixtures } from './fixtures.ts'
import { ResizerPage } from './pages/resizer.page.ts'

function watchRequests(page: import('@playwright/test').Page) {
  const external: string[] = []
  const nonGet: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.protocol === 'blob:' || url.protocol === 'data:') return
    const hostname = url.hostname
    if (
      hostname !== '127.0.0.1' &&
      hostname !== 'localhost' &&
      hostname !== 'abacus.jasoncameron.dev'
    )
      external.push(request.url())
    if (request.method() !== 'GET' && request.method() !== 'HEAD')
      nonGet.push(request.url())
    const body = request.postData() ?? ''
    if (body.includes('profile-photo') || url.href.includes('profile-photo')) {
      external.push(request.url())
    }
  })
  return { external, nonGet }
}

test('TC27 image content is not uploaded', async ({ page }) => {
  const seen = watchRequests(page)
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.png)
  await resizer.setWidth('160')
  await resizer.resize()
  expect(seen.external).toEqual([])
  expect(seen.nonGet).toEqual([])
  expect(seen.external.join(' ')).not.toMatch(/cloudflare/i)
})

test('TC28 analytics is optional', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('TC29 analytics is not given image contents', async ({ page }) => {
  const seen = watchRequests(page)
  const resizer = new ResizerPage(page)
  await resizer.open('/resize')
  await resizer.upload(fixtures.png)
  await resizer.resize()
  const joined = seen.external.join(' ')
  expect(joined).not.toMatch(/cloudflareinsights|profile-photo/i)
  await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0)
})

test('TC30 the app works with analytics disabled', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0)
  await resizer.upload(fixtures.jpeg)
  await expect(page.getByTestId('original-meta')).toContainText('JPEG')
  await resizer.setWidth('16')
  await resizer.resize()
  await expect(page.getByTestId('resized-meta')).toContainText('16 × 8 pixels')
})
