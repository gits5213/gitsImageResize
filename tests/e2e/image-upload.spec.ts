import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { fixtures } from './fixtures.ts'
import { ResizerPage } from './pages/resizer.page.ts'

test('TC01 homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Resize Images Online for Free' }),
  ).toBeVisible()
  await expect(page.getByTestId('dropzone')).toBeVisible()
  await expect(page.getByText('Drop an image here')).toBeVisible()
})

test('TC02 image upload works', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open('/resize')
  await resizer.upload(fixtures.png)
  await expect(page.getByTestId('original-preview')).toBeVisible()
})

test('TC03 drag and drop upload works', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  const payload = readFileSync(fixtures.png).toString('base64')
  await page.evaluate((encoded) => {
    const binary = atob(encoded)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1)
      bytes[index] = binary.charCodeAt(index)
    const file = new File([bytes], 'profile-photo.png', { type: 'image/png' })
    const transfer = new DataTransfer()
    transfer.items.add(file)
    const zone = document.querySelector('[data-testid="dropzone"]')
    if (!zone) throw new Error('Drop zone was not found.')
    for (const name of ['dragenter', 'dragover', 'drop']) {
      zone.dispatchEvent(
        new DragEvent(name, { bubbles: true, cancelable: true, dataTransfer: transfer }),
      )
    }
  }, payload)
  await expect(page.getByTestId('original-meta')).toContainText('profile-photo.png')
  await expect(page.getByTestId('original-meta')).toContainText('1920 × 1080 pixels')
})

test('TC04 unsupported files are rejected', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.choose(fixtures.text)
  await expect(page.getByTestId('error-message')).toContainText('not supported')
  await expect(page.getByTestId('original-meta')).toHaveCount(0)

  await resizer.choose(fixtures.gif)
  await expect(page.getByTestId('error-message')).toContainText(
    /could not be read|corrupted/i,
  )
})

test('TC05 original image information is shown', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.png)
  const meta = page.getByTestId('original-meta')
  await expect(meta).toContainText('profile-photo.png')
  await expect(meta).toContainText('1920 × 1080 pixels')
  await expect(meta).toContainText('PNG')
  await expect(meta).toContainText(/File size/)
  await expect(resizer.width()).toHaveValue('1920')
  await expect(resizer.height()).toHaveValue('1080')

  await page.getByTestId('clear-image').click()
  await resizer.upload(fixtures.jpeg)
  await expect(page.getByTestId('original-meta')).toContainText('vacation.jpg')
  await expect(page.getByTestId('original-meta')).toContainText('JPEG')
  await expect(page.getByTestId('original-meta')).toContainText('32 × 16 pixels')
})

test('a corrupted PNG is rejected', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.choose(fixtures.corrupt)
  await expect(page.getByTestId('error-message')).toContainText(
    /corrupted|could not be read/i,
  )
  await expect(page.getByTestId('original-meta')).toHaveCount(0)
})
