import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, Mesh, NoColorSpace, MeshPhysicalMaterial } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, Stats, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useState, useEffect } from 'react'
import { DoorHandle } from './components/DoorHandle'
import { useControls, Leva } from 'leva'

const DEBUG = false

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

function UnoDoor({ slabColor, stopJamColor, sealTopColor, sealBotColor, glassColor }: {
    slabColor: string
    stopJamColor: string
    sealTopColor: string
    sealBotColor: string
    glassColor: string
}) {
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

    const slabMaterial = useMemo(() => new MeshStandardMaterial({ color: slabColor, metalness: 0.7, roughness: 0.425 }), [slabColor])
    const stopJamMaterial = useMemo(() => new MeshStandardMaterial({ color: stopJamColor, metalness: 0.8, roughness: 0.9 }), [stopJamColor])
    const sealTopMaterial = useMemo(() => new MeshStandardMaterial({ color: sealTopColor, metalness: 0.9, roughness: 0.2 }), [sealTopColor])
    const sealBotMaterial = useMemo(() => new MeshStandardMaterial({ color: sealBotColor, metalness: 0.9, roughness: 0.2 }), [sealBotColor])

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
                mesh.material = new MeshPhysicalMaterial({
                    color: glassColor,
                    roughness: 0.025,
                    metalness: 0.9,
                    transmission: 1,
                    thickness: 0.1,
                    ior: 1.5,
                    transparent: true,
                    opacity: 0.2,
                    envMapIntensity: 1,
                })
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
    }, [clone, aoMap, slabMaterial, stopJamMaterial, sealTopMaterial, sealBotMaterial, glassColor])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[0, 0, 0]} scale={1} roughness={0.5} metalness={0.8} color='silver' />
    </>
}

const PresetColors = {
    'Silver': {
        slabColor: '#b4b1ac',
        stopJamColor: '#d5d3d1',
        sealTopColor: '#fffdfd',
        sealBotColor: '#2a2121',
        glassColor: '#dedede',
    },
    'Dark': {
        slabColor: '#483939',
        stopJamColor: '#867a7a',
        sealTopColor: '#fffdfd',
        sealBotColor: '#2a2121',
        glassColor: '#dedede',
    },
    'Red Light': {
        slabColor: '#c19d9d',
        stopJamColor: '#d58f8f',
        sealTopColor: '#fffdfd',
        sealBotColor: '#2a2121',
        glassColor: '#dedede',
    },
    'Gold': {
        slabColor: '#867a28',
        stopJamColor: '#ebe3ac',
        sealTopColor: '#fffdfd',
        sealBotColor: '#2a2121',
        glassColor: '#dedede',
    },
}

type PresetKey = keyof typeof PresetColors

function PresetPicker({ selected, onSelect }: { selected: PresetKey; onSelect: (p: PresetKey) => void }) {
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
                Color Preset
            </span>
            {(Object.keys(PresetColors) as PresetKey[]).map((key) => (
                <button
                    key={key}
                    onClick={() => onSelect(key)}
                    style={{
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
            ))}
        </div>
    )
}

export default function TestUnoDoorPage() {
    const [selectedPreset, setSelectedPreset] = useState<PresetKey>('Silver')

    const [{ hdr, slabColor, stopJamColor, sealTopColor, sealBotColor, glassColor }, set] = useControls(() => ({
        hdr: {
            label: 'Environment',
            value: 'Suburban Garden',
            options: Object.keys(HDR_OPTIONS),
        },
        slabColor: { label: 'Slab / Frame Color', value: '#483939' },
        stopJamColor: { label: 'Stop / Jam Color', value: '#867a7a' },
        sealTopColor: { label: 'Seal Top Color', value: '#fffdfd' },
        sealBotColor: { label: 'Seal Bottom Color', value: '#2a2121' },
        glassColor: { label: 'Glass Color', value: '#dedede' },
    }))

    useEffect(() => {
        set(PresetColors[selectedPreset])
    }, [selectedPreset])

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
                            stopJamColor={stopJamColor}
                            sealTopColor={sealTopColor}
                            sealBotColor={sealBotColor}
                            glassColor={glassColor}
                        />
                        <OrbitControls />
                    </Suspense>
                </Canvas>
                {DEBUG && <Stats />}
                {DEBUG && <PresetPicker selected={selectedPreset} onSelect={setSelectedPreset} />}
            </div>
        </>
    )
}
