import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { chromium } from '@playwright/test'
import { encodePng } from './helpers/png'

export const fixtureDir = join(process.cwd(), 'tests/fixtures/generated')

export default async function globalSetup(): Promise<void> {
  mkdirSync(fixtureDir, { recursive: true })
  writeFileSync(
    join(fixtureDir, 'profile-photo.png'),
    encodePng(1920, 1080, () => [37, 99, 235, 255]),
  )
  writeFileSync(
    join(fixtureDir, 'alpha.png'),
    encodePng(8, 8, (x, y) => (x < 2 && y < 2 ? [220, 38, 38, 255] : [0, 0, 0, 0])),
  )
  writeFileSync(join(fixtureDir, 'notes.txt'), 'hello')
  writeFileSync(join(fixtureDir, 'anim.gif'), Buffer.from('GIF89a'))
  writeFileSync(
    join(fixtureDir, 'corrupt.png'),
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0]),
  )
  writeFileSync(
    join(fixtureDir, 'subject.png'),
    encodePng(80, 60, (x, y) => {
      const subject = x >= 28 && x <= 52 && y >= 18 && y <= 42
      return subject ? [220, 30, 30, 255] : [20, 180, 40, 255]
    }),
  )
  writeFileSync(
    join(fixtureDir, 'noisy.png'),
    encodePng(160, 120, (x, y) => {
      const noise = (x * 131 + y * 719) % 251
      return [noise, (noise * 3) % 255, (noise * 7) % 255, 255]
    }),
  )

  const browser = await chromium.launch()
  const page = await browser.newPage()
  const jpeg = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 16
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('Canvas was not available while creating the JPEG fixture.')
    context.fillStyle = '#1d4ed8'
    context.fillRect(0, 0, 32, 16)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) resolve(value)
          else reject(new Error('JPEG fixture was not created.'))
        },
        'image/jpeg',
        0.9,
      )
    })
    return Array.from(new Uint8Array(await blob.arrayBuffer()))
  })
  writeFileSync(join(fixtureDir, 'vacation.jpg'), Buffer.from(jpeg))
  const noisyJpeg = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 120
    const context = canvas.getContext('2d')
    if (!context)
      throw new Error('Canvas was not available while creating the noisy JPEG fixture.')
    const pixels = context.createImageData(160, 120)
    for (let index = 0; index < pixels.data.length; index += 4) {
      const noise = (index * 17) % 251
      pixels.data[index] = noise
      pixels.data[index + 1] = (noise * 3) % 255
      pixels.data[index + 2] = (noise * 7) % 255
      pixels.data[index + 3] = 255
    }
    context.putImageData(pixels, 0, 0)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) resolve(value)
          else reject(new Error('Noisy JPEG fixture was not created.'))
        },
        'image/jpeg',
        0.95,
      )
    })
    return Array.from(new Uint8Array(await blob.arrayBuffer()))
  })
  writeFileSync(join(fixtureDir, 'noisy.jpg'), Buffer.from(noisyJpeg))
  await browser.close()
}
