import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'

function WindowModel() {
  // Aquí es donde luego usarás useGLTF para cargar los modelos de la empresa
  return (
    <mesh castShadow>
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial color="#3498db" roughness={0.1} metalness={0.8} />
    </mesh>
  )
}

// Cached initial data to compute accurate displacements
type InitData = { c1z: number; c2z: number; moldMin: number; moldMax: number }

function DoorSide({ moldScale, onTipZ, ...props }: { moldScale: number; onTipZ?: (z: number) => void;[key: string]: any }) {
  const { scene } = useGLTF('/assets/models/test-bevels-door.glb')

  // Clone the scene so each instance can be manipulated independently
  const clone = useMemo(() => scene.clone(), [scene])

  const baseMoldRef = useRef<any>(null)
  const corner01Ref = useRef<any>(null)
  const corner02Ref = useRef<any>(null)
  const initDataRef = useRef<InitData | null>(null)

  // Find all relevant meshes ONCE for THIS clone when the scene is loaded and cache initial positions
  useEffect(() => {
    let c1z = 0, c2z = 0, moldMin = 0, moldMax = 0;
    clone.traverse((child) => {
      if (child.name === 'base-mold' && (child as any).isMesh) {
        const mesh = child as any
        baseMoldRef.current = mesh
        mesh.geometry.computeBoundingBox()
        const bb = mesh.geometry.boundingBox
        moldMin = bb.min.z
        moldMax = bb.max.z
      }
      if (child.name === 'corner-01') {
        corner01Ref.current = child
        c1z = child.position.z
      }
      if (child.name === 'corner-02') {
        corner02Ref.current = child
        c2z = child.position.z
      }
    })
    initDataRef.current = { c1z, c2z, moldMin, moldMax }
  }, [clone])

  // Update scale and pin corners for THIS clone
  useEffect(() => {
    const baseMold = baseMoldRef.current
    const corner01 = corner01Ref.current
    const corner02 = corner02Ref.current
    const initData = initDataRef.current

    if (!baseMold || !initData) return

    baseMold.scale.z = moldScale

    if (corner01 && corner02) {
      const c1IsMin = Math.abs(initData.c1z - initData.moldMin) < Math.abs(initData.c1z - initData.moldMax)
      const c1Delta = (c1IsMin ? initData.moldMin : initData.moldMax) * (moldScale - 1)
      const c2Delta = (!c1IsMin ? initData.moldMin : initData.moldMax) * (moldScale - 1)

      corner01.position.z = initData.c1z + c2Delta
      corner02.position.z = initData.c2z + c1Delta
    }

    if (onTipZ && initData) {
      // The true mathematical pivot at scale 1.0 is exactly 3.92 (as established by the original layout).
      // Since the corner pieces do not scale, they simply translate by exactly `moldMax * (moldScale - 1)`.
      // Therefore, the pivot at any scale is the initial pivot plus the displacement!
      const INITIAL_PIVOT = 3.92
      const currentPivot = INITIAL_PIVOT + initData.moldMax * (moldScale - 1)
      onTipZ(currentPivot)
    }
  }, [moldScale, onTipZ])

  return <primitive object={clone} {...props} />
}


useGLTF.preload('/assets/models/test-bevels-door.glb')

export default function App() {
  const [moldScale, setMoldScale] = useState(1)
  const [moldScale2, setMoldScale2] = useState(1)

  // Real tip Z values reported by the DoorSide instances after each scale update.
  // Vertical tip  → used as the Y position of horizontal sides.
  // Horizontal tip → used as the X offset of vertical sides.
  const [vTip, setVTip] = useState(3.94)   // far corner of a vertical side in local Z
  const [hTip, setHTip] = useState(3.92)   // far corner of a horizontal side in local Z

  // The vertical sides are rotated [PI/2, 0, 0] → local Z maps to world Y.
  // The horizontal sides are rotated [PI/2, ±PI/2, 0] → local Z maps to world X.
  const hSideY = vTip                // horizontal sides sit at ±vTip in world Y
  const vSideX = hTip * 2            // right vertical side sits at 2×hTip in world X
  const hSideCenterX = hTip          // horizontal sides are centered at hTip in world X

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0', position: 'relative' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Vertical Scale: {moldScale.toFixed(1)}</label>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={moldScale}
          onChange={(e) => setMoldScale(parseFloat(e.target.value))}
        />
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Horizontal Scale: {moldScale2.toFixed(1)}</label>
        <input
          type="range"
          min="0.1"
          max="10"
          step="0.1"
          value={moldScale2}
          onChange={(e) => setMoldScale2(parseFloat(e.target.value))}
        />
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

          {/* Stage maneja automáticamente la iluminación y sombras de calidad */}
          <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2 }}>
            <group>
              {/* Left vertical side — anchored at x=0; reports actual tip so horizontal sides track it */}
              <DoorSide moldScale={moldScale} onTipZ={setVTip} rotation={[Math.PI / 2, 0, 0]} />

              {/* Right vertical side — x driven by actual horizontal-side tip */}
              <DoorSide moldScale={moldScale} position={[vSideX, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]} />

              {/* Bottom horizontal side — reports actual tip so vertical sides track it */}
              <DoorSide moldScale={moldScale2} onTipZ={setHTip} position={[hSideCenterX, -hSideY, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />

              {/* Top horizontal side */}
              <DoorSide moldScale={moldScale2} position={[hSideCenterX, hSideY, 0]} rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
            </group>
          </Stage>

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        </Suspense>
      </Canvas>
    </div>
  )
}