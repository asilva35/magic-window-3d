import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Suspense, useMemo, useState, useEffect, useRef } from 'react'
import { useControls, Leva, button, folder } from 'leva'
import type { MaterialPreset } from './data/doorPresets'
import { DEFAULT_PRESETS } from './data/doorPresets'
import { HDR_OPTIONS } from './data/hdrOptions'
import type { DoorHeight, DoorWidth } from './data/doors/ORLEANS/doorSizes'
import type { GlassConfig } from './data/doors/ORLEANS/glassTypes'
import { DOOR_ASSETS } from './data/doors/ORLEANS/assets'
import { OrleansDoor } from './components/doors/OrleansDoor'
import { OrleansDoorSizePicker, OrleansGlassConfigPicker, GlobalPresetMaterialPicker, GLASS_OPTIONS_BY_HEIGHT } from './components/test/pickers/OrleansPickers'

const DEBUG = true

useGLTF.preload('/assets/models/orleans-door-80x32-no-glass.glb')

// ─── Material preset ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'orleans-door-presets'

function loadCustomPresets(): Record<string, MaterialPreset> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TestOrleansDoorPage() {
    const [selectedPreset, setSelectedPreset] = useState<string>('Black')
    const [customPresets, setCustomPresets] = useState<Record<string, MaterialPreset>>(loadCustomPresets)
    const [doorHeight, setDoorHeight] = useState<DoorHeight>('80')
    const [doorWidth, setDoorWidth] = useState<DoorWidth>('32')
    const [glassConfig, setGlassConfig] = useState<GlassConfig>('no-glass')
    const [isLoading, setIsLoading] = useState(true)

    const allPresets = useMemo(() => ({ ...DEFAULT_PRESETS, ...customPresets }), [customPresets])

    const materialsRef = useRef<MaterialPreset>(DEFAULT_PRESETS['Black'])

    const init = DEFAULT_PRESETS['Black']

    const [{ hdr,
        slabColor, slabRoughness, slabMetalness,
        moldColor, moldRoughness, moldMetalness,
        stopJamColor, stopJamRoughness, stopJamMetalness,
        sealTopColor, sealTopRoughness, sealTopMetalness,
        sealBotColor, sealBotRoughness, sealBotMetalness,
        glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
        lightSourceIntensity, hdrIntensity,
    }, set] = useControls(() => ({
        hdr: {
            label: 'Environment',
            value: 'Passendorf Snow',
            options: Object.keys(HDR_OPTIONS),
        },
        lightSourceIntensity: { label: 'Light Intensity', value: init.lightSourceIntensity, min: 0, max: 2, step: 0.001 },
        hdrIntensity: { label: 'HDR Intensity', value: init.hdrIntensity, min: 0, max: 2, step: 0.001 },
        'Slab / Frame': folder({
            slabColor: { label: 'Color', value: init.slab.color },
            slabRoughness: { label: 'Roughness', value: init.slab.roughness, min: 0, max: 1, step: 0.01 },
            slabMetalness: { label: 'Metalness', value: init.slab.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Mold': folder({
            moldColor: { label: 'Color', value: init.slab.color },
            moldRoughness: { label: 'Roughness', value: init.slab.roughness, min: 0, max: 1, step: 0.01 },
            moldMetalness: { label: 'Metalness', value: init.slab.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Stop / Jam': folder({
            stopJamColor: { label: 'Color', value: init.stopJam.color },
            stopJamRoughness: { label: 'Roughness', value: init.stopJam.roughness, min: 0, max: 1, step: 0.01 },
            stopJamMetalness: { label: 'Metalness', value: init.stopJam.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Seal Top': folder({
            sealTopColor: { label: 'Color', value: init.sealTop.color },
            sealTopRoughness: { label: 'Roughness', value: init.sealTop.roughness, min: 0, max: 1, step: 0.01 },
            sealTopMetalness: { label: 'Metalness', value: init.sealTop.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Seal Bottom': folder({
            sealBotColor: { label: 'Color', value: init.sealBot.color },
            sealBotRoughness: { label: 'Roughness', value: init.sealBot.roughness, min: 0, max: 1, step: 0.01 },
            sealBotMetalness: { label: 'Metalness', value: init.sealBot.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Glass': folder({
            glassColor: { label: 'Color', value: init.glass.color },
            glassRoughness: { label: 'Roughness', value: init.glass.roughness, min: 0, max: 1, step: 0.001 },
            glassMetalness: { label: 'Metalness', value: init.glass.metalness, min: 0, max: 1, step: 0.01 },
            glassTransmission: { label: 'Transmission', value: init.glass.transmission, min: 0, max: 1, step: 0.01 },
            glassThickness: { label: 'Thickness', value: init.glass.thickness, min: 0, max: 5, step: 0.01 },
            glassOpacity: { label: 'Opacity', value: init.glass.opacity, min: 0, max: 1, step: 0.01 },
        }),
        'Save as Preset': button(() => {
            const name = window.prompt('Enter preset name')
            if (!name || !name.trim()) return
            const trimmed = name.trim()
            setCustomPresets(prev => {
                const updated = { ...prev, [trimmed]: { ...materialsRef.current } }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
                return updated
            })
        }),
    }))

    materialsRef.current = {
        slab: { color: slabColor, roughness: slabRoughness, metalness: slabMetalness },
        mold: { color: moldColor, roughness: moldRoughness, metalness: moldMetalness },
        stopJam: { color: stopJamColor, roughness: stopJamRoughness, metalness: stopJamMetalness },
        sealTop: { color: sealTopColor, roughness: sealTopRoughness, metalness: sealTopMetalness },
        sealBot: { color: sealBotColor, roughness: sealBotRoughness, metalness: sealBotMetalness },
        glass: { color: glassColor, roughness: glassRoughness, metalness: glassMetalness, transmission: glassTransmission, thickness: glassThickness, opacity: glassOpacity },
        lightSourceIntensity,
        hdrIntensity,
    }

    useEffect(() => {
        const preset = allPresets[selectedPreset]
        if (preset) set({
            slabColor: preset.slab.color, slabRoughness: preset.slab.roughness, slabMetalness: preset.slab.metalness,
            moldColor: (preset.mold ?? preset.slab).color, moldRoughness: (preset.mold ?? preset.slab).roughness, moldMetalness: (preset.mold ?? preset.slab).metalness,
            stopJamColor: preset.stopJam.color, stopJamRoughness: preset.stopJam.roughness, stopJamMetalness: preset.stopJam.metalness,
            sealTopColor: preset.sealTop.color, sealTopRoughness: preset.sealTop.roughness, sealTopMetalness: preset.sealTop.metalness,
            sealBotColor: preset.sealBot.color, sealBotRoughness: preset.sealBot.roughness, sealBotMetalness: preset.sealBot.metalness,
            glassColor: preset.glass.color, glassRoughness: preset.glass.roughness, glassMetalness: preset.glass.metalness,
            glassTransmission: preset.glass.transmission, glassThickness: preset.glass.thickness, glassOpacity: preset.glass.opacity,
            lightSourceIntensity: preset.lightSourceIntensity,
            hdrIntensity: preset.hdrIntensity,
        })
    }, [selectedPreset])

    const handleDeletePreset = (key: string) => {
        setCustomPresets(prev => {
            const updated = { ...prev }
            delete updated[key]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
        if (selectedPreset === key) setSelectedPreset('Black')
    }

    useEffect(() => {
        if (!GLASS_OPTIONS_BY_HEIGHT[doorHeight].includes(glassConfig)) {
            setGlassConfig('no-glass')
        }
    }, [doorHeight])

    const hdrFile = HDR_OPTIONS[hdr as keyof typeof HDR_OPTIONS]
    const doorKey = `${doorHeight}-${doorWidth}-${glassConfig}`
    const isUsingDefault = !DOOR_ASSETS[doorKey]

    useEffect(() => { setIsLoading(true) }, [doorKey])

    return (
        <>
            <Leva hidden={!DEBUG} />
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#e1e1e1' }}>
                <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.0, antialias: true }}>
                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[0, 0, doorHeight === '95' ? 250 : 200]} fov={50} />
                        <Environment files={hdrFile} environmentIntensity={hdrIntensity} background={false} backgroundRotation={[0, 0, 0]} environmentRotation={[0, 0, 0]} />
                        <directionalLight position={[12, 50, 200]} intensity={lightSourceIntensity} color="#ffffff" />
                        <directionalLight position={[12, 50, -200]} intensity={lightSourceIntensity} color="#ffffff" />
                        <hemisphereLight position={[0, 50, 0]} intensity={lightSourceIntensity} color="#ffffff" groundColor="#232872" />
                        <OrleansDoor
                            key={doorKey}
                            doorHeight={doorHeight}
                            doorWidth={doorWidth}
                            glassConfig={glassConfig}
                            onReady={() => setIsLoading(false)}
                            slab={{ color: slabColor, roughness: slabRoughness, metalness: slabMetalness }}
                            mold={{ color: moldColor, roughness: moldRoughness, metalness: moldMetalness }}
                            stopJam={{ color: stopJamColor, roughness: stopJamRoughness, metalness: stopJamMetalness }}
                            sealTop={{ color: sealTopColor, roughness: sealTopRoughness, metalness: sealTopMetalness }}
                            sealBot={{ color: sealBotColor, roughness: sealBotRoughness, metalness: sealBotMetalness }}
                            glass={{ color: glassColor, roughness: glassRoughness, metalness: glassMetalness, transmission: glassTransmission, thickness: glassThickness, opacity: glassOpacity }}
                            lightSourceIntensity={lightSourceIntensity}
                            hdrIntensity={hdrIntensity}
                        />
                        <OrbitControls />
                    </Suspense>
                </Canvas>
                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
                        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'sans-serif', fontSize: 15, borderRadius: 10, padding: '12px 24px' }}>
                            Loading…
                        </div>
                    </div>
                )}
                {!isLoading && isUsingDefault && (
                    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 20 }}>
                        <div style={{ background: 'rgba(180,100,0,0.85)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'sans-serif', fontSize: 13, borderRadius: 10, padding: '10px 20px', whiteSpace: 'nowrap' }}>
                            The 3D Model for this combination is not ready yet — showing default 3D model
                        </div>
                    </div>
                )}
                <OrleansDoorSizePicker
                    height={doorHeight}
                    width={doorWidth}
                    onHeightSelect={setDoorHeight}
                    onWidthSelect={setDoorWidth}
                />
                {DEBUG && <GlobalPresetMaterialPicker
                    presets={allPresets}
                    selected={selectedPreset}
                    onSelect={setSelectedPreset}
                    onDelete={handleDeletePreset}
                />}
                <OrleansGlassConfigPicker selected={glassConfig} onSelect={setGlassConfig} doorHeight={doorHeight} />
            </div>
        </>
    )
}
