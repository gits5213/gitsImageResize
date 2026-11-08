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

function colorDistance(
  left: readonly [number, number, number],
  right: readonly [number, number, number],
): number {
  return Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2])
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
      spread = Math.max(spread, colorDistance(colors[left], colors[right]))
    }
  }
  return spread
}

const SMOOTH_EDGE_LIMIT = 16
const SMALL_ISLAND_PIXELS = 64
const BACKDROP_MATCH = 48
const KEY_DISTANCE = 68
const SPILL_DISTANCE = 88

function medianChannel(values: number[]): number {
  const sorted = values.slice().sort((left, right) => left - right)
  return sorted[Math.floor(sorted.length / 2)] ?? 0
}

function medianColor(colors: Array<[number, number, number]>): [number, number, number] {
  return [
    medianChannel(colors.map((color) => color[0])),
    medianChannel(colors.map((color) => color[1])),
    medianChannel(colors.map((color) => color[2])),
  ]
}

/** How strongly one channel leads. Neutral backgrounds such as white or gray return null. */
function dominantChannel(color: readonly [number, number, number]): number | null {
  let channel = 0
  if (color[1] > color[channel]) channel = 1
  if (color[2] > color[channel]) channel = 2
  const rest = Math.max(color[(channel + 1) % 3], color[(channel + 2) % 3])
  if (color[channel] - rest < 28) return null
  return channel
}

function readColor(pixels: Uint8ClampedArray, index: number): [number, number, number] {
  const offset = index * 4
  return [pixels[offset], pixels[offset + 1], pixels[offset + 2]]
}

function borderColors(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Array<Array<[number, number, number]>> {
  const inset = 2
  const sides: Array<Array<[number, number, number]>> = [[], [], [], []]
  const push = (side: number, x: number, y: number) => {
    sides[side].push(readColor(pixels, y * width + x))
  }
  for (let x = inset; x < width - inset; x += 2) {
    push(0, x, inset)
    push(1, x, height - 1 - inset)
  }
  for (let y = inset; y < height - inset; y += 2) {
    push(2, inset, y)
    push(3, width - 1 - inset, y)
  }
  return sides
}

/**
 * A backdrop color shared by most of the border. Subject pixels that touch the
 * border, such as jeans along the bottom, do not have to match.
 */
function uniformBackdrop(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): [number, number, number] | null {
  if (width < 8 || height < 8) return null
  const sides = borderColors(pixels, width, height)
  const all = sides.flat()
  if (all.length < 16) return null
  let best: [number, number, number] | null = null
  let bestRate = 0
  const candidates = [medianColor(all), ...sides.map((side) => medianColor(side))]
  for (const candidate of candidates) {
    if (dominantChannel(candidate) === null) continue
    let matched = 0
    for (const color of all) {
      if (colorDistance(color, candidate) <= BACKDROP_MATCH) matched += 1
    }
    const rate = matched / all.length
    if (rate > bestRate) {
      bestRate = rate
      best = candidate
    }
  }
  if (!best || bestRate < 0.45) return null
  return best
}

function sharesBackdropHue(
  pixels: Uint8ClampedArray,
  index: number,
  channel: number,
): boolean {
  const color = readColor(pixels, index)
  const rest = Math.max(color[(channel + 1) % 3], color[(channel + 2) % 3])
  return color[channel] >= rest + 22
}

/**
 * Removes a uniform colored backdrop everywhere, including pockets left inside
 * the subject. Clothing is kept unless it is that same color.
 */
function chromaBackdrop(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array | null {
  const backdrop = uniformBackdrop(pixels, width, height)
  if (!backdrop) return null
  const channel = dominantChannel(backdrop)
  if (channel === null) return null
  const count = width * height
  const alpha = new Uint8Array(count)
  let removed = 0
  for (let index = 0; index < count; index += 1) {
    const source = pixels[index * 4 + 3]
    const distance = channelDistance(pixels, index, backdrop)
    const spill = distance <= SPILL_DISTANCE && sharesBackdropHue(pixels, index, channel)
    if (distance <= KEY_DISTANCE || spill) {
      alpha[index] = 0
      removed += 1
      continue
    }
    if (distance >= KEY_DISTANCE + 18) alpha[index] = source
    else alpha[index] = Math.round(source * ((distance - KEY_DISTANCE) / 18))
  }
  if (removed < count * 0.05 || removed > count * 0.97) return null
  return alpha
}

function edgeMagnitude(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Float32Array {
  const count = width * height
  const luma = new Float32Array(count)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 4
    luma[index] =
      pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722
  }
  const edge = new Float32Array(count)
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x
      const gx =
        -luma[index - width - 1] -
        2 * luma[index - 1] -
        luma[index + width - 1] +
        luma[index - width + 1] +
        2 * luma[index + 1] +
        luma[index + width + 1]
      const gy =
        -luma[index - width - 1] -
        2 * luma[index - width] -
        luma[index - width + 1] +
        luma[index + width - 1] +
        2 * luma[index + width] +
        luma[index + width + 1]
      edge[index] = Math.hypot(gx, gy)
    }
  }
  return edge
}

/** Removes a smooth backdrop that touches the image border. Used when the border is not one color. */
function smoothBackdrop(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8Array | null {
  const count = width * height
  const edge = edgeMagnitude(pixels, width, height)
  const background = new Uint8Array(count)
  const queue = new Int32Array(count)
  let tail = 0
  const push = (index: number) => {
    if (background[index] || edge[index] > SMOOTH_EDGE_LIMIT) return
    background[index] = 1
    queue[tail] = index
    tail += 1
  }
  for (let x = 0; x < width; x += 1) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 1; y < height - 1; y += 1) {
    push(y * width)
    push(y * width + width - 1)
  }
  let head = 0
  while (head < tail) {
    const index = queue[head]
    head += 1
    const x = index % width
    const y = (index - x) / width
    if (x > 0) push(index - 1)
    if (x + 1 < width) push(index + 1)
    if (y > 0) push(index - width)
    if (y + 1 < height) push(index + width)
  }

  let removed = 0
  let border = 0
  let borderRemoved = 0
  for (let index = 0; index < count; index += 1) {
    if (background[index]) removed += 1
  }
  for (let x = 0; x < width; x += 1) {
    border += 2
    if (background[x]) borderRemoved += 1
    if (background[(height - 1) * width + x]) borderRemoved += 1
  }
  if (borderRemoved < border * 0.5 || removed < count * 0.05 || removed > count * 0.995) {
    return null
  }

  const seen = new Uint8Array(count)
  const component = new Int32Array(count)
  const sizes: number[] = []
  const spans: number[] = []
  for (let start = 0; start < count; start += 1) {
    if (background[start] || seen[start]) continue
    const spanStart = spans.length === 0 ? 0 : spans[spans.length - 1]
    let componentTail = spanStart
    seen[start] = 1
    component[componentTail] = start
    componentTail += 1
    let componentHead = spanStart
    while (componentHead < componentTail) {
      const index = component[componentHead]
      componentHead += 1
      const x = index % width
      const y = (index - x) / width
      const neighbors = [
        x > 0 ? index - 1 : -1,
        x + 1 < width ? index + 1 : -1,
        y > 0 ? index - width : -1,
        y + 1 < height ? index + width : -1,
      ]
      for (const next of neighbors) {
        if (next < 0 || background[next] || seen[next]) continue
        seen[next] = 1
        component[componentTail] = next
        componentTail += 1
      }
    }
    sizes.push(componentTail - spanStart)
    spans.push(componentTail)
  }
  const largest = sizes.reduce((best, size) => Math.max(best, size), 0)
  const minimum = Math.max(SMALL_ISLAND_PIXELS, Math.round(largest * 0.02))
  let spanCursor = 0
  for (let piece = 0; piece < sizes.length; piece += 1) {
    const spanEnd = spans[piece]
    if (sizes[piece] < minimum && sizes[piece] < largest) {
      for (let cursor = spanCursor; cursor < spanEnd; cursor += 1) {
        background[component[cursor]] = 1
      }
    }
    spanCursor = spanEnd
  }
  return background
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

/** Alpha to keep for each pixel. Existing transparency is preserved. A uniform backdrop is removed. Subject pixels stay unchanged. */
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

  const keyed = chromaBackdrop(pixels, width, height)
  if (keyed) return keyed

  const backdrop = smoothBackdrop(pixels, width, height)
  if (backdrop) {
    const alpha = new Uint8Array(count)
    for (let index = 0; index < count; index += 1) {
      alpha[index] = backdrop[index] ? 0 : pixels[index * 4 + 3]
    }
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
