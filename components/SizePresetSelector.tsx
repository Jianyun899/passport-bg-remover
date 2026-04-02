'use client'

interface SizePreset {
  label: string
  width: number
  height: number
  description: string
}

const SIZE_PRESETS: SizePreset[] = [
  { label: 'Original', width: 0, height: 0, description: 'Keep original size' },
  { label: '🇨🇳 China Passport', width: 390, height: 567, description: '33×48mm' },
  { label: '🇺🇸 US Passport', width: 600, height: 600, description: '2×2 inch' },
  { label: '🇬🇧 UK Passport', width: 413, height: 531, description: '35×45mm' },
  { label: '🇪🇺 EU Standard', width: 413, height: 531, description: '35×45mm' },
  { label: '1 inch (国内)', width: 295, height: 413, description: '25×35mm' },
  { label: '2 inch (国内)', width: 413, height: 579, description: '35×49mm' },
]

interface SizePresetSelectorProps {
  value: SizePreset
  onChange: (preset: SizePreset) => void
}

export default function SizePresetSelector({ value, onChange }: SizePresetSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-600">Photo Size</label>
      <select
        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={value.label}
        onChange={(e) => {
          const preset = SIZE_PRESETS.find(p => p.label === e.target.value)
          if (preset) onChange(preset)
        }}
      >
        {SIZE_PRESETS.map((preset) => (
          <option key={preset.label} value={preset.label}>
            {preset.label} — {preset.description}
          </option>
        ))}
      </select>
    </div>
  )
}

export { SIZE_PRESETS }
export type { SizePreset }
