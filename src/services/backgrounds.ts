export const BACKGROUND_SCENES = [
  { id: 'studio', label: 'Studio', swatch: 'radial-gradient(circle, #f8fafc, #94a3b8)' },
  { id: 'daylight', label: 'Soft daylight', swatch: 'linear-gradient(#dbeafe, #fff7ed)' },
  { id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(#fdba74, #fb7185, #7c3aed)' },
  { id: 'ocean', label: 'Ocean', swatch: 'linear-gradient(#7dd3fc, #1d4ed8)' },
  { id: 'forest', label: 'Forest', swatch: 'linear-gradient(#d9f99d, #166534)' },
  { id: 'city-night', label: 'City night', swatch: 'linear-gradient(#1e293b, #020617)' },
  {
    id: 'warm-room',
    label: 'Warm room',
    swatch: 'radial-gradient(circle, #ffedd5, #c2410c)',
  },
] as const

export const COLOR_SWATCHES = [
  '#ffffff',
  '#111827',
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#e11d48',
]

export type BackgroundScene = (typeof BACKGROUND_SCENES)[number]['id']
export type BackgroundMode = 'original' | 'color' | 'transparent' | 'scene'

export interface BackgroundChoice {
  mode: BackgroundMode
  scene: BackgroundScene
  color: string
  lightFocus: number
}

export const DEFAULT_BACKGROUND: BackgroundChoice = {
  mode: 'original',
  scene: 'studio',
  color: '#ffffff',
  lightFocus: 0,
}

export function isBackgroundScene(value: string): value is BackgroundScene {
  return BACKGROUND_SCENES.some((scene) => scene.id === value)
}

export function sanitizeColor(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toLowerCase() : DEFAULT_BACKGROUND.color
}

export function clampLightFocus(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function backgroundKey(choice: BackgroundChoice): string {
  return `${choice.mode}:${choice.scene}:${sanitizeColor(choice.color)}:${clampLightFocus(choice.lightFocus)}`
}
