import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, PerspectiveCamera, useGLTF, Stats } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'

// Cached initial data to compute accurate displacements
type InitData = { c1z: number; c2z: number; moldMin: number; moldMax: number }

function Moulding({ moldScale, onTipZ, ...props }: { moldScale: number; onTipZ?: (z: number) => void;[key: string]: any }) {
  const { scene } = useGLTF('/assets/models/test-bevels-door.glb')

  // Clone the scene so each instance can be manipulated independently
  const clone = useMemo(() => scene.clone(), [scene])

  const baseMoldRef = useRef<any>(null)
  const corner01Ref = useRef<any>(null)
  const corner02Ref = useRef<any>(null)
  const [initData, setInitData] = useState<InitData | null>(null)

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
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material && !Array.isArray(mesh.material)) {
          // Clone material to avoid affecting other instances
          mesh.material = mesh.material.clone()

          // Check if it's a material that supports these properties
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat.color) mat.color.set('#2c2c2c')
          if (mat.roughness !== undefined) mat.roughness = 0.3
          if (mat.metalness !== undefined) mat.metalness = 0.1
        }
      }
      if (child.name === 'corner-02') {
        corner02Ref.current = child
        c2z = child.position.z
      }
    })
    setInitData({ c1z, c2z, moldMin, moldMax })
  }, [clone])

  // Update scale and pin corners for THIS clone
  useEffect(() => {
    const baseMold = baseMoldRef.current
    const corner01 = corner01Ref.current
    const corner02 = corner02Ref.current

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
  }, [moldScale, onTipZ, initData])

  return <primitive object={clone} {...props} />
}


function PanelMoulding({ moldScale, moldScale2, ...props }: { moldScale: number; moldScale2: number;[key: string]: any }) {
  const [vTip, setVTip] = useState(3.94)
  const [hTip, setHTip] = useState(3.92)

  // The vertical sides are rotated [PI/2, 0, 0]    → local Z maps to world Y.
  // The horizontal sides are rotated [PI/2, ±PI/2, 0] → local Z maps to world X.
  const hSideY = vTip

  return (
    <group {...props}>
      {/* Left vertical side — symmetric at x=-hTip */}
      <Moulding moldScale={moldScale} onTipZ={setVTip} position={[-hTip, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* Right vertical side — symmetric at x=+hTip */}
      <Moulding moldScale={moldScale} position={[hTip, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]} />

      {/* Bottom horizontal side — centered at x=0; reports actual tip so vertical sides track it */}
      <Moulding moldScale={moldScale2} onTipZ={setHTip} position={[0, -hSideY, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />

      {/* Top horizontal side — centered at x=0 */}
      <Moulding moldScale={moldScale2} position={[0, hSideY, 0]} rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
    </group>
  )
}

function DoorHandler(props: any) {
  const { scene } = useGLTF('/assets/models/HandleBerlinLeverHandle.glb')
  const clone = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#b5b5b5',
          metalness: 1.0,
          roughness: 0.35,
        })
      }
    })
  }, [clone])

  return <primitive object={clone} {...props} />
}

function Door({ moldScale, moldScale2, moldScale3, moldScale4, ...props }: {
  moldScale: number; moldScale2: number;
  moldScale3: number; moldScale4: number;
  [key: string]: any
}) {
  // Door slab is fixed — does not change with scale sliders.
  const DOOR_W = 15
  const DOOR_H = 30
  const DOOR_D = 0.5

  // PanelMoulding at scale=1 spans X:[0, hTip*2≈7.84], Y:[-vTip≈-3.94, +3.94].
  // Shift left by the initial hTip so the frame is horizontally centered on the door.
  const CENTER_X = 0
  const PANEL_Z = DOOR_D / 2 + 0.01 // sit just in front of the door face

  return (
    <group {...props}>
      {/* Fixed door slab */}
      <mesh>
        <boxGeometry args={[DOOR_W, DOOR_H, DOOR_D]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Top decorative panel — larger */}
      <PanelMoulding
        moldScale={moldScale}
        moldScale2={moldScale2}
        position={[CENTER_X, 4.0, PANEL_Z]}
      />

      {/* Bottom decorative panel — independent scale */}
      <PanelMoulding
        moldScale={moldScale3}
        moldScale2={moldScale4}
        position={[CENTER_X, -7.5, PANEL_Z]}
      />

      {/* Door Handle */}
      <DoorHandler position={[-6.5, 0, PANEL_Z]} rotation={[0, Math.PI, 0]} scale={0.1} />
    </group>
  )
}

useGLTF.preload('/assets/models/test-bevels-door.glb')
useGLTF.preload('/assets/models/HandleBerlinLeverHandle.glb')

export default function App() {
  const [moldScale, setMoldScale] = useState(1)
  const [moldScale2, setMoldScale2] = useState(1)
  const [moldScale3, setMoldScale3] = useState(0.5)
  const [moldScale4, setMoldScale4] = useState(1)

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
        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>— Top Panel —</label>
        <label style={{ fontSize: '12px' }}>Vertical Scale: {moldScale.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={moldScale}
          onChange={(e) => setMoldScale(parseFloat(e.target.value))} />
        <label style={{ fontSize: '12px' }}>Horizontal Scale: {moldScale2.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={moldScale2}
          onChange={(e) => setMoldScale2(parseFloat(e.target.value))} />

        <label style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '6px' }}>— Bottom Panel —</label>
        <label style={{ fontSize: '12px' }}>Vertical Scale: {moldScale3.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={moldScale3}
          onChange={(e) => setMoldScale3(parseFloat(e.target.value))} />
        <label style={{ fontSize: '12px' }}>Horizontal Scale: {moldScale4.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={moldScale4}
          onChange={(e) => setMoldScale4(parseFloat(e.target.value))} />
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 28]} fov={50} />
          <Stats />

          <directionalLight position={[0, 0, 28]} intensity={1.5} />

          <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2 }}>
            <Door moldScale={moldScale} moldScale2={moldScale2} moldScale3={moldScale3} moldScale4={moldScale4} />
          </Stage>

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        </Suspense>
      </Canvas>
    </div>
  )
}