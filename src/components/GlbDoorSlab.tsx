import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

export function GlbDoorSlab({ path, color, width, height, roughness = 0.25 }: { path: string; color: string; width: number; height: number; roughness?: number }) {
  const { scene } = useGLTF(path)
  const clone = useMemo(() => scene.clone(), [scene])
  useEffect(() => {
    clone.traverse(child => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color,
          roughness,
          metalness: 1,
          envMapIntensity: 1.0,
        })
      }
    })
  }, [clone, color])
  // GLTF geometry spans [-1,1], node scale [12,30,0.25] → rendered 24×60×0.5; scale to match door size
  return <primitive object={clone} scale={[width / 24, height / 60, 0.5]} />
}
