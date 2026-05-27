import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, useTexture, Stats } from '@react-three/drei'
import { Suspense, useEffect, useMemo } from 'react'
import { Mesh, MeshStandardMaterial, MeshPhysicalMaterial } from 'three'
import { LayerMaterial, Depth } from 'lamina/vanilla'

interface RedDoorProps {
    positionX?: number
    aoMapIntensity?: number
    lightMapIntensity?: number
    lightMapToUse?: 'baked' | 'no-hdri'
    doorMaterial?: { roughness: number; metalness: number, useLamina?: boolean }
    frameMaterial?: { roughness: number; metalness: number, useLamina?: boolean }
}

function RedDoor({ positionX = 0, aoMapIntensity = 1.0, lightMapIntensity = 4.0, lightMapToUse = 'baked', doorMaterial = { roughness: 0.4, metalness: 0.6, useLamina: false }, frameMaterial = { roughness: 0.6, metalness: 0.3, useLamina: false } }: RedDoorProps) {
    const { scene: gltfScene } = useGLTF('/assets/models/test-red-door.glb')
    const scene = useMemo(() => gltfScene.clone(), [gltfScene])

    const [aoMapTexture, lightMapTexture, lightMapTextureNoHdri] = useTexture([
        '/assets/textures/test-red-door/door_AO_bake.png',
        '/assets/textures/test-red-door/door_lightmap_bake.png',
        '/assets/textures/test-red-door/door_lightmap_bake-no-hdri-02.png'
    ])

    aoMapTexture.flipY = false
    lightMapTexture.flipY = false
    lightMapTextureNoHdri.flipY = false

    useEffect(() => {
        scene.traverse((child) => {
            if (!(child instanceof Mesh)) return

            child.receiveShadow = true
            child.castShadow = true

            const name = child.name.toLowerCase()

            if (name.includes('door')) {
                if (doorMaterial.useLamina) {
                    child.material = new LayerMaterial({
                        color: '#ff0000',
                        roughness: doorMaterial.roughness,
                        metalness: doorMaterial.metalness,
                        aoMap: aoMapTexture,
                        aoMapIntensity: aoMapIntensity,
                        lightMap: lightMapToUse === 'baked' ? lightMapTexture : lightMapTextureNoHdri,
                        lightMapIntensity: lightMapIntensity * 2,

                        // 3. ¡La magia de Lamina! Apilamos los shaders
                        layers: [
                            // Capa A: El brillo superior (Top edge highlight)
                            new Depth({
                                colorA: '#767202', // Luz blanca pura arriba
                                colorB: '#ff0000', // Rojo neutro abajo
                                alpha: 0.25,       // Intensidad del efecto (ajusta al gusto)
                                mode: 'screen',    // Modo de mezcla (screen o add iluminan)
                                //mapping: 'local',  // Usa las dimensiones del propio mesh
                                near: 0,           // Inicio del gradiente
                                far: 30.0,          // Fin del gradiente (ajustar según la altura en Y de tu puerta)
                                origin: [5, 30, -3] // Desplazamiento del gradiente por si tu punto de pivote está en el centro
                            }),
                        ]
                    })
                } else {
                    child.material = new MeshStandardMaterial({
                        color: '#ff0000',
                        roughness: doorMaterial.roughness,
                        metalness: doorMaterial.metalness,
                        aoMap: aoMapTexture,
                        aoMapIntensity,
                        lightMap: lightMapToUse === 'baked' ? lightMapTexture : lightMapTextureNoHdri,
                        lightMapIntensity,
                    })
                }
            }

            if (name.includes('frame')) {
                if (frameMaterial.useLamina) {
                    child.material = new LayerMaterial({
                        color: '#dbd8d8',
                        roughness: frameMaterial.roughness,
                        metalness: frameMaterial.metalness,
                        aoMap: aoMapTexture,
                        aoMapIntensity: aoMapIntensity,
                        lightMap: lightMapToUse === 'baked' ? lightMapTexture : lightMapTextureNoHdri,
                        lightMapIntensity: lightMapIntensity * 2,

                        // 3. ¡La magia de Lamina! Apilamos los shaders
                        layers: [
                            // Capa A: El brillo superior (Top edge highlight)
                            new Depth({
                                colorA: '#bcb70a', // Luz blanca pura arriba
                                colorB: '#ac9990', // Rojo neutro abajo
                                alpha: 0.45,       // Intensidad del efecto (ajusta al gusto)
                                mode: 'screen',    // Modo de mezcla (screen o add iluminan)
                                //mapping: 'local',  // Usa las dimensiones del propio mesh
                                near: 0,           // Inicio del gradiente
                                far: 30.0,          // Fin del gradiente (ajustar según la altura en Y de tu puerta)
                                origin: [5, 30, -3] // Desplazamiento del gradiente por si tu punto de pivote está en el centro
                            }),
                        ]
                    })
                } else {
                    child.material = new MeshStandardMaterial({
                        color: '#ac9990',
                        roughness: frameMaterial.roughness,
                        metalness: frameMaterial.metalness,
                        aoMap: aoMapTexture,
                        aoMapIntensity,
                        lightMap: lightMapToUse === 'baked' ? lightMapTexture : lightMapTextureNoHdri,
                        lightMapIntensity,
                    })
                }

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
                    roughness: 0.025,
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
    }, [scene, aoMapTexture, lightMapTexture, lightMapTextureNoHdri, aoMapIntensity, lightMapIntensity, lightMapToUse])

    return <primitive object={scene} position={[positionX, 0, 0]} />
}

export default function TestPage() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0' }}>
            <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, antialias: true }}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0, 120]} fov={50} />
                    {/* <ambientLight intensity={0.0} /> */}
                    {/* <directionalLight position={[0, 2, 1]} intensity={1.5} castShadow /> */}
                    <Environment files="/assets/hdr/suburban_garden_1k.hdr" environmentIntensity={1} />


                    {/* Right: without AO + lightmap (aoMapIntensity=0, lightMapIntensity=0) */}
                    <RedDoor positionX={-90} aoMapIntensity={0} lightMapIntensity={0} />

                    {/* Left: with AO + lightmap */}
                    <RedDoor positionX={-40} />


                    <RedDoor positionX={10} lightMapToUse='no-hdri' aoMapIntensity={0.9} lightMapIntensity={3.0} doorMaterial={{ roughness: 0.4, metalness: 0.1 }} frameMaterial={{ roughness: 0.4, metalness: 0.01 }} />

                    <RedDoor positionX={60} lightMapToUse='no-hdri' aoMapIntensity={0.9} lightMapIntensity={1.9} doorMaterial={{ roughness: 0.4, metalness: 0.1, useLamina: true }} frameMaterial={{ roughness: 0.4, metalness: 0.01, useLamina: true }} />

                    <OrbitControls />
                </Suspense>
            </Canvas>
            <Stats />
        </div>
    )
}

useGLTF.preload('/assets/models/test-red-door.glb')
