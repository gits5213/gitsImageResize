import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { fixtures } from './fixtures.ts'
import { ResizerPage } from './pages/resizer.page.ts'

test('TC31 a JPG maximum size reduces the download', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.noisyJpeg)
  await expect(page.getByTestId('output-format')).toHaveValue('jpeg')
  await resizer.setMaxFileSize('8')
  await resizer.resize()
  await expect(page.getByTestId('size-comparison')).toContainText(/smaller/i)
  const download = await resizer.download()
  const filePath = await download.path()
  expect(download.suggestedFilename()).toMatch(/\.jpg$/)
  expect(readFileSync(filePath ?? '').length).toBeLessThanOrEqual(8 * 1024)
})

test('TC32 an unreachable JPG size explains the smallest result', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.noisyJpeg)
  await resizer.setMaxFileSize('1')
  await page.getByTestId('resize-button').click()
  await expect(page.getByTestId('error-message')).toContainText(/cannot be reduced/i)
})

test('TC33 a PNG that cannot reach the limit asks for JPG', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.noisyPng)
  await expect(page.getByTestId('output-format')).toHaveValue('png')
  await resizer.setMaxFileSize('1')
  await page.getByTestId('resize-button').click()
  await expect(page.getByTestId('error-message')).toContainText(/Choose JPG/i)
})

test('TC34 changing the maximum size blocks the previous download', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.jpeg)
  await resizer.resize()
  await expect(page.getByTestId('download-button')).toBeEnabled()
  await resizer.setMaxFileSize('20')
  await expect(page.getByTestId('download-button')).toBeDisabled()
  await expect(
    page.getByText(/maximum size, compression, and background you chose/i),
  ).toBeVisible()
})

test('TC35 a scenario replaces a plain background and keeps the subject', async ({
  page,
}) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.subject)
  await resizer.chooseBackground('beach')
  await expect(page.getByTestId('background-select')).toHaveValue('beach')
  await resizer.resize()
  const corner = await resizer.sampleResized(2, 2)
  const center = await resizer.sampleResized(40, 30)
  const originalGreen = corner[0] < 50 && corner[1] > 140 && corner[2] < 80
  expect(originalGreen).toBe(false)
  expect(center[0]).toBeGreaterThan(150)
  expect(center[0]).toBeGreaterThan(center[1] + 40)
})

test('TC36 a chosen color becomes the new background', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.subject)
  await resizer.chooseBackground('color')
  await page.getByRole('button', { name: 'Use color #2563eb' }).click()
  await expect(page.getByTestId('background-color-input')).toHaveValue('#2563eb')
  await resizer.resize()
  const corner = await resizer.sampleResized(2, 2)
  expect(corner[0]).toBeGreaterThan(25)
  expect(corner[0]).toBeLessThan(50)
  expect(corner[2]).toBeGreaterThan(220)
})

test('TC37 a transparent background removes a plain backdrop', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.subject)
  await resizer.chooseBackground('transparent')
  await resizer.resize()
  const corner = await resizer.sampleResized(2, 2)
  const center = await resizer.sampleResized(40, 30)
  expect(corner[3]).toBe(0)
  expect(center[3]).toBe(255)
  expect(center[0]).toBeGreaterThan(center[1])
})

test('TC38 light focus brightens the center and darkens the edges', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.png)
  await resizer.setWidth('200')
  await resizer.setLightFocus('100')
  await expect(page.getByTestId('light-focus')).toHaveValue('100')
  await expect(page.locator('label[for="light-focus"]')).toContainText('100')
  await resizer.resize()
  const corner = await resizer.sampleResized(2, 2)
  const center = await resizer.sampleResized(100, 56)
  const cornerLight = corner[0] + corner[1] + corner[2]
  const centerLight = center[0] + center[1] + center[2]
  expect(centerLight).toBeGreaterThan(cornerLight + 30)
})

test('TC40 a JPG download is compressed below the original upload', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.noisyJpeg)
  await expect(page.getByTestId('compression')).toHaveValue('40')
  await expect(page.getByTestId('compression-note')).toContainText(/compressed by 40%/i)
  await resizer.resize()
  await expect(page.getByTestId('size-comparison')).toContainText(/smaller/i)
  const original = readFileSync(fixtures.noisyJpeg).length
  const download = await resizer.download()
  const filePath = await download.path()
  expect(readFileSync(filePath ?? '').length).toBeLessThan(original)
})

test('TC39 changing the background refreshes the download', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.subject)
  await resizer.chooseBackground('beach')
  await expect(page.getByTestId('resized-preview')).toBeVisible()
  await expect(page.getByTestId('download-button')).toBeEnabled()
  await resizer.chooseBackground('forest')
  await expect(page.getByTestId('download-button')).toBeEnabled()
  await expect(page.getByTestId('background-select')).toHaveValue('forest')
})
