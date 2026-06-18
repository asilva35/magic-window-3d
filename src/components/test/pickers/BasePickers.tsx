import React from 'react'
import type { MaterialPreset } from '../../../data/doorPresets'

const PICKER_STYLE: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: 8,
    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
    borderRadius: 10, padding: '12px 14px', zIndex: 10,
}

const PICKER_LABEL_STYLE: React.CSSProperties = {
    color: '#aaa', fontSize: 10, fontFamily: 'sans-serif',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2,
}

function pickerBtn(selected: boolean): React.CSSProperties {
    return {
        background: selected ? '#fff' : 'rgba(255,255,255,0.1)',
        color: selected ? '#111' : '#ddd', border: 'none', borderRadius: 6,
        padding: '6px 14px', fontFamily: 'sans-serif', fontSize: 13,
        fontWeight: selected ? 700 : 400, cursor: 'pointer',
        textAlign: 'left', whiteSpace: 'pre-line',
        transition: 'background 0.15s, color 0.15s',
    }
}

export function BaseDoorSizePicker<H extends string, W extends string>({
    height, width, availableHeights, availableWidths, onHeightSelect, onWidthSelect
}: {
    height: H
    width: W
    availableHeights: H[]
    availableWidths: W[]
    onHeightSelect: (h: H) => void
    onWidthSelect: (w: W) => void
}) {
    return (
        <div style={{ position: 'absolute', top: 24, left: 24, width: 140, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Door Size</span>
            <span style={{ ...PICKER_LABEL_STYLE, marginBottom: 0 }}>Height</span>
            {availableHeights.map(h => (
                <button key={h} onClick={() => onHeightSelect(h)} style={pickerBtn(height === h)}>{h}"</button>
            ))}
            <span style={{ ...PICKER_LABEL_STYLE, marginTop: 4, marginBottom: 0 }}>Width</span>
            {availableWidths.map(w => (
                <button key={w} onClick={() => onWidthSelect(w)} style={pickerBtn(width === w)}>{w}"</button>
            ))}
        </div>
    )
}

export function BaseGlassConfigPicker<G extends string>({
    selected, options, labels, onSelect
}: {
    selected: G
    options: G[]
    labels: Record<G, string>
    onSelect: (c: G) => void
}) {
    return (
        <div style={{ position: 'absolute', top: 24, left: 180, width: 160, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Glass Configuration</span>
            {options.map((opt) => (
                <button key={opt} onClick={() => onSelect(opt)} style={pickerBtn(selected === opt)}>
                    {labels[opt] || opt}
                </button>
            ))}
        </div>
    )
}

export function BasePresetMaterialPicker({
    presets, selected, defaultPresetKeys, onSelect, onDelete
}: {
    presets: Record<string, MaterialPreset>
    selected: string
    defaultPresetKeys: string[]
    onSelect: (p: string) => void
    onDelete: (p: string) => void
}) {
    return (
        <div style={{ position: 'absolute', top: 400, left: 24, maxHeight: 500, overflowY: 'auto', ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Material Preset</span>
            {Object.keys(presets).map((key) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        display: 'inline-block', width: 14, height: 14, borderRadius: 3,
                        background: presets[key].slab.color, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0,
                    }} />
                    <button onClick={() => onSelect(key)} style={{ flex: 1, ...pickerBtn(selected === key) }}>
                        {key}
                    </button>
                    {!defaultPresetKeys.includes(key) && (
                        <button
                            onClick={() => onDelete(key)}
                            title="Delete preset"
                            style={{
                                background: 'rgba(255,80,80,0.2)', color: '#ff9090', border: 'none',
                                borderRadius: 4, padding: '4px 8px', fontFamily: 'sans-serif',
                                fontSize: 13, lineHeight: 1, cursor: 'pointer',
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