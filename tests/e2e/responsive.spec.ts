import { expect, test } from '@playwright/test'
import { fixtures } from './fixtures.ts'
import { ResizerPage } from './pages/resizer.page.ts'

test('TC18 mobile layout stacks the previews', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  const resizer = new ResizerPage(page)
  await resizer.open()
  await expect(page.getByTestId('nav-toggle')).toBeVisible()
  await page.getByTestId('nav-toggle').click()
  await expect(
    page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'About' }),
  ).toBeVisible()

  await resizer.upload(fixtures.png)
  await resizer.setWidth('320')
  await resizer.resize()
  const original = await page.getByTestId('original-preview-card').boundingBox()
  const resized = await page.getByTestId('resized-preview-card').boundingBox()
  expect(original).not.toBeNull()
  expect(resized).not.toBeNull()
  expect(resized!.y).toBeGreaterThan(original!.y + original!.height - 8)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
})

test('TC19 dark mode can be turned on', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gits-image-resize-theme', 'light'))
  await page.goto('/')
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('gits-image-resize-theme')))
    .toBe('dark')
})

test('TC20 light mode can be turned on', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gits-image-resize-theme', 'dark'))
  await page.goto('/')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByTestId('theme-toggle').click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('gits-image-resize-theme')))
    .toBe('light')
})
