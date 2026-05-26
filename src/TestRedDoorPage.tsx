import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import { Mesh, MeshStandardMaterial, MeshPhysicalMaterial } from 'three'

interface RedDoorProps {
    positionX?: number
    aoMapIntensity?: number
    lightMapIntensity?: number
}

function RedDoor({ positionX = 0, aoMapIntensity = 1.0, lightMapIntensity = 4.0 }: RedDoorProps) {
    const { scene: gltfScene } = useGLTF('/assets/models/test-red-door.glb')
    const scene = useMemo(() => gltfScene.clone(), [gltfScene])

    const [aoMapTexture, lightMapTexture] = useTexture([
        '/assets/textures/test-red-door/door_AO_bake.png',
        '/assets/textures/test-red-door/door_lightmap_bake.png'
    ])

    aoMapTexture.flipY = false
    lightMapTexture.flipY = false

    useEffect(() => {
        scene.traverse((child) => {
            if (!(child instanceof Mesh)) return

            child.receiveShadow = true
            child.castShadow = true

            const name = child.name.toLowerCase()

            if (name.includes('door')) {
                child.material = new MeshStandardMaterial({
                    color: '#ff0000',
                    roughness: 0.4,
                    metalness: 0.6,
                    aoMap: aoMapTexture,
                    aoMapIntensity,
                    lightMap: lightMapTexture,
                    lightMapIntensity,
                })
            }

            if (name.includes('frame')) {
                child.material = new MeshStandardMaterial({
                    color: '#ac9990',
                    roughness: 0.6,
                    metalness: 0.3,
                    aoMap: aoMapTexture,
                    aoMapIntensity,
                    lightMap: lightMapTexture,
                    lightMapIntensity,
                })
            }

            if (name.includes('handle')) {
                child.material = new MeshStandardMaterial({
                    color: '#969490',
                    roughness: 0.2,
                    metalness: 0.8,
                })
            }

            if (name.includes('glass')) {
                child.material = new MeshPhysicalMaterial({
                    color: '#ffffff',
                    roughness: 0.05,
                    metalness: 0.9,
                    transmission: 1,
                    thickness: 0.1,
                    ior: 1.5,
                    transparent: true,
                    opacity: 0.6,
                    envMapIntensity: 1,
                })
            }
        })
    }, [scene, aoMapTexture, lightMapTexture, aoMapIntensity, lightMapIntensity])

    return <primitive object={scene} position={[positionX, 0, 0]} />
}

export default function TestPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
            <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, antialias: true }}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 120]} fov={50} />
                    {/* <ambientLight intensity={0.0} /> */}
                    {/* <directionalLight position={[5, 10, 5]} intensity={0.5} castShadow /> */}
                    <Environment files="/assets/hdr/suburban_garden_1k.hdr" environmentIntensity={1} />

                    {/* Left: with AO + lightmap */}
                    <RedDoor positionX={-18} />

                    {/* Right: without AO + lightmap (aoMapIntensity=0, lightMapIntensity=0) */}
                    <RedDoor positionX={18} aoMapIntensity={0} lightMapIntensity={0} />

                    <OrbitControls />
                </Suspense>
            </Canvas>
        </div>
    )
}

useGLTF.preload('/assets/models/test-red-door.glb')
