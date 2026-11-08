import {
  BACKGROUND_SCENES,
  COLOR_SWATCHES,
  type BackgroundChoice,
  type BackgroundScene,
  sanitizeColor,
} from '../../services/backgrounds.ts'

interface BackgroundControlsProps {
  value: BackgroundChoice
  disabled: boolean
  onChange: (value: BackgroundChoice) => void
}

const modeClass = (selected: boolean) =>
  `min-h-11 rounded-xl border px-3 text-sm font-medium ${
    selected
      ? 'border-blue-600 bg-blue-50 text-blue-950 dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-50'
      : 'border-slate-300 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100'
  }`

export function BackgroundControls({
  value,
  disabled,
  onChange,
}: BackgroundControlsProps) {
  const chooseScene = (scene: BackgroundScene) => {
    onChange({ ...value, mode: 'scene', scene })
  }

  return (
    <fieldset className="space-y-4" disabled={disabled}>
      <legend className="text-sm font-medium text-slate-800 dark:text-slate-200">
        Background
      </legend>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="background-original"
          className={modeClass(value.mode === 'original')}
          aria-pressed={value.mode === 'original'}
          onClick={() => onChange({ ...value, mode: 'original' })}
        >
          Original
        </button>
        <button
          type="button"
          data-testid="background-color"
          className={modeClass(value.mode === 'color')}
          aria-pressed={value.mode === 'color'}
          onClick={() => onChange({ ...value, mode: 'color' })}
        >
          Color
        </button>
        <button
          type="button"
          data-testid="background-transparent"
          className={modeClass(value.mode === 'transparent')}
          aria-pressed={value.mode === 'transparent'}
          onClick={() => onChange({ ...value, mode: 'transparent' })}
        >
          Transparent
        </button>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Scenario backgrounds"
      >
        {BACKGROUND_SCENES.map((scene) => {
          const selected = value.mode === 'scene' && value.scene === scene.id
          return (
            <button
              key={scene.id}
              type="button"
              data-testid={`background-${scene.id}`}
              aria-pressed={selected}
              className={`${modeClass(selected)} inline-flex items-center gap-2`}
              onClick={() => chooseScene(scene.id)}
            >
              <span
                aria-hidden="true"
                className="size-4 rounded-full border border-black/10"
                style={{ background: scene.swatch }}
              />
              {scene.label}
            </button>
          )
        })}
      </div>

      {value.mode === 'color' ? (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="background-color-input" className="text-sm font-medium">
            Background color
          </label>
          <input
            id="background-color-input"
            data-testid="background-color-input"
            type="color"
            value={sanitizeColor(value.color)}
            onChange={(event) =>
              onChange({ ...value, color: sanitizeColor(event.target.value) })
            }
            className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
          />
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use color ${swatch}`}
              className="size-8 rounded-full border border-slate-300 dark:border-slate-600"
              style={{ backgroundColor: swatch }}
              onClick={() => onChange({ ...value, mode: 'color', color: swatch })}
            />
          ))}
        </div>
      ) : null}

      <div className="max-w-md">
        <label htmlFor="light-focus" className="text-sm font-medium">
          Light focus ({value.lightFocus})
        </label>
        <input
          id="light-focus"
          data-testid="light-focus"
          type="range"
          min={0}
          max={100}
          step={1}
          value={value.lightFocus}
          onChange={(event) =>
            onChange({ ...value, lightFocus: Number(event.target.value) })
          }
          className="mt-2 w-full"
        />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Scenario and color backgrounds replace a plain backdrop, or keep a soft center
        when the photo is busy. Light focus brightens the middle and darkens the edges.
        The image stays in this browser. Transparent areas become white in a JPG download.
      </p>
    </fieldset>
  )
}
