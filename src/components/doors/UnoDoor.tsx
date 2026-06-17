import type { MaterialPreset } from "../../data/doorPresets"
import type { GlassConfig } from '../../data/doors/UNO/glassTypes'
import type { DoorHeight, DoorWidth } from '../../data/doors/UNO/doorSizes'
import type { DoorAssets } from '../../data/doors/UNO/assets'
import { DEFAULT_DOOR_ASSETS, DOOR_ASSETS } from '../../data/doors/UNO/assets'
import { BaseDoor } from "./BaseDoor"

function getDoorAssets(height: DoorHeight, width: DoorWidth, glass: GlassConfig): DoorAssets {
    return DOOR_ASSETS[`${height}-${width}-${glass}`] ?? DEFAULT_DOOR_ASSETS
}

export type UnoDoorProps = MaterialPreset & {
    doorHeight: DoorHeight;
    doorWidth: DoorWidth;
    glassConfig: GlassConfig;
    onReady?: () => void
};

export function UnoDoor({
    doorHeight, doorWidth, glassConfig, ...materialProps
}: UnoDoorProps) {

    const rawAssets = getDoorAssets(doorHeight, doorWidth, glassConfig)

    const resolvedAssets = {
        glb: rawAssets.glb,
        aoMap: rawAssets.aoMap ?? DEFAULT_DOOR_ASSETS.aoMap!,
        lightMap: rawAssets.lightMap ?? DEFAULT_DOOR_ASSETS.lightMap!,
        normalMap: rawAssets.normalMap ?? DEFAULT_DOOR_ASSETS.normalMap!,
        roughnessMap: rawAssets.roughnessMap ?? DEFAULT_DOOR_ASSETS.roughnessMap!,
        diffuseMap: rawAssets.diffuseMap ?? DEFAULT_DOOR_ASSETS.diffuseMap!,
    }

    const handlePosX = resolvedAssets.glb === DEFAULT_DOOR_ASSETS.glb && doorWidth !== '32'
        ? 4
        : ({ '32': 5, '34': 3, '36': 1 }[doorWidth] ?? 4);
    return (
        <BaseDoor
            assets={resolvedAssets}
            handlePositionX={handlePosX}
            {...materialProps}
        />
    )
}