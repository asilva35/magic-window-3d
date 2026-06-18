import type { DoorHeight, DoorWidth } from '../../../data/doors/UNO/doorSizes'
import type { GlassConfig } from '../../../data/doors/UNO/glassTypes'
import { GLASS_CONFIG_LABELS } from '../../../data/doors/UNO/glassTypes'
import { DEFAULT_PRESETS } from '../../../data/doorPresets'
import { BaseDoorSizePicker, BaseGlassConfigPicker, BasePresetMaterialPicker } from './BasePickers'

export const GLASS_OPTIONS_BY_HEIGHT: Record<DoorHeight, GlassConfig[]> = {
    '80': ['no-glass', '20x64', '22x64', '22x17-3x', '22x12-4x', '12x12-4x', '7x64-right', '7x64-left'],
    '95': ['no-glass', '20x80', '22x80', '22x14-7-16-4x', '22x9-5x'],
}

export function UnoDoorSizePicker({ height, width, onHeightSelect, onWidthSelect }: {
    height: DoorHeight
    width: DoorWidth
    onHeightSelect: (h: DoorHeight) => void
    onWidthSelect: (w: DoorWidth) => void
}) {
    const unoHeights: DoorHeight[] = ['80', '95']
    const unoWidths: DoorWidth[] = ['32', '34', '36']

    return (
        <BaseDoorSizePicker
            height={height}
            width={width}
            availableHeights={unoHeights}
            availableWidths={unoWidths}
            onHeightSelect={onHeightSelect}
            onWidthSelect={onWidthSelect}
        />
    )
}

export function UnoGlassConfigPicker({ selected, onSelect, doorHeight }: {
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