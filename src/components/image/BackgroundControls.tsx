import {
  BACKGROUND_SCENES,
  COLOR_SWATCHES,
  type BackgroundChoice,
  backgroundFile,
  backgroundFromSelection,
  backgroundImageUrl,
  backgroundSelection,
  sanitizeColor,
} from '../../services/backgrounds.ts'

interface BackgroundControlsProps {
  value: BackgroundChoice
  disabled: boolean
  onChange: (value: BackgroundChoice) => void
}

export function BackgroundControls({
  value,
  disabled,
  onChange,
}: BackgroundControlsProps) {
  const selectedScene = BACKGROUND_SCENES.find((scene) => scene.id === value.scene)

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <label
          htmlFor="background-select"
          className="text-sm font-medium text-slate-800 dark:text-slate-200"
        >
          Background
        </label>
        <select
          id="background-select"
          data-testid="background-select"
          disabled={disabled}
          className="mt-1 w-full min-h-11 cursor-pointer rounded-xl border border-slate-300 bg-white px-3 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
          value={backgroundSelection(value)}
          onChange={(event) =>
            onChange(backgroundFromSelection(value, event.target.value))
          }
        >
          <option value="original">Original</option>
          <optgroup label="Natural backgrounds">
            {BACKGROUND_SCENES.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.label}
              </option>
            ))}
          </optgroup>
          <option value="color">Solid color</option>
          <option value="transparent">Transparent</option>
        </select>
        {value.mode === 'scene' && selectedScene ? (
          <img
            src={backgroundImageUrl(backgroundFile(selectedScene.id))}
            alt=""
            className="mt-3 h-28 w-full rounded-xl object-cover"
          />
        ) : null}
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
            disabled={disabled}
            className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
          />
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Use color ${swatch}`}
              disabled={disabled}
              className="size-8 rounded-full border border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600"
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
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...value, lightFocus: Number(event.target.value) })
          }
          className="mt-2 w-full disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">
        Choose a background and the preview updates. The backdrop, including a soft glow,
        is replaced. The person or subject keeps its original pixels. Light focus
        brightens the middle and darkens the edges. The image stays in this browser.
      </p>
    </div>
  )
}
