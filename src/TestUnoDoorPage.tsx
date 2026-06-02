import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, MeshBasicMaterial, Mesh, NoColorSpace, MeshPhysicalMaterial } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, Stats, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useState, useEffect, useRef } from 'react'
import { DoorHandle } from './components/DoorHandle'
import { useControls, Leva, button, folder } from 'leva'

const DEBUG = true

useGLTF.preload('/assets/models/uno-door.glb')

const HDR_OPTIONS = {
    'Suburban Garden': '/assets/hdr/suburban_garden_1k.hdr',
    'Braustuble Alley': '/assets/hdr/braustuble_alley_1k.hdr',
    'Church Meeting Room': '/assets/hdr/church_meeting_room_1k.hdr',
    'Citrus Orchard Road': '/assets/hdr/citrus_orchard_road_puresky_1k.hdr',
    'Empty Warehouse': '/assets/hdr/empty_warehouse_01_2k.hdr',
    'Glasshouse Interior': '/assets/hdr/glasshouse_interior_1k.hdr',
    'Goegap Road': '/assets/hdr/goegap_road_1k.hdr',
    'Kloofendal Cloudy': '/assets/hdr/kloofendal_48d_partly_cloudy_puresky_1k.hdr',
    'Meadow': '/assets/hdr/meadow_1k.hdr',
    'Qwantani Dusk': '/assets/hdr/qwantani_dusk_2_puresky_1k.hdr',
    'Sundowner Overlook': '/assets/hdr/sundowner_overlook_1k.hdr',
}

type MaterialPreset = {
    slabColor: string
    slabRoughness: number
    slabMetalness: number
    stopJamColor: string
    stopJamRoughness: number
    stopJamMetalness: number
    sealTopColor: string
    sealTopRoughness: number
    sealTopMetalness: number
    sealBotColor: string
    sealBotRoughness: number
    sealBotMetalness: number
    glassColor: string
    glassRoughness: number
    glassMetalness: number
    glassTransmission: number
    glassThickness: number
    glassOpacity: number
}

const DEFAULT_PRESETS: Record<string, MaterialPreset> = {
    'Silver': {
        slabColor: '#b4b1ac', slabRoughness: 0.7, slabMetalness: 0.7,
        stopJamColor: '#d5d3d1', stopJamRoughness: 0.9, stopJamMetalness: 0.8,
        sealTopColor: '#fffdfd', sealTopRoughness: 0.2, sealTopMetalness: 0.9,
        sealBotColor: '#2a2121', sealBotRoughness: 0.2, sealBotMetalness: 0.9,
        glassColor: '#dedede', glassRoughness: 0.025, glassMetalness: 0.9,
        glassTransmission: 1, glassThickness: 0.1, glassOpacity: 0.2,
    },
    'Dark': {
        slabColor: '#484747', slabRoughness: 0.7, slabMetalness: 0.7,
        stopJamColor: '#867a7a', stopJamRoughness: 0.9, stopJamMetalness: 0.8,
        sealTopColor: '#fffdfd', sealTopRoughness: 0.2, sealTopMetalness: 0.9,
        sealBotColor: '#2a2121', sealBotRoughness: 0.2, sealBotMetalness: 0.9,
        glassColor: '#dedede', glassRoughness: 0.025, glassMetalness: 0.9,
        glassTransmission: 1, glassThickness: 0.1, glassOpacity: 0.2,
    },
    'Red': {
        slabColor: '#ef1313', slabRoughness: 0.7, slabMetalness: 0.7,
        stopJamColor: '#ffffff', stopJamRoughness: 0.9, stopJamMetalness: 0.8,
        sealTopColor: '#fffdfd', sealTopRoughness: 0.2, sealTopMetalness: 0.9,
        sealBotColor: '#2a2121', sealBotRoughness: 0.2, sealBotMetalness: 0.9,
        glassColor: '#dedede', glassRoughness: 0.025, glassMetalness: 0.9,
        glassTransmission: 1, glassThickness: 0.1, glassOpacity: 0.2,
    },
    'Gold': {
        slabColor: '#867a28', slabRoughness: 0.7, slabMetalness: 0.7,
        stopJamColor: '#ebe3ac', stopJamRoughness: 0.9, stopJamMetalness: 0.8,
        sealTopColor: '#fffdfd', sealTopRoughness: 0.2, sealTopMetalness: 0.9,
        sealBotColor: '#2a2121', sealBotRoughness: 0.2, sealBotMetalness: 0.9,
        glassColor: '#dedede', glassRoughness: 0.025, glassMetalness: 0.9,
        glassTransmission: 1, glassThickness: 0.1, glassOpacity: 0.2,
    },
}

const STORAGE_KEY = 'uno-door-presets'

function loadCustomPresets(): Record<string, MaterialPreset> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function UnoDoor({
    slabColor, slabRoughness, slabMetalness,
    stopJamColor, stopJamRoughness, stopJamMetalness,
    sealTopColor, sealTopRoughness, sealTopMetalness,
    sealBotColor, sealBotRoughness, sealBotMetalness,
    glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
}: MaterialPreset) {
    const { scene } = useGLTF('/assets/models/uno-door.glb')
    const aoMap = useTexture('/assets/textures/doors/uno/uno-80x36-20x64-AO.png', (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    })
    const aoMapLight = useTexture('/assets/textures/doors/uno/uno-80x36-20x64-Light.png', (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    })

    const clone = useMemo(() => scene.clone(true), [scene])

    const slabMaterial = useMemo(() => new MeshStandardMaterial({ color: slabColor, metalness: slabMetalness, roughness: slabRoughness }), [slabColor, slabMetalness, slabRoughness])
    const stopJamMaterial = useMemo(() => new MeshStandardMaterial({ color: stopJamColor, metalness: stopJamMetalness, roughness: stopJamRoughness }), [stopJamColor, stopJamMetalness, stopJamRoughness])
    const sealTopMaterial = useMemo(() => new MeshStandardMaterial({ color: sealTopColor, metalness: sealTopMetalness, roughness: sealTopRoughness }), [sealTopColor, sealTopMetalness, sealTopRoughness])
    const sealBotMaterial = useMemo(() => new MeshStandardMaterial({ color: sealBotColor, metalness: sealBotMetalness, roughness: sealBotRoughness }), [sealBotColor, sealBotMetalness, sealBotRoughness])
    const glassMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: glassColor,
        roughness: glassRoughness,
        metalness: glassMetalness,
        transmission: glassTransmission,
        thickness: glassThickness,
        ior: 1.5,
        transparent: true,
        opacity: glassOpacity,
        envMapIntensity: 1,
    }), [glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity])
    const rubberMaterial = useMemo(() => new MeshBasicMaterial({
        color: slabColor,
    }), [slabColor])

    useMemo(() => {
        clone.traverse((child) => {
            if (!(child as Mesh).isMesh) return
            const mesh = child as Mesh
            const name = mesh.name
            let applyAOMap = false
            let applyLightMap = false

            if (name.includes('slab')) {
                mesh.material = slabMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('stop') || name.includes('jam')) {
                mesh.material = stopJamMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('mold')) {
                mesh.material = slabMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-top') {
                mesh.material = sealTopMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-bottom') {
                mesh.material = sealBotMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('glass')) {
                mesh.material = glassMaterial
            } else if (name.includes('rubber')) {
                mesh.material = rubberMaterial
            }

            if (applyAOMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.aoMap = aoMap
                mat.aoMapIntensity = 0.5
                mat.needsUpdate = true
            }

            if (applyLightMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.lightMap = aoMapLight
                mat.lightMapIntensity = 1
                mat.needsUpdate = true
            }
        })
    }, [clone, aoMap, aoMapLight, slabMaterial, stopJamMaterial, sealTopMaterial, sealBotMaterial, glassMaterial])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[0, 0, 0]} scale={1} roughness={0.5} metalness={0.8} color='silver' />
    </>
}

function PresetMaterialPicker({ presets, selected, onSelect, onDelete }: {
    presets: Record<string, MaterialPreset>
    selected: string
    onSelect: (p: string) => void
    onDelete: (p: string) => void
}) {
    return (
        <div style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
            borderRadius: 10,
            padding: '12px 14px',
            zIndex: 10,
        }}>
            <span style={{ color: '#aaa', fontSize: 10, fontFamily: 'sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                Material Preset
            </span>
            {Object.keys(presets).map((key) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                        onClick={() => onSelect(key)}
                        style={{
                            flex: 1,
                            background: selected === key ? '#fff' : 'rgba(255,255,255,0.1)',
                            color: selected === key ? '#111' : '#ddd',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 14px',
                            fontFamily: 'sans-serif',
                            fontSize: 13,
                            fontWeight: selected === key ? 700 : 400,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s, color 0.15s',
                        }}
                    >
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

export default function TestUnoDoorPage() {
    const [selectedPreset, setSelectedPreset] = useState<string>('Silver')
    const [customPresets, setCustomPresets] = useState<Record<string, MaterialPreset>>(loadCustomPresets)

    const allPresets = useMemo(() => ({ ...DEFAULT_PRESETS, ...customPresets }), [customPresets])

    // Ref kept in sync each render so the Leva button handler always reads the latest values
    const materialsRef = useRef<MaterialPreset>(DEFAULT_PRESETS['Silver'])

    const init = DEFAULT_PRESETS['Silver']

    const [{ hdr,
        slabColor, slabRoughness, slabMetalness,
        stopJamColor, stopJamRoughness, stopJamMetalness,
        sealTopColor, sealTopRoughness, sealTopMetalness,
        sealBotColor, sealBotRoughness, sealBotMetalness,
        glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
    }, set] = useControls(() => ({
        hdr: {
            label: 'Environment',
            value: 'Suburban Garden',
            options: Object.keys(HDR_OPTIONS),
        },
        'Slab / Frame': folder({
            slabColor: { label: 'Color', value: init.slabColor },
            slabRoughness: { label: 'Roughness', value: init.slabRoughness, min: 0, max: 1, step: 0.01 },
            slabMetalness: { label: 'Metalness', value: init.slabMetalness, min: 0, max: 1, step: 0.01 },
        }),
        'Stop / Jam': folder({
            stopJamColor: { label: 'Color', value: init.stopJamColor },
            stopJamRoughness: { label: 'Roughness', value: init.stopJamRoughness, min: 0, max: 1, step: 0.01 },
            stopJamMetalness: { label: 'Metalness', value: init.stopJamMetalness, min: 0, max: 1, step: 0.01 },
        }),
        'Seal Top': folder({
            sealTopColor: { label: 'Color', value: init.sealTopColor },
            sealTopRoughness: { label: 'Roughness', value: init.sealTopRoughness, min: 0, max: 1, step: 0.01 },
            sealTopMetalness: { label: 'Metalness', value: init.sealTopMetalness, min: 0, max: 1, step: 0.01 },
        }),
        'Seal Bottom': folder({
            sealBotColor: { label: 'Color', value: init.sealBotColor },
            sealBotRoughness: { label: 'Roughness', value: init.sealBotRoughness, min: 0, max: 1, step: 0.01 },
            sealBotMetalness: { label: 'Metalness', value: init.sealBotMetalness, min: 0, max: 1, step: 0.01 },
        }),
        'Glass': folder({
            glassColor: { label: 'Color', value: init.glassColor },
            glassRoughness: { label: 'Roughness', value: init.glassRoughness, min: 0, max: 1, step: 0.001 },
            glassMetalness: { label: 'Metalness', value: init.glassMetalness, min: 0, max: 1, step: 0.01 },
            glassTransmission: { label: 'Transmission', value: init.glassTransmission, min: 0, max: 1, step: 0.01 },
            glassThickness: { label: 'Thickness', value: init.glassThickness, min: 0, max: 5, step: 0.01 },
            glassOpacity: { label: 'Opacity', value: init.glassOpacity, min: 0, max: 1, step: 0.01 },
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

    // Keep ref current so the Save button closure always captures the latest control values
    materialsRef.current = {
        slabColor, slabRoughness, slabMetalness,
        stopJamColor, stopJamRoughness, stopJamMetalness,
        sealTopColor, sealTopRoughness, sealTopMetalness,
        sealBotColor, sealBotRoughness, sealBotMetalness,
        glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
    }

    useEffect(() => {
        const preset = allPresets[selectedPreset]
        if (preset) set(preset)
    }, [selectedPreset])

    const handleDeletePreset = (key: string) => {
        setCustomPresets(prev => {
            const updated = { ...prev }
            delete updated[key]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
        if (selectedPreset === key) setSelectedPreset('Silver')
    }

    const hdrFile = HDR_OPTIONS[hdr as keyof typeof HDR_OPTIONS]

    return (
        <>
            <Leva hidden={!DEBUG} />
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#ffffff' }}>
                <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, antialias: true }}>
                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[0, 0, 200]} fov={50} />
                        <Environment files={hdrFile} environmentIntensity={1} background={false} />
                        <directionalLight position={[0, 25, 100]} intensity={1} color="#ffffff" />
                        <directionalLight position={[0, 25, -100]} intensity={1} color="#ffffff" />
                        <UnoDoor
                            slabColor={slabColor}
                            slabRoughness={slabRoughness}
                            slabMetalness={slabMetalness}
                            stopJamColor={stopJamColor}
                            stopJamRoughness={stopJamRoughness}
                            stopJamMetalness={stopJamMetalness}
                            sealTopColor={sealTopColor}
                            sealTopRoughness={sealTopRoughness}
                            sealTopMetalness={sealTopMetalness}
                            sealBotColor={sealBotColor}
                            sealBotRoughness={sealBotRoughness}
                            sealBotMetalness={sealBotMetalness}
                            glassColor={glassColor}
                            glassRoughness={glassRoughness}
                            glassMetalness={glassMetalness}
                            glassTransmission={glassTransmission}
                            glassThickness={glassThickness}
                            glassOpacity={glassOpacity}
                        />
                        <OrbitControls />
                    </Suspense>
                </Canvas>
                {DEBUG && <Stats />}
                {DEBUG && <PresetMaterialPicker
                    presets={allPresets}
                    selected={selectedPreset}
                    onSelect={setSelectedPreset}
                    onDelete={handleDeletePreset}
                />}
            </div>
        </>
    )
}
