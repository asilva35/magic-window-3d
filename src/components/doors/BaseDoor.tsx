import { useEffect, useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial, NoColorSpace, Mesh } from "three"
import { DoorHandle } from "../DoorHandle"
import type { MaterialPreset } from "../../data/doorPresets"

export interface BaseDoorAssets {
    glb: string;
    aoMap: string;
    lightMap: string;
    normalMap: string;
    roughnessMap: string;
    diffuseMap: string;
}

export type BaseDoorProps = MaterialPreset & {
    assets: BaseDoorAssets;
    handlePositionX?: number;
    onReady?: () => void;
}

export function BaseDoor({
    assets, handlePositionX = 4, onReady,
    slab, mold = slab, stopJam, sealTop, sealBot, glass,
}: BaseDoorProps) {

    useEffect(() => { onReady?.() }, [onReady])

    const { scene } = useGLTF(assets.glb)

    const aoMap = useTexture(assets.aoMap, (t) => { t.colorSpace = NoColorSpace; t.channel = 0; t.flipY = false; })
    const aoMapLight = useTexture(assets.lightMap, (t) => { t.colorSpace = NoColorSpace; t.channel = 0; t.flipY = false; })
    const normalMap = useTexture(assets.normalMap, (t) => { t.colorSpace = NoColorSpace; t.channel = 0; t.flipY = false; });
    const roughnessMap = useTexture(assets.roughnessMap, (t) => { t.colorSpace = NoColorSpace; t.channel = 0; t.flipY = false; });
    const diffuseMap = useTexture(assets.diffuseMap, (t) => { t.colorSpace = NoColorSpace; t.channel = 0; t.flipY = false; });

    const clone = useMemo(() => scene.clone(true), [scene])

    const slabMaterial = useMemo(() => new MeshStandardMaterial({ color: slab.color, metalness: slab.metalness, roughness: slab.roughness }), [slab.color, slab.metalness, slab.roughness])
    const moldMaterial = useMemo(() => new MeshStandardMaterial({ color: mold.color, metalness: mold.metalness, roughness: mold.roughness }), [mold.color, mold.metalness, mold.roughness])
    const stopJamMaterial = useMemo(() => new MeshStandardMaterial({ color: stopJam.color, metalness: stopJam.metalness, roughness: stopJam.roughness }), [stopJam.color, stopJam.metalness, stopJam.roughness])
    const sealTopMaterial = useMemo(() => new MeshStandardMaterial({ color: sealTop.color, metalness: sealTop.metalness, roughness: sealTop.roughness }), [sealTop.color, sealTop.metalness, sealTop.roughness])
    const sealBotMaterial = useMemo(() => new MeshStandardMaterial({ color: sealBot.color, metalness: sealBot.metalness, roughness: sealBot.roughness }), [sealBot.color, sealBot.metalness, sealBot.roughness])
    const glassMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: glass.color, roughness: glass.roughness, metalness: glass.metalness,
        transmission: glass.transmission, thickness: glass.thickness,
        ior: 1.5, transparent: true, opacity: glass.opacity, envMapIntensity: 1,
    }), [glass.color, glass.roughness, glass.metalness, glass.transmission, glass.thickness, glass.opacity])
    const rubberMaterial = useMemo(() => new MeshBasicMaterial({ color: slab.color }), [slab.color])

    useMemo(() => {
        clone.traverse((child) => {
            if (!(child as Mesh).isMesh) return
            const mesh = child as Mesh
            const name = mesh.name
            let applyAOMap = false
            let applyLightMap = false;
            let mapAoIntensity = 0.5;

            if (name.includes('slab')) {
                slabMaterial.normalMap = normalMap
                slabMaterial.roughnessMap = roughnessMap
                slabMaterial.map = diffuseMap
                mesh.material = slabMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('mold')) {
                //moldMaterial.normalMap = normalMap
                //moldMaterial.roughnessMap = roughnessMap
                mesh.material = moldMaterial
                //applyAOMap = true
                //applyLightMap = true
                //mapAoIntensity = 0.3
            } else if (name.includes('stop') || name.includes('jam')) {
                stopJamMaterial.normalMap = normalMap
                stopJamMaterial.roughnessMap = roughnessMap
                stopJamMaterial.map = diffuseMap
                mesh.material = stopJamMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-top') {
                sealTopMaterial.roughnessMap = roughnessMap
                sealTopMaterial.normalMap = normalMap
                sealTopMaterial.map = diffuseMap
                mesh.material = sealTopMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-bottom') {
                sealBotMaterial.roughnessMap = roughnessMap
                sealBotMaterial.normalMap = normalMap
                sealBotMaterial.map = diffuseMap
                mesh.material = sealBotMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('glass')) {
                mesh.material = glassMaterial
            } else if (name.includes('rubber')) {
                mesh.material = rubberMaterial
            }

            if (applyAOMap && assets.aoMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.aoMap = aoMap
                mat.aoMapIntensity = mapAoIntensity
                mat.needsUpdate = true
            }

            if (applyLightMap && assets.lightMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.lightMap = aoMapLight
                mat.lightMapIntensity = 0.4
                mat.needsUpdate = true
            }
        })
    }, [clone, aoMap, aoMapLight, normalMap, roughnessMap, diffuseMap, slabMaterial, moldMaterial, stopJamMaterial, sealTopMaterial, sealBotMaterial, glassMaterial, assets])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[handlePositionX, 0, 0]} scale={1} roughness={0.4} metalness={0.8} color='#777777' />
    </>
}