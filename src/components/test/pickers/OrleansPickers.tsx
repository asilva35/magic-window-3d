import type { DoorHeight, DoorWidth } from '../../../data/doors/ORLEANS/doorSizes'
import type { GlassConfig } from '../../../data/doors/ORLEANS/glassTypes'
import { GLASS_CONFIG_LABELS } from '../../../data/doors/ORLEANS/glassTypes'
import { DEFAULT_PRESETS } from '../../../data/doorPresets'
import { BaseDoorSizePicker, BaseGlassConfigPicker, BasePresetMaterialPicker } from './BasePickers'

export const GLASS_OPTIONS_BY_HEIGHT: Record<DoorHeight, GlassConfig[]> = {
    '80': ['no-glass', '22x48'],
    '95': ['no-glass'],
}

export function OrleansDoorSizePicker({ height, width, onHeightSelect, onWidthSelect }: {
    height: DoorHeight
    width: DoorWidth
    onHeightSelect: (h: DoorHeight) => void
    onWidthSelect: (w: DoorWidth) => void
}) {
    const orleansHeights: DoorHeight[] = ['80']
    const orleansWidths: DoorWidth[] = ['32', '34', '36']

    return (
        <BaseDoorSizePicker
            height={height}
            width={width}
            availableHeights={orleansHeights}
            availableWidths={orleansWidths}
            onHeightSelect={onHeightSelect}
            onWidthSelect={onWidthSelect}
        />
    )
}

export function OrleansGlassConfigPicker({ selected, onSelect, doorHeight }: {
    selected: GlassConfig
    onSelect: (c: GlassConfig) => void
    doorHeight: DoorHeight
}) {
    const allowedOptions = GLASS_OPTIONS_BY_HEIGHT[doorHeight]

    return (
        <BaseGlassConfigPicker
            selected={selected}
            options={allowedOptions}
            labels={GLASS_CONFIG_LABELS}
            onSelect={onSelect}
        />
    )
}

export function GlobalPresetMaterialPicker(props: any) {
    const defaultKeys = Object.keys(DEFAULT_PRESETS)
    return <BasePresetMaterialPicker defaultPresetKeys={defaultKeys} {...props} />
}
