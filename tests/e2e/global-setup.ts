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
  await browser.close()
}
