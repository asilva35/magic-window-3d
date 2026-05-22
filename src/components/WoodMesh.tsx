import * as THREE from 'three'
import { useWoodTextures } from './useWoodTextures'

export function WoodMesh({ args, color, roughness = 0.5, metalness = 0.5, ...props }: {
  args: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
  [key: string]: any
}) {
  const [diff, ao, disp] = useWoodTextures()
  return (
    <mesh {...props}>
      <boxGeometry
        args={args}
        onUpdate={(geom: THREE.BufferGeometry) => {
          const uv = geom.getAttribute('uv')
          if (uv && !geom.getAttribute('uv2')) geom.setAttribute('uv2', uv)
        }}
      />
      <meshStandardMaterial
        color={color}
        map={diff}
        aoMap={ao}
        aoMapIntensity={0.8}
        bumpMap={disp}
        bumpScale={0.02}
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={0.6}
      />
    </mesh>
  )
}
