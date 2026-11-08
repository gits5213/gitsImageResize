import { ImageProcessingError } from './imageErrors.ts'
import {
  type BackgroundChoice,
  type BackgroundScene,
  backgroundFile,
  backgroundImageUrl,
  sanitizeColor,
} from './backgrounds.ts'
import { subjectAlpha } from './backgroundMask.ts'

const IMAGE_MESSAGE =
  'This background image could not be loaded. Please try another background.'

const sceneImages = new Map<string, Promise<HTMLImageElement>>()

function loadSceneImage(scene: BackgroundScene): Promise<HTMLImageElement> {
  const file = backgroundFile(scene)
  const cached = sceneImages.get(file)
  if (cached) return cached
  const pending = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      if (image.naturalWidth < 1 || image.naturalHeight < 1) {
        sceneImages.delete(file)
        reject(new ImageProcessingError(IMAGE_MESSAGE))
        return
      }
      resolve(image)
    }
    image.onerror = () => {
      sceneImages.delete(file)
      reject(new ImageProcessingError(IMAGE_MESSAGE))
    }
    image.src = backgroundImageUrl(file)
  })
  sceneImages.set(file, pending)
  return pending
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale
  context.drawImage(
    image,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  )
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

export async function composeBackground(
  output: CanvasRenderingContext2D,
  subject: HTMLCanvasElement,
  choice: BackgroundChoice,
  flattenTransparent: boolean,
): Promise<void> {
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
    drawCover(output, await loadSceneImage(choice.scene), width, height)
  }

  cutOutSubject(subject)
  output.drawImage(subject, 0, 0)
  paintLightFocus(output, width, height, choice.lightFocus)
}
