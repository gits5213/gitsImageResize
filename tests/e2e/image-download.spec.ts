import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { fixtures } from './fixtures.ts'
import { readPngSize } from './helpers/png.ts'
import { ResizerPage } from './pages/resizer.page.ts'

test('TC13 and TC14 the download matches the requested PNG size', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.png)
  await resizer.setWidth('800')
  await resizer.resize()
  const download = await resizer.download()
  expect(download.suggestedFilename()).toBe('profile-photo-800x450.png')
  const filePath = await download.path()
  expect(filePath).toBeTruthy()
  expect(readPngSize(readFileSync(filePath ?? ''))).toEqual({ width: 800, height: 450 })
})

test('TC15 PNG transparency is preserved', async ({ page }) => {
  const resizer = new ResizerPage(page)
  await resizer.open()
  await resizer.upload(fixtures.alpha)
  await expect(page.getByTestId('output-format')).toHaveValue('png')
  await resizer.resize()
  const download = await resizer.download()
  const filePath = await download.path()
  const encoded = readFileSync(filePath ?? '').toString('base64')
  const pixels = await page.evaluate(async (data) => {
    const image = new Image()
    image.src = `data:image/png;base64,${data}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable.')
    context.drawImage(image, 0, 0)
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      topLeftAlpha: context.getImageData(0, 0, 1, 1).data[3] ?? 0,
      bottomRightAlpha:
        context.getImageData(image.naturalWidth - 1, image.naturalHeight - 1, 1, 1)
          .data[3] ?? 0,
    }
  }, encoded)
  expect(pixels).toEqual({ width: 8, height: 8, topLeftAlpha: 255, bottomRightAlpha: 0 })
})
