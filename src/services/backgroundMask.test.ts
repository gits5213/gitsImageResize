import { describe, expect, it } from 'vitest'
import {
  backgroundKey,
  clampLightFocus,
  isBackgroundScene,
  sanitizeColor,
} from './backgrounds.ts'
import { subjectAlpha } from './backgroundMask.ts'

function fill(
  width: number,
  height: number,
  paint: (pixels: Uint8ClampedArray, x: number, y: number) => void,
): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) paint(pixels, x, y)
  }
  return pixels
}

function setPixel(
  pixels: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  color: [number, number, number, number],
) {
  const offset = (y * width + x) * 4
  pixels.set(color, offset)
}

describe('subjectAlpha', () => {
  it('keeps transparency that is already in the image', () => {
    const pixels = fill(4, 4, (data, x, y) => {
      const clear = x === 0 || y === 0 || x === 3 || y === 3
      setPixel(data, 4, x, y, clear ? [0, 255, 0, 0] : [200, 20, 20, 255])
    })
    const alpha = subjectAlpha(pixels, 4, 4)
    expect(alpha[0]).toBe(0)
    expect(alpha[1 * 4 + 1]).toBe(255)
  })

  it('removes a plain corner color and keeps the subject', () => {
    const pixels = fill(6, 6, (data, x, y) => {
      const subject = x >= 2 && x <= 3 && y >= 2 && y <= 3
      setPixel(data, 6, x, y, subject ? [220, 30, 30, 255] : [20, 180, 40, 255])
    })
    const alpha = subjectAlpha(pixels, 6, 6)
    expect(alpha[0]).toBe(0)
    expect(alpha[2 * 6 + 2]).toBe(255)
  })

  it('removes a green backdrop and the white glow around the subject', () => {
    const size = 220
    const pixels = fill(size, size, (data, x, y) => {
      const dx = x - (size - 1) / 2
      const dy = y - (size - 1) / 2
      const distance = Math.hypot(dx, dy)
      if (distance <= 20) {
        setPixel(data, size, x, y, [180, 80, 60, 255])
        return
      }
      const glow = Math.min(1, Math.max(0, (170 - distance) / 150))
      setPixel(data, size, x, y, [
        Math.round(255 * glow + 20 * (1 - glow)),
        Math.round(255 * glow + 170 * (1 - glow)),
        Math.round(255 * glow + 50 * (1 - glow)),
        255,
      ])
    })
    const alpha = subjectAlpha(pixels, size, size)
    const center = Math.floor(size / 2)
    expect(alpha[2]).toBe(0)
    expect(alpha[(center - 100) * size + center]).toBe(0)
    expect(alpha[center * size + center]).toBe(255)
    expect(pixels[(center * size + center) * 4]).toBe(180)
  })

  it('removes a colored backdrop everywhere and keeps other clothing', () => {
    const width = 80
    const height = 90
    const pixels = fill(width, height, (data, x, y) => {
      const jeans = y >= 68
      const shirt = x >= 18 && x <= 62 && y >= 24 && y < 68
      const pocket = x >= 40 && x <= 52 && y >= 36 && y <= 48
      if (jeans) setPixel(data, width, x, y, [20, 45, 140, 255])
      else if (pocket) setPixel(data, width, x, y, [30, 190, 50, 255])
      else if (shirt) setPixel(data, width, x, y, [235, 235, 235, 255])
      else setPixel(data, width, x, y, [40, 200, 55, 255])
    })
    const alpha = subjectAlpha(pixels, width, height)
    expect(alpha[4 * width + 4]).toBe(0)
    expect(alpha[40 * width + 30]).toBe(255)
    expect(pixels[(40 * width + 30) * 4]).toBe(235)
    expect(alpha[42 * width + 46]).toBe(0)
    expect(alpha[78 * width + 40]).toBe(255)
    expect(pixels[(78 * width + 40) * 4 + 2]).toBe(140)
  })

  it('removes a blue backdrop the same way as a green one', () => {
    const pixels = fill(40, 40, (data, x, y) => {
      const subject = x >= 12 && x <= 28 && y >= 10 && y <= 30
      setPixel(data, 40, x, y, subject ? [230, 200, 170, 255] : [30, 70, 210, 255])
    })
    const alpha = subjectAlpha(pixels, 40, 40)
    expect(alpha[0]).toBe(0)
    expect(alpha[20 * 40 + 20]).toBe(255)
    expect(pixels[(20 * 40 + 20) * 4]).toBe(230)
  })

  it('keeps a shirt that fades into the backdrop color', () => {
    const width = 90
    const height = 120
    const pixels = fill(width, height, (data, x, y) => {
      const shirt = x >= 24 && x <= 65 && y >= 28
      if (!shirt || y > 100) {
        setPixel(data, width, x, y, [20, 170, 40, 255])
        return
      }
      if (y === 46) {
        setPixel(data, width, x, y, [30, 30, 30, 255])
        return
      }
      const fade = Math.min(1, Math.max(0, (y - 50) / 46))
      setPixel(data, width, x, y, [
        Math.round(230 * (1 - fade) + 20 * fade),
        Math.round(230 * (1 - fade) + 170 * fade),
        Math.round(230 * (1 - fade) + 40 * fade),
        255,
      ])
    })
    const alpha = subjectAlpha(pixels, width, height)
    expect(alpha[0]).toBe(0)
    expect(alpha[40 * width + 44]).toBe(255)
    expect(alpha[58 * width + 44]).toBe(255)
    expect(pixels[(58 * width + 44) * 4]).toBeGreaterThan(170)
    expect(alpha[96 * width + 44]).toBe(0)
    expect(alpha[40 * width + 8]).toBe(0)
  })

  it('uses a center cutout when the corners are not one color', () => {
    const pixels = fill(10, 10, (data, x, y) => {
      setPixel(data, 10, x, y, [(x * 25) % 255, (y * 40) % 255, 80, 255])
    })
    const alpha = subjectAlpha(pixels, 10, 10)
    expect(alpha[5 * 10 + 5]).toBe(255)
    expect(alpha[0]).toBe(0)
  })
})

describe('backgroundKey', () => {
  it('changes when the scene, color, or light focus changes', () => {
    const base = {
      mode: 'scene' as const,
      scene: 'beach' as const,
      color: '#ffffff',
      lightFocus: 0,
    }
    expect(backgroundKey(base)).not.toBe(backgroundKey({ ...base, scene: 'forest' }))
    expect(backgroundKey({ ...base, mode: 'color', color: 'red' })).toContain('#ffffff')
    expect(sanitizeColor('#AABBCC')).toBe('#aabbcc')
    expect(sanitizeColor('blue')).toBe('#ffffff')
    expect(clampLightFocus(140.6)).toBe(100)
    expect(clampLightFocus(-4)).toBe(0)
    expect(clampLightFocus(Number.NaN)).toBe(0)
    expect(isBackgroundScene('forest')).toBe(true)
    expect(isBackgroundScene('space')).toBe(false)
  })
})
