function channelDistance(
  pixels: Uint8ClampedArray,
  index: number,
  color: readonly [number, number, number],
): number {
  const offset = index * 4
  const red = pixels[offset] - color[0]
  const green = pixels[offset + 1] - color[1]
  const blue = pixels[offset + 2] - color[2]
  return Math.hypot(red, green, blue)
}

function cornerColors(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Array<[number, number, number]> {
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]
  return points.map(([x, y]) => {
    const offset = (y * width + x) * 4
    return [pixels[offset], pixels[offset + 1], pixels[offset + 2]]
  })
}

function farthest(colors: Array<[number, number, number]>): number {
  let spread = 0
  for (let left = 0; left < colors.length; left += 1) {
    for (let right = left + 1; right < colors.length; right += 1) {
      const red = colors[left][0] - colors[right][0]
      const green = colors[left][1] - colors[right][1]
      const blue = colors[left][2] - colors[right][2]
      spread = Math.max(spread, Math.hypot(red, green, blue))
    }
  }
  return spread
}

function ellipseAlpha(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array {
  const alpha = new Uint8Array(width * height)
  const centerX = (width - 1) / 2
  const centerY = (height - 1) / 2
  const radiusX = Math.max(1, width * 0.46)
  const radiusY = Math.max(1, height * 0.46)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const distance = Math.hypot((x - centerX) / radiusX, (y - centerY) / radiusY)
      const index = y * width + x
      const source = pixels[index * 4 + 3]
      if (distance <= 0.72) alpha[index] = source
      else if (distance >= 1) alpha[index] = 0
      else alpha[index] = Math.round(source * (1 - (distance - 0.72) / 0.28))
    }
  }
  return alpha
}

/** Alpha to keep for each pixel. Existing transparency is preserved. A plain corner color is removed. Other photos use a soft center cutout. */
export function subjectAlpha(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array {
  const count = width * height
  if (count === 0 || pixels.length < count * 4) return new Uint8Array()

  let transparent = 0
  let opaque = 0
  for (let index = 0; index < count; index += 1) {
    const alpha = pixels[index * 4 + 3]
    if (alpha < 16) transparent += 1
    else if (alpha > 240) opaque += 1
  }
  if (transparent > count * 0.02 && opaque > count * 0.02) {
    const alpha = new Uint8Array(count)
    for (let index = 0; index < count; index += 1) alpha[index] = pixels[index * 4 + 3]
    return alpha
  }

  const corners = cornerColors(pixels, width, height)
  if (farthest(corners) <= 42) {
    const background: [number, number, number] = [
      Math.round(corners.reduce((sum, color) => sum + color[0], 0) / corners.length),
      Math.round(corners.reduce((sum, color) => sum + color[1], 0) / corners.length),
      Math.round(corners.reduce((sum, color) => sum + color[2], 0) / corners.length),
    ]
    const alpha = new Uint8Array(count)
    for (let index = 0; index < count; index += 1) {
      const distance = channelDistance(pixels, index, background)
      const source = pixels[index * 4 + 3]
      if (distance <= 52) alpha[index] = 0
      else if (distance >= 86) alpha[index] = source
      else alpha[index] = Math.round(source * ((distance - 52) / 34))
    }
    return alpha
  }

  return ellipseAlpha(pixels, width, height)
}
