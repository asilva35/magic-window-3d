import type { MaterialPreset } from "../../data/doorPresets"
import type { GlassConfig } from '../../data/doors/ORLEANS/glassTypes'
import type { DoorHeight, DoorWidth } from '../../data/doors/ORLEANS/doorSizes'
import type { DoorAssets } from '../../data/doors/ORLEANS/assets'
import { DEFAULT_DOOR_ASSETS, DOOR_ASSETS } from '../../data/doors/ORLEANS/assets'
import { BaseDoor } from "./BaseDoor"

function getDoorAssets(height: DoorHeight, width: DoorWidth, glass: GlassConfig): DoorAssets {
    return DOOR_ASSETS[`${height}-${width}-${glass}`] ?? DEFAULT_DOOR_ASSETS
}

export type OrleansDoorProps = MaterialPreset & {
    doorHeight: DoorHeight;
    doorWidth: DoorWidth;
    glassConfig: GlassConfig;
    onReady?: () => void
};

export function OrleansDoor({
    doorHeight, doorWidth, glassConfig, ...materialProps
}: OrleansDoorProps) {

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
