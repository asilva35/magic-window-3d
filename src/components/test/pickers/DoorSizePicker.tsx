import type { DoorHeight, DoorWidth } from '../../../data/doors/UNO/doorSizes'
import type { GlassConfig } from '../../../data/doors/UNO/glassTypes'
import { GLASS_CONFIG_LABELS } from '../../../data/doors/UNO/glassTypes'
import type { MaterialPreset } from '../../../data/doorPresets'
import { DEFAULT_PRESETS } from '../../../data/doorPresets'

const PICKER_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    borderRadius: 10,
    padding: '12px 14px',
    zIndex: 10,
}

const PICKER_LABEL_STYLE: React.CSSProperties = {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'sans-serif',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 2,
}

function pickerBtn(selected: boolean): React.CSSProperties {
    return {
        background: selected ? '#fff' : 'rgba(255,255,255,0.1)',
        color: selected ? '#111' : '#ddd',
        border: 'none',
        borderRadius: 6,
        padding: '6px 14px',
        fontFamily: 'sans-serif',
        fontSize: 13,
        fontWeight: selected ? 700 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        whiteSpace: 'pre-line',
        transition: 'background 0.15s, color 0.15s',
    }
}

export function DoorSizePicker({ height, width, onHeightSelect, onWidthSelect }: {
    height: DoorHeight
    width: DoorWidth
    onHeightSelect: (h: DoorHeight) => void
    onWidthSelect: (w: DoorWidth) => void
}) {
    const heights: DoorHeight[] = ['80', '95']
    const widths: DoorWidth[] = ['32', '34', '36']
    return (
        <div style={{ position: 'absolute', top: 24, left: 24, width: 140, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Door Size</span>
            <span style={{ ...PICKER_LABEL_STYLE, marginBottom: 0 }}>Height</span>
            {heights.map(h => (
                <button key={h} onClick={() => onHeightSelect(h)} style={pickerBtn(height === h)}>{h}"</button>
            ))}
            <span style={{ ...PICKER_LABEL_STYLE, marginTop: 4, marginBottom: 0 }}>Width</span>
            {widths.map(w => (
                <button key={w} onClick={() => onWidthSelect(w)} style={pickerBtn(width === w)}>{w}"</button>
            ))}
        </div>
    )
}

export const GLASS_OPTIONS_BY_HEIGHT: Record<DoorHeight, GlassConfig[]> = {
    '80': ['no-glass', '20x64', '22x64', '22x17-3x', '22x12-4x', '12x12-4x', '7x64-right', '7x64-left'],
    '95': ['no-glass', '20x80', '22x80', '22x14-7-16-4x', '22x9-5x'],
}

export function GlassConfigPicker({ selected, onSelect, doorHeight }: { selected: GlassConfig; onSelect: (c: GlassConfig) => void; doorHeight: DoorHeight }) {
    const options = GLASS_OPTIONS_BY_HEIGHT[doorHeight]
    return (
        <div style={{ position: 'absolute', top: 24, left: 180, width: 160, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Glass Configuration</span>
            {options.map((opt) => (
                <button key={opt} onClick={() => onSelect(opt)} style={pickerBtn(selected === opt)}>
                    {GLASS_CONFIG_LABELS[opt]}
                </button>
            ))}
        </div>
    )
}

export function PresetMaterialPicker({ presets, selected, onSelect, onDelete }: {
    presets: Record<string, MaterialPreset>
    selected: string
    onSelect: (p: string) => void
    onDelete: (p: string) => void
}) {
    return (
        <div style={{ position: 'absolute', top: 400, left: 24, maxHeight: 500, overflowY: 'auto', ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Material Preset</span>
            {Object.keys(presets).map((key) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: presets[key].slab.color,
                        border: '1px solid rgba(255,255,255,0.2)',
                        flexShrink: 0,
                    }} />
                    <button onClick={() => onSelect(key)} style={{ flex: 1, ...pickerBtn(selected === key) }}>
                        {key}
                    </button>
                    {!DEFAULT_PRESETS[key] && (
                        <button
                            onClick={() => onDelete(key)}
                            title="Delete preset"
                            style={{
                                background: 'rgba(255,80,80,0.2)',
                                color: '#ff9090',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontFamily: 'sans-serif',
                                fontSize: 13,
                                lineHeight: 1,
                                cursor: 'pointer',
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}