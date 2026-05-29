import { useGLTF } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

useGLTF.preload('/assets/models/handle-berlin.glb')

export function DoorHandle({
  color = '#c0c0c0',
  roughness = 0.15,
  metalness = 1,
  ...props
}: {
  color?: string
  roughness?: number
  metalness?: number
  [key: string]: any
}) {
  const { scene } = useGLTF('/assets/models/handle-berlin.glb')
  const clone = useMemo(() => scene.clone(true), [scene])

  useMemo(() => {
    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return
      const mesh = child as THREE.Mesh
      mesh.material = new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness,
        envMapIntensity: 1.0,
      })
    })
  }, [clone, color, roughness, metalness])

  return <primitive object={clone} {...props} />
}
