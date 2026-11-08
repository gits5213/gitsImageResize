export const BACKGROUND_SCENES = [
  { id: 'beach', label: 'Beach', file: 'backgrounds/beach.jpg' },
  { id: 'forest', label: 'Forest', file: 'backgrounds/forest.jpg' },
  { id: 'mountains', label: 'Mountains', file: 'backgrounds/mountains.jpg' },
  { id: 'meadow', label: 'Meadow', file: 'backgrounds/meadow.jpg' },
  { id: 'lake', label: 'Lake', file: 'backgrounds/lake.jpg' },
  { id: 'desert', label: 'Desert', file: 'backgrounds/desert.jpg' },
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
  scene: 'beach',
  color: '#ffffff',
  lightFocus: 0,
}

export function backgroundFile(scene: BackgroundScene): string {
  return (
    BACKGROUND_SCENES.find((item) => item.id === scene)?.file ?? BACKGROUND_SCENES[0].file
  )
}

export function backgroundImageUrl(file: string): string {
  return `${import.meta.env.BASE_URL}${file}`
}

export function backgroundSelection(choice: BackgroundChoice): string {
  return choice.mode === 'scene' ? choice.scene : choice.mode
}

export function backgroundFromSelection(
  current: BackgroundChoice,
  selection: string,
): BackgroundChoice {
  if (selection === 'original' || selection === 'color' || selection === 'transparent') {
    return { ...current, mode: selection }
  }
  if (isBackgroundScene(selection)) {
    return { ...current, mode: 'scene', scene: selection }
  }
  return current
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
