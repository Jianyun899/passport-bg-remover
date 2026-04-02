'use client'

interface BgColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  { label: 'White', value: '#FFFFFF', border: true },
  { label: 'Red', value: '#FF0000' },
  { label: 'Blue', value: '#438EDB' },
  { label: 'Dark Blue', value: '#003580' },
  { label: 'Transparent', value: 'transparent' },
]

export default function BgColorPicker({ value, onChange }: BgColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-600">Background Color</label>
      <div className="flex items-center gap-2 flex-wrap">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.value}
            title={color.label}
            onClick={() => onChange(color.value)}
            className={`w-9 h-9 rounded-full transition-all duration-200 flex items-center justify-center
              ${value === color.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}
              ${color.border ? 'border border-slate-200' : ''}`}
            style={{
              background:
                color.value === 'transparent'
                  ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%) 0 0 / 12px 12px'
                  : color.value,
            }}
          />
        ))}

        {/* Custom color picker */}
        <label
          title="Custom color"
          className={`w-9 h-9 rounded-full cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105
            ${!PRESET_COLORS.find(c => c.value === value) && value !== 'transparent' ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}
            border border-slate-200`}
          style={{ background: 'linear-gradient(135deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff)' }}
        >
          <input
            type="color"
            className="opacity-0 w-full h-full cursor-pointer"
            value={value === 'transparent' ? '#FFFFFF' : value}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>

        <span className="text-xs text-slate-400 ml-1">Custom</span>
      </div>
    </div>
  )
}
