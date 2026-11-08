export const BACKGROUND_GROUPS = [
  { id: 'corporate', label: 'Corporate office' },
  { id: 'home', label: 'Home' },
  { id: 'nature', label: 'Nature' },
  { id: 'professional', label: 'Professional' },
  { id: 'blurry', label: 'Blurry' },
] as const

export const BACKGROUND_SCENES = [
  {
    id: 'office-open',
    label: 'Open office',
    file: 'backgrounds/office-open.jpg',
    group: 'corporate',
  },
  {
    id: 'office-meeting',
    label: 'Meeting room',
    file: 'backgrounds/office-meeting.jpg',
    group: 'corporate',
  },
  {
    id: 'office-reception',
    label: 'Reception',
    file: 'backgrounds/office-reception.jpg',
    group: 'corporate',
  },
  {
    id: 'home-living',
    label: 'Living room',
    file: 'backgrounds/home-living.jpg',
    group: 'home',
  },
  {
    id: 'home-kitchen',
    label: 'Kitchen',
    file: 'backgrounds/home-kitchen.jpg',
    group: 'home',
  },
  {
    id: 'home-bedroom',
    label: 'Bedroom',
    file: 'backgrounds/home-bedroom.jpg',
    group: 'home',
  },
  { id: 'beach', label: 'Beach', file: 'backgrounds/beach.jpg', group: 'nature' },
  { id: 'forest', label: 'Forest', file: 'backgrounds/forest.jpg', group: 'nature' },
  {
    id: 'mountains',
    label: 'Mountains',
    file: 'backgrounds/mountains.jpg',
    group: 'nature',
  },
  { id: 'meadow', label: 'Meadow', file: 'backgrounds/meadow.jpg', group: 'nature' },
  { id: 'lake', label: 'Lake', file: 'backgrounds/lake.jpg', group: 'nature' },
  { id: 'desert', label: 'Desert', file: 'backgrounds/desert.jpg', group: 'nature' },
  {
    id: 'pro-studio',
    label: 'Portrait studio',
    file: 'backgrounds/pro-studio.jpg',
    group: 'professional',
  },
  {
    id: 'pro-skyline',
    label: 'City skyline',
    file: 'backgrounds/pro-skyline.jpg',
    group: 'professional',
  },
  {
    id: 'pro-stage',
    label: 'Conference stage',
    file: 'backgrounds/pro-stage.jpg',
    group: 'professional',
  },
  {
    id: 'blur-office',
    label: 'Soft office',
    file: 'backgrounds/blur-office.jpg',
    group: 'blurry',
  },
  {
    id: 'blur-city',
    label: 'City bokeh',
    file: 'backgrounds/blur-city.jpg',
    group: 'blurry',
  },
  {
    id: 'blur-nature',
    label: 'Soft greenery',
    file: 'backgrounds/blur-nature.jpg',
    group: 'blurry',
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
