import { useTexture } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

export const WOOD_DIFF = '/assets/textures/oak_veneer_01_1k.blend/textures/oak_veneer_01_diff_1k_desatured.jpg'
export const WOOD_AO = '/assets/textures/oak_veneer_01_1k.blend/textures/oak_veneer_01_ao_1k.jpg'
export const WOOD_DISP = '/assets/textures/oak_veneer_01_1k.blend/textures/oak_veneer_01_disp_1k.png'

export function useWoodTextures() {
  const [diff, ao, disp] = useTexture([WOOD_DIFF, WOOD_AO, WOOD_DISP])
  useMemo(() => {
    ;[diff, ao, disp].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping
      tex.repeat.set(3, 6)
      tex.needsUpdate = true
    })
  }, [diff, ao, disp])
  return [diff, ao, disp] as const
}

useTexture.preload([WOOD_DIFF, WOOD_AO, WOOD_DISP])
