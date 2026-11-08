import { expect, test } from '@playwright/test'
import { fixtures } from './fixtures.ts'
import { ResizerPage } from './pages/resizer.page.ts'

test.beforeEach(async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.png)
})

test('TC06 width can be changed', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.setWidth('960')
  await expect(resizer.width()).toHaveValue('960')
  await expect(resizer.height()).toHaveValue('540')
})

test('TC07 height can be changed', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.setHeight('540')
  await expect(resizer.height()).toHaveValue('540')
  await expect(resizer.width()).toHaveValue('960')
})

test('TC08 aspect ratio lock updates the other side', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await expect(page.getByTestId('aspect-lock')).toHaveAttribute('aria-checked', 'true')
  await resizer.setWidth('960')
  await expect(resizer.height()).toHaveValue('540')
  await resizer.setHeight('270')
  await expect(resizer.width()).toHaveValue('480')
})

test('TC09 dimensions can be edited independently', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await page.getByTestId('aspect-lock').click()
  await expect(page.getByTestId('distortion-warning')).toBeVisible()
  await resizer.setWidth('100')
  await expect(resizer.height()).toHaveValue('1080')
  await resizer.setHeight('50')
  await expect(resizer.width()).toHaveValue('100')
})

test('TC10 invalid dimensions are rejected', async ({ page }) => {
  const resizer = new ResizerPage(page)
  for (const value of ['0', '-4', '10.5', 'abc']) {
    await resizer.setWidth(value)
    await expect(page.getByText(/positive whole number/i)).toBeVisible()
    await expect(page.getByTestId('resize-button')).toBeDisabled()
  }
})

test('TC11 image resizing works', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.setWidth('800')
  await expect(resizer.height()).toHaveValue('450')
  await resizer.resize()
  await expect(page.getByTestId('resized-meta')).toContainText('800 × 450 pixels')
})

test('TC12 resized preview shows the new image', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.setWidth('800')
  await resizer.resize()
  await expect
    .poll(() =>
      page
        .getByTestId('resized-preview')
        .evaluate((image: HTMLImageElement) => (image.complete ? image.naturalWidth : 0)),
    )
    .toBe(800)
  const original = await page.getByTestId('original-preview-card').boundingBox()
  const resized = await page.getByTestId('resized-preview-card').boundingBox()
  expect(original).not.toBeNull()
  expect(resized).not.toBeNull()
  expect(resized!.x).toBeGreaterThan(original!.x + 20)
})

test('TC16 reset restores the original dimensions', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await page.getByTestId('aspect-lock').click()
  await resizer.setWidth('100')
  await page.getByTestId('reset-dimensions').click()
  await expect(resizer.width()).toHaveValue('1920')
  await expect(resizer.height()).toHaveValue('1080')
  await expect(page.getByTestId('aspect-lock')).toHaveAttribute('aria-checked', 'true')
})

test('TC17 clear image returns to the upload screen', async ({ page }) => {
  await page.getByTestId('clear-image').click()
  await expect(page.getByText('Drop an image here')).toBeVisible()
  await expect(page.getByTestId('original-meta')).toHaveCount(0)
  await expect(page.getByTestId('original-preview')).toHaveCount(0)
})

test('JPEG output warns about transparency', async ({ page }) => {
  await page.getByTestId('output-format').selectOption('jpeg')
  await expect(page.getByTestId('jpeg-warning')).toContainText(
    'does not support transparency',
  )
})
