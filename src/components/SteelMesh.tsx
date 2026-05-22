
export function SteelMesh({ args, color, roughness = 0.25, metalness = 1, ...props }: {
  args: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
  [key: string]: any
}) {
  return (
    <mesh {...props}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={1.0}
      />
    </mesh>
  )
}
