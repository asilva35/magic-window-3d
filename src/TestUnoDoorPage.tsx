import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, Mesh, NoColorSpace } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, Stats, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo } from 'react'

useGLTF.preload('/assets/models/uno-door.glb')

const slabMaterial = new MeshStandardMaterial({ color: '#ffffff', metalness: 0.7, roughness: 0.8 })
const stopJamMaterial = new MeshStandardMaterial({ color: '#ffffff', metalness: 0.8, roughness: 0.8 })
const sealTopMaterial = new MeshStandardMaterial({ color: '#cccccc', metalness: 0.9, roughness: 0.2 })
const sealBotMaterial = new MeshStandardMaterial({ color: '#444444', metalness: 0.9, roughness: 0.2 })

function UnoDoor() {
    const { scene } = useGLTF('/assets/models/uno-door.glb')
    const aoMap = useTexture('/assets/textures/doors/uno/uno-80x36-20x64-AO.png', (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    })

    // const aoMapLight = useTexture('/assets/textures/doors/uno/uno-80-20x64-Light.png', (t) => {
    //     t.colorSpace = NoColorSpace
    //     t.channel = 0
    //     t.flipY = false
    // })
    const clone = useMemo(() => scene.clone(true), [scene])

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
            } else if (name === 'seal-top') {
                mesh.material = sealTopMaterial
            } else if (name === 'seal-bottom') {
                mesh.material = sealBotMaterial
            }

            if (applyAOMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.aoMap = aoMap
                mat.aoMapIntensity = 1
                mat.needsUpdate = true
            }

            // if (applyLightMap) {
            //     const mat = mesh.material as MeshStandardMaterial
            //     mat.lightMap = aoMapLight
            //     mat.lightMapIntensity = 1
            //     mat.needsUpdate = true
            // }
        })
    }, [clone, aoMap])

    return <primitive object={clone} />
}

export default function TestUnoDoorPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
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