import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, MeshBasicMaterial, Mesh, NoColorSpace, MeshPhysicalMaterial } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useState, useEffect, useRef } from 'react'
import { DoorHandle } from './components/DoorHandle'
import { useControls, Leva, button, folder } from 'leva'

const DEBUG = true

useGLTF.preload('/assets/models/uno-door-80x32.glb')
useGLTF.preload('/assets/models/uno-door-80x34.glb')
useGLTF.preload('/assets/models/uno-door-80x36-no-glass.glb')
useGLTF.preload('/assets/models/uno-door-80x36-20x64.glb')
useGLTF.preload('/assets/models/uno-door-80x36-22x64.glb')

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

// ─── Door size & glass types ───────────────────────────────────────────────────

type DoorHeight = '80' | '95'
type DoorWidth = '32' | '34' | '36'

type GlassConfig =
    | 'no-glass'
    | '20x64'
    | '22x64'
    | '22x17-3x'
    | '22x12-4x'
    | '12x12-4x'
    | '7x64-right'
    | '7x64-left'
    | '20x80'
    | '22x80'
    | '22x14-7-16-4x'
    | '22x9-5x'

const GLASS_CONFIG_LABELS: Record<GlassConfig, string> = {
    'no-glass': 'No Glass',
    '20x64': '20" × 64"',
    '22x64': '22" × 64"',
    '22x17-3x': '22" × 17" (3×)',
    '22x12-4x': '22" × 12" (4×)',
    '12x12-4x': '12" × 12" (4×)',
    '7x64-right': '7" × 64" Right',
    '7x64-left': '7" × 64" Left',
    '20x80': '20" × 80"',
    '22x80': '22" × 80"',
    '22x14-7-16-4x': '22" × 14 7/16" (4×)',
    '22x9-5x': '22" × 9" (5×)',
}

// ─── Asset map ────────────────────────────────────────────────────────────────

type DoorAssets = { glb: string; aoMap: string | null; lightMap: string | null }

const DEFAULT_DOOR_ASSETS: DoorAssets = {
    glb: '/assets/models/uno-door-80x32-no-glass.glb',
    aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png',
    lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png',
}

const _def = DEFAULT_DOOR_ASSETS

// Key format: "{height}-{width}-{glass}"
const DOOR_ASSETS: Partial<Record<string, DoorAssets>> = {
    '80-32-no-glass': { glb: '/assets/models/uno-door-80x32-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },
    '80-34-no-glass': { glb: '/assets/models/uno-door-80x34-no-glass.glb', aoMap: _def.aoMap, lightMap: _def.lightMap },
    '80-36-no-glass': { glb: '/assets/models/uno-door-80x36-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-no-glass-Light.png' },
    '80-32-20x64': { glb: '/assets/models/uno-door-80x32-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-34-20x64': { glb: '/assets/models/uno-door-80x34-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-36-20x64': { glb: '/assets/models/uno-door-80x36-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },
    '80-32-22x64': { glb: '/assets/models/uno-door-80x32-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-34-22x64': { glb: '/assets/models/uno-door-80x34-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-36-22x64': { glb: '/assets/models/uno-door-80x36-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },
    '80-32-22x17-3x': { glb: '/assets/models/uno-door-80x32-22x17-3x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-34-22x17-3x': { glb: '/assets/models/uno-door-80x34-22x17-3x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-36-22x17-3x': { glb: '/assets/models/uno-door-80x36-22x17-3x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-32-no-glass': { glb: '/assets/models/uno-door-95x32-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },//AO AND LIGHT MAP IS PENDING
    '95-34-no-glass': { glb: '/assets/models/uno-door-95x34-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },//AO AND LIGHT MAP IS PENDING
    '95-36-no-glass': { glb: '/assets/models/uno-door-95x36-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },//AO AND LIGHT MAP IS PENDING
    // remaining combinations fall back to DEFAULT_DOOR_ASSETS until assets are available
}

function getDoorAssets(height: DoorHeight, width: DoorWidth, glass: GlassConfig): DoorAssets {
    return DOOR_ASSETS[`${height}-${width}-${glass}`] ?? DEFAULT_DOOR_ASSETS
}

// ─── Material preset ──────────────────────────────────────────────────────────

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

// ─── 3D component ─────────────────────────────────────────────────────────────

function UnoDoor({
    doorHeight, doorWidth, glassConfig, onReady,
    slabColor, slabRoughness, slabMetalness,
    stopJamColor, stopJamRoughness, stopJamMetalness,
    sealTopColor, sealTopRoughness, sealTopMetalness,
    sealBotColor, sealBotRoughness, sealBotMetalness,
    glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
}: MaterialPreset & { doorHeight: DoorHeight; doorWidth: DoorWidth; glassConfig: GlassConfig; onReady?: () => void }) {
    const assets = getDoorAssets(doorHeight, doorWidth, glassConfig)

    useEffect(() => { onReady?.() }, [])

    const { scene } = useGLTF(assets.glb)
    const aoMapPath = assets.aoMap ?? DEFAULT_DOOR_ASSETS.aoMap!
    const lightMapPath = assets.lightMap ?? DEFAULT_DOOR_ASSETS.lightMap!
    const aoMap = useTexture(aoMapPath, (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    })
    const aoMapLight = useTexture(lightMapPath, (t) => {
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
    const rubberMaterial = useMemo(() => new MeshBasicMaterial({ color: slabColor }), [slabColor])

    useMemo(() => {
        clone.traverse((child) => {
            if (!(child as Mesh).isMesh) return
            const mesh = child as Mesh
            const name = mesh.name
            let applyAOMap = false
            let applyLightMap = false

            if (name.includes('slab') || name.includes('mold')) {
                mesh.material = slabMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('stop') || name.includes('jam')) {
                mesh.material = stopJamMaterial
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

            if (applyAOMap && assets.aoMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.aoMap = aoMap
                mat.aoMapIntensity = glassConfig === 'no-glass' ? 0 : 0.5
                mat.needsUpdate = true
            }

            if (applyLightMap && assets.lightMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.lightMap = aoMapLight
                mat.lightMapIntensity = 1
                mat.needsUpdate = true
            }
        })
    }, [clone, aoMap, aoMapLight, glassConfig, slabMaterial, stopJamMaterial, sealTopMaterial, sealBotMaterial, glassMaterial])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[assets.glb === DEFAULT_DOOR_ASSETS.glb && doorWidth !== '32' ? 4 : ({ '32': 4, '34': 2, '36': 0 }[doorWidth] ?? 4), 0, 0]} scale={1} roughness={0.5} metalness={0.8} color='silver' />
    </>
}

// ─── UI pickers ───────────────────────────────────────────────────────────────

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
        transition: 'background 0.15s, color 0.15s',
    }
}

function DoorSizePicker({ height, width, onHeightSelect, onWidthSelect }: {
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

function GlassConfigPicker({ selected, onSelect }: { selected: GlassConfig; onSelect: (c: GlassConfig) => void }) {
    const options = Object.keys(GLASS_CONFIG_LABELS) as GlassConfig[]
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

function PresetMaterialPicker({ presets, selected, onSelect, onDelete }: {
    presets: Record<string, MaterialPreset>
    selected: string
    onSelect: (p: string) => void
    onDelete: (p: string) => void
}) {
    return (
        <div style={{ position: 'absolute', top: 300, left: 24, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Material Preset</span>
            {Object.keys(presets).map((key) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TestUnoDoorPage() {
    const [selectedPreset, setSelectedPreset] = useState<string>('Silver')
    const [customPresets, setCustomPresets] = useState<Record<string, MaterialPreset>>(loadCustomPresets)
    const [doorHeight, setDoorHeight] = useState<DoorHeight>('80')
    const [doorWidth, setDoorWidth] = useState<DoorWidth>('32')
    const [glassConfig, setGlassConfig] = useState<GlassConfig>('no-glass')
    const [isLoading, setIsLoading] = useState(true)

    const allPresets = useMemo(() => ({ ...DEFAULT_PRESETS, ...customPresets }), [customPresets])

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
    const doorKey = `${doorHeight}-${doorWidth}-${glassConfig}`
    const isUsingDefault = !DOOR_ASSETS[doorKey]

    useEffect(() => { setIsLoading(true) }, [doorKey])

    return (
        <>
            <Leva hidden={!DEBUG} />
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#ffffff' }}>
                <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, antialias: true }}>
                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[0, 0, doorHeight === '95' ? 250 : 200]} fov={50} />
                        <Environment files={hdrFile} environmentIntensity={1} background={false} />
                        <directionalLight position={[0, 25, 100]} intensity={1} color="#ffffff" />
                        <directionalLight position={[0, 25, -100]} intensity={1} color="#ffffff" />
                        <UnoDoor
                            key={doorKey}
                            doorHeight={doorHeight}
                            doorWidth={doorWidth}
                            glassConfig={glassConfig}
                            onReady={() => setIsLoading(false)}
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
                {/* {DEBUG && <Stats />} */}
                <DoorSizePicker
                    height={doorHeight}
                    width={doorWidth}
                    onHeightSelect={setDoorHeight}
                    onWidthSelect={setDoorWidth}
                />
                {DEBUG && <PresetMaterialPicker
                    presets={allPresets}
                    selected={selectedPreset}
                    onSelect={setSelectedPreset}
                    onDelete={handleDeletePreset}
                />}
                <GlassConfigPicker selected={glassConfig} onSelect={setGlassConfig} />
            </div>
        </>
    )
}
