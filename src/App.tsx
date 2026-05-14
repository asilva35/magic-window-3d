import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, PerspectiveCamera, useGLTF, Stats } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo } from 'react'
import * as THREE from 'three'

type InitData = { c1z: number; c2z: number; moldMin: number; moldMax: number }

function Moulding({ moldScale, onTipZ, color = '#2c2c2c', ...props }: {
  moldScale: number
  onTipZ?: (z: number) => void
  color?: string
  [key: string]: any
}) {
  const { scene } = useGLTF('/assets/models/test-bevels-door.glb')
  const clone = useMemo(() => scene.clone(), [scene])

  const baseMoldRef = useRef<any>(null)
  const corner01Ref = useRef<any>(null)
  const corner02Ref = useRef<any>(null)
  const [initData, setInitData] = useState<InitData | null>(null)

  useEffect(() => {
    let c1z = 0, c2z = 0, moldMin = 0, moldMax = 0
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
          mesh.material = mesh.material.clone()
          const mat = mesh.material as THREE.MeshStandardMaterial
          if (mat.color) mat.color.set(color)
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
  }, [clone, color])

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
      const INITIAL_PIVOT = 3.92
      const currentPivot = INITIAL_PIVOT + initData.moldMax * (moldScale - 1)
      onTipZ(currentPivot)
    }
  }, [moldScale, onTipZ, initData])

  return <primitive object={clone} {...props} />
}

function PanelMoulding({ moldScale, moldScale2, color = '#2c2c2c', ...props }: {
  moldScale: number
  moldScale2: number
  color?: string
  [key: string]: any
}) {
  const [vTip, setVTip] = useState(3.94)
  const [hTip, setHTip] = useState(3.92)
  const hSideY = vTip

  return (
    <group {...props}>
      <Moulding color={color} moldScale={moldScale} onTipZ={setVTip} position={[-hTip, 0, 0]} rotation={[Math.PI / 2, 0, 0]} />
      <Moulding color={color} moldScale={moldScale} position={[hTip, 0, 0]} rotation={[Math.PI / 2, Math.PI, 0]} />
      <Moulding color={color} moldScale={moldScale2} onTipZ={setHTip} position={[0, -hSideY, 0]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
      <Moulding color={color} moldScale={moldScale2} position={[0, hSideY, 0]} rotation={[Math.PI / 2, -Math.PI / 2, 0]} />
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

interface PanelConfig {
  y: number
  x?: number
  moldScale: number
  moldScale2: number
}

function Door({ color = '#2c2c2c', mouldingColor, panels = [], ...props }: {
  color?: string
  mouldingColor?: string
  panels?: PanelConfig[]
  [key: string]: any
}) {
  const DOOR_W = 15
  const DOOR_H = 30
  const DOOR_D = 0.5
  const PANEL_Z = DOOR_D / 2 + 0.01
  const mc = mouldingColor ?? color

  return (
    <group {...props}>
      <mesh>
        <boxGeometry args={[DOOR_W, DOOR_H, DOOR_D]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>

      {panels.map((panel, i) => (
        <PanelMoulding
          key={i}
          color={mc}
          moldScale={panel.moldScale}
          moldScale2={panel.moldScale2}
          position={[panel.x ?? 0, panel.y, PANEL_Z]}
        />
      ))}

      <DoorHandler position={[-6.5, 0, PANEL_Z]} rotation={[0, Math.PI, 0]} scale={0.1} />
    </group>
  )
}

function GroupDoors({ ms1 = 1, ms2 = 1, ms3 = 0.5, ms4 = 1, ...props }: {
  ms1?: number; ms2?: number; ms3?: number; ms4?: number;[key: string]: any
}) {
  const SPACING = 17

  return (
    <group {...props}>

      {/* Uno — 1 large panel */}
      <Door
        color="#e86253"
        panels={[
          { y: 1, moldScale: 3.0, moldScale2: 1.2 },
        ]}
        position={[-2.5 * SPACING, 0, 0]}
      />

      {/* Orleans — 2 panels: top larger, bottom smaller */}
      <Door
        color="#2c2c2c"
        panels={[
          { y: 4.0, moldScale: ms1, moldScale2: ms2 },
          { y: -7.5, moldScale: ms3, moldScale2: ms4 },
        ]}
        position={[-1.5 * SPACING, 0, 0]}
      />

      {/* London — 2 equal panels */}
      <Door
        color="#f0ede5"
        panels={[
          { y: 7, moldScale: 0.85, moldScale2: 1.0 },
          { y: -2, moldScale: 0.85, moldScale2: 1.0 },
        ]}
        position={[-0.5 * SPACING, 0, 0]}
      />

      {/* Victoria — 3 evenly spaced panels */}
      <Door
        color="#9dbfb2"
        panels={[
          { y: 9, moldScale: 0.7, moldScale2: 1.0 },
          { y: 1, moldScale: 0.7, moldScale2: 1.0 },
          { y: -7, moldScale: 0.7, moldScale2: 1.0 },
        ]}
        position={[0.5 * SPACING, 0, 0]}
      />

      {/* Soho — 4 evenly spaced panels */}
      <Door
        color="#2d5448"
        panels={[
          { y: 10, moldScale: 0.5, moldScale2: 1.0 },
          { y: 3, moldScale: 0.5, moldScale2: 1.0 },
          { y: -4, moldScale: 0.5, moldScale2: 1.0 },
          { y: -11, moldScale: 0.5, moldScale2: 1.0 },
        ]}
        position={[1.5 * SPACING, 0, 0]}
      />

      {/* Vog — no panels (bevels omitted) */}
      <Door
        color="#3d3d3d"
        panels={[]}
        position={[2.5 * SPACING, 0, 0]}
      />

    </group>
  )
}

useGLTF.preload('/assets/models/test-bevels-door.glb')
useGLTF.preload('/assets/models/HandleBerlinLeverHandle.glb')

export default function App() {
  const [ms1, setMs1] = useState(1)
  const [ms2, setMs2] = useState(1)
  const [ms3, setMs3] = useState(0.5)
  const [ms4, setMs4] = useState(1)

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#f0f0f0', position: 'relative' }}>

      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 100,
        background: 'rgba(255,255,255,0.85)', padding: 15, borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <label style={{ fontSize: 13, fontWeight: 'bold' }}>Orleans — Top Panel</label>
        <label style={{ fontSize: 12 }}>Vertical: {ms1.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={ms1}
          onChange={e => setMs1(parseFloat(e.target.value))} />
        <label style={{ fontSize: 12 }}>Horizontal: {ms2.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={ms2}
          onChange={e => setMs2(parseFloat(e.target.value))} />

        <label style={{ fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>Orleans — Bottom Panel</label>
        <label style={{ fontSize: 12 }}>Vertical: {ms3.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={ms3}
          onChange={e => setMs3(parseFloat(e.target.value))} />
        <label style={{ fontSize: 12 }}>Horizontal: {ms4.toFixed(1)}</label>
        <input type="range" min="0.3" max="1.4" step="0.1" value={ms4}
          onChange={e => setMs4(parseFloat(e.target.value))} />
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[20, 0, 60]} fov={60} />
          <Stats />
          <directionalLight position={[0, 5, 90]} intensity={1.5} />
          <GroupDoors ms1={ms1} ms2={ms2} ms3={ms3} ms4={ms4} />
          {/* <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2 }}>
            <GroupDoors ms1={ms1} ms2={ms2} ms3={ms3} ms4={ms4} />
          </Stage> */}
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
        </Suspense>
      </Canvas>
    </div>
  )
}
