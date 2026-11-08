import { ImageProcessingError } from './imageErrors.ts'
import {
  type BackgroundChoice,
  type BackgroundScene,
  sanitizeColor,
} from './backgrounds.ts'
import { subjectAlpha } from './backgroundMask.ts'

function paintScene(
  context: CanvasRenderingContext2D,
  scene: BackgroundScene,
  width: number,
  height: number,
): void {
  const sky = context.createLinearGradient(0, 0, 0, height)
  if (scene === 'studio') {
    const glow = context.createRadialGradient(
      width / 2,
      height * 0.42,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.65,
    )
    glow.addColorStop(0, '#f8fafc')
    glow.addColorStop(1, '#94a3b8')
    context.fillStyle = glow
    context.fillRect(0, 0, width, height)
    return
  }
  if (scene === 'daylight') {
    sky.addColorStop(0, '#dbeafe')
    sky.addColorStop(0.72, '#fff7ed')
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'rgba(255, 244, 214, 0.95)'
    context.beginPath()
    context.arc(
      width * 0.78,
      height * 0.22,
      Math.min(width, height) * 0.08,
      0,
      Math.PI * 2,
    )
    context.fill()
    return
  }
  if (scene === 'sunset') {
    sky.addColorStop(0, '#fb923c')
    sky.addColorStop(0.46, '#fb7185')
    sky.addColorStop(1, '#4c1d95')
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'rgba(255, 237, 213, 0.9)'
    context.beginPath()
    context.arc(width * 0.5, height * 0.62, Math.min(width, height) * 0.1, 0, Math.PI * 2)
    context.fill()
    return
  }
  if (scene === 'ocean') {
    sky.addColorStop(0, '#bae6fd')
    sky.addColorStop(0.42, '#38bdf8')
    sky.addColorStop(1, '#1e3a8a')
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    context.strokeStyle = 'rgba(255,255,255,0.45)'
    context.lineWidth = Math.max(2, height * 0.012)
    for (const band of [0.58, 0.7, 0.82]) {
      context.beginPath()
      context.moveTo(0, height * band)
      context.quadraticCurveTo(width * 0.5, height * (band - 0.04), width, height * band)
      context.stroke()
    }
    return
  }
  if (scene === 'forest') {
    sky.addColorStop(0, '#ecfccb')
    sky.addColorStop(0.45, '#4ade80')
    sky.addColorStop(1, '#14532d')
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#166534'
    for (const [x, scale] of [
      [0.18, 0.22],
      [0.5, 0.3],
      [0.82, 0.2],
    ] as const) {
      context.beginPath()
      context.ellipse(
        width * x,
        height * 0.72,
        width * scale * 0.45,
        height * scale,
        0,
        0,
        Math.PI * 2,
      )
      context.fill()
    }
    return
  }
  if (scene === 'city-night') {
    sky.addColorStop(0, '#1e293b')
    sky.addColorStop(1, '#020617')
    context.fillStyle = sky
    context.fillRect(0, 0, width, height)
    context.fillStyle = 'rgba(250, 204, 21, 0.85)'
    const columns = Math.max(3, Math.round(width / 48))
    const rows = Math.max(2, Math.round(height / 64))
    for (let column = 0; column < columns; column += 1) {
      for (let row = 0; row < rows; row += 1) {
        if ((column * 3 + row * 5) % 4 === 0) continue
        context.fillRect(
          width * 0.08 + column * ((width * 0.84) / columns),
          height * 0.2 + row * ((height * 0.55) / rows),
          Math.max(2, width / columns / 4),
          Math.max(2, height / rows / 5),
        )
      }
    }
    return
  }

  const glow = context.createRadialGradient(
    width / 2,
    height * 0.4,
    0,
    width / 2,
    height * 0.55,
    Math.max(width, height) * 0.7,
  )
  glow.addColorStop(0, '#ffedd5')
  glow.addColorStop(1, '#c2410c')
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)
}

function cutOutSubject(subject: HTMLCanvasElement): void {
  const context = subject.getContext('2d', { alpha: true })
  if (!context) {
    throw new ImageProcessingError('This browser could not prepare the new background.')
  }
  let pixels: ImageData
  try {
    pixels = context.getImageData(0, 0, subject.width, subject.height)
  } catch {
    throw new ImageProcessingError(
      'This browser could not read the image for a new background.',
    )
  }
  const alpha = subjectAlpha(pixels.data, subject.width, subject.height)
  for (let index = 0; index < alpha.length; index += 1) {
    pixels.data[index * 4 + 3] = Math.round(
      (pixels.data[index * 4 + 3] * alpha[index]) / 255,
    )
  }
  context.putImageData(pixels, 0, 0)
}

export function paintLightFocus(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number,
): void {
  if (amount <= 0) return
  const strength = Math.min(100, amount) / 100
  const centerX = width / 2
  const centerY = height / 2
  const inner = Math.min(width, height) * 0.16
  const outer = Math.max(width, height) * 0.72
  context.save()
  const glow = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    inner * 2.4,
  )
  glow.addColorStop(0, `rgba(255,255,255,${0.42 * strength})`)
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)
  const shade = context.createRadialGradient(
    centerX,
    centerY,
    inner,
    centerX,
    centerY,
    outer,
  )
  shade.addColorStop(0, 'rgba(0,0,0,0)')
  shade.addColorStop(1, `rgba(0,0,0,${0.58 * strength})`)
  context.fillStyle = shade
  context.fillRect(0, 0, width, height)
  context.restore()
}

export function composeBackground(
  output: CanvasRenderingContext2D,
  subject: HTMLCanvasElement,
  choice: BackgroundChoice,
  flattenTransparent: boolean,
): void {
  const { width, height } = subject
  output.clearRect(0, 0, width, height)
  if (choice.mode === 'original') {
    if (flattenTransparent) {
      output.fillStyle = '#ffffff'
      output.fillRect(0, 0, width, height)
    }
    output.drawImage(subject, 0, 0)
    paintLightFocus(output, width, height, choice.lightFocus)
    return
  }

  if (choice.mode === 'transparent' && flattenTransparent) {
    output.fillStyle = '#ffffff'
    output.fillRect(0, 0, width, height)
  } else if (choice.mode === 'color') {
    output.fillStyle = sanitizeColor(choice.color)
    output.fillRect(0, 0, width, height)
  } else if (choice.mode === 'scene') {
    paintScene(output, choice.scene, width, height)
  }

  cutOutSubject(subject)
  output.drawImage(subject, 0, 0)
  paintLightFocus(output, width, height, choice.lightFocus)
}
