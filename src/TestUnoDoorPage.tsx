import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, Mesh, NoColorSpace, MeshPhysicalMaterial } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, Stats, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo } from 'react'
import { DoorHandle } from './components/DoorHandle'
import { LayerMaterial, Depth } from 'lamina/vanilla'


useGLTF.preload('/assets/models/uno-door.glb')



function UnoDoor() {
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

    const slabMaterial = new LayerMaterial({
        color: '#626262',
        roughness: 0.7,
        metalness: 0.8,
        layers: [
            new Depth({
                colorA: '#36484d',
                colorB: '#626262',
                alpha: 3.25,
                mode: 'screen',
                near: 0,
                far: 90.0,
                origin: [18, 65, -3]
            }),
        ]
    })
    const stopJamMaterial = new MeshStandardMaterial({ color: '#ffffff', metalness: 0.8, roughness: 0.8 })
    const sealTopMaterial = new MeshStandardMaterial({ color: '#cccccc', metalness: 0.9, roughness: 0.2 })
    const sealBotMaterial = new MeshStandardMaterial({ color: '#444444', metalness: 0.9, roughness: 0.2 })

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
            } else if (name.includes('base-mold') || name.includes('corner')) {
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
            }

            else if (name.includes('glass')) {
                mesh.material = new MeshPhysicalMaterial({
                    color: '#dedede',
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
                mat.aoMapIntensity = 1
                mat.needsUpdate = true
            }

            if (applyLightMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.lightMap = aoMapLight
                mat.lightMapIntensity = 1
                mat.needsUpdate = true
            }
        })
    }, [clone, aoMap])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[0, 0, 0]} scale={1} roughness={0.5} metalness={0.8} color='silver' />
    </>
}

export default function TestUnoDoorPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
            <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, antialias: true }}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 200]} fov={50} />
                    {/* <ambientLight intensity={0.0} /> */}
                    {/* <directionalLight position={[0, 2, 1]} intensity={2.5} castShadow /> */}
                    <Environment files="/assets/hdr/suburban_garden_1k.hdr" environmentIntensity={1} />

                    <UnoDoor />
                    <OrbitControls />
                </Suspense>
            </Canvas>
            <Stats />
        </div>
    )
}