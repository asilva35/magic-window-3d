import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useGLTF, Stats, ContactShadows, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { LoadingScreen } from './LoadingScreen'

type InitData = { c1z: number; c2z: number; moldMin: number; moldMax: number }

function Moulding({ moldScale, onTipZ, color = '#2c2c2c', ...props }: {
  moldScale: number
  onTipZ?: (z: number) => void
  color?: string
  [key: string]: any
}) {
  const { scene } = useGLTF('/assets/models/MoldOrleansDoor.glb')
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
      if (child.name === 'corner-02') {
        corner02Ref.current = child
        c2z = child.position.z
      }
    })
    setInitData({ c1z, c2z, moldMin, moldMax })
  }, [clone])

  const [woodDiff, woodAo, woodDisp] = useWoodTextures()

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const uv = mesh.geometry.getAttribute('uv')
        if (uv && !mesh.geometry.getAttribute('uv2')) mesh.geometry.setAttribute('uv2', uv)
        mesh.material = new THREE.MeshStandardMaterial({
          color: color,
          map: woodDiff,
          aoMap: woodAo,
          aoMapIntensity: 0.8,
          bumpMap: woodDisp,
          bumpScale: 0.02,
          metalness: 0.1,
          roughness: 0.8,
        })
      }
    })
  }, [clone, color, woodDiff, woodAo, woodDisp])

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
      corner01.position.z = initData.c1z + c1Delta
      corner02.position.z = initData.c2z + c2Delta
    }

    if (onTipZ && initData) {
      const INITIAL_PIVOT = 1.17
      const currentPivot = INITIAL_PIVOT + initData.moldMax * (moldScale - 1)
      onTipZ(currentPivot)
    }
  }, [moldScale, onTipZ, initData])

  return <primitive object={clone} {...props} />
}

function PanelMoulding({ moldScale, moldScale2, color = '#2c2c2c', glassMat, onGlassBounds, ...props }: {
  moldScale: number
  moldScale2: number
  color?: string
  glassMat?: GlassMat
  onGlassBounds?: (w: number, h: number) => void
  [key: string]: any
}) {
  const [vTip, setVTip] = useState(3.94)
  const [hTip, setHTip] = useState(3.92)
  const hSideY = vTip

  const glassW = Math.max(0, hTip * 2 - 1.2)
  const glassH = Math.max(0, vTip * 2 - 1.2)

  // Use a ref so the effect below doesn't re-run just because the callback identity changed
  const boundsRef = useRef(onGlassBounds)
  useEffect(() => { boundsRef.current = onGlassBounds }, [onGlassBounds])

  // Report glass bounds to Door whenever the frame tips settle or glass is toggled
  useEffect(() => {
    if (glassMat) boundsRef.current?.(glassW, glassH)
  }, [hTip, vTip, glassMat, glassW, glassH])

  return (
    <group {...props}>
      <Moulding color={color} moldScale={moldScale} onTipZ={setVTip} position={[-hTip, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
      <Moulding color={color} moldScale={moldScale} position={[hTip, 0, 0.1]} rotation={[Math.PI / 2, Math.PI, 0.1]} />
      <Moulding color={color} moldScale={moldScale2} onTipZ={setHTip} position={[0, -hSideY, 0.1]} rotation={[Math.PI / 2, Math.PI / 2, 0.1]} />
      <Moulding color={color} moldScale={moldScale2} position={[0, hSideY, 0.1]} rotation={[Math.PI / 2, -Math.PI / 2, 0.1]} />
      {glassMat && (
        <group>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[glassW, glassH, 0.04]} />
            <meshStandardMaterial color={glassMat.color} transparent opacity={glassMat.opacity} roughness={glassMat.roughness} metalness={glassMat.metalness} />
          </mesh>
        </group>
      )}
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

function buildStileRail(
  doorW: number,
  doorH: number,
  holes: { cx: number; cy: number; w: number; h: number }[]
): { cx: number; cy: number; w: number; h: number }[] {
  const hw = doorW / 2, hh = doorH / 2
  const xs = Array.from(new Set([
    -hw, hw,
    ...holes.flatMap(h => [
      Math.max(-hw, h.cx - h.w / 2),
      Math.min(hw, h.cx + h.w / 2),
    ])
  ])).sort((a, b) => a - b)
  const ys = Array.from(new Set([
    -hh, hh,
    ...holes.flatMap(h => [
      Math.max(-hh, h.cy - h.h / 2),
      Math.min(hh, h.cy + h.h / 2),
    ])
  ])).sort((a, b) => a - b)
  const pieces: { cx: number; cy: number; w: number; h: number }[] = []
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < ys.length - 1; j++) {
      const x1 = xs[i], x2 = xs[i + 1], y1 = ys[j], y2 = ys[j + 1]
      if (x2 - x1 < 1e-6 || y2 - y1 < 1e-6) continue
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2
      const inHole = holes.some(h =>
        cx > h.cx - h.w / 2 + 1e-5 && cx < h.cx + h.w / 2 - 1e-5 &&
        cy > h.cy - h.h / 2 + 1e-5 && cy < h.cy + h.h / 2 - 1e-5
      )
      if (!inHole) pieces.push({ cx, cy, w: x2 - x1, h: y2 - y1 })
    }
  }
  return pieces
}

/* ── Wood texture system ─────────────────────────────────────────── */

const WOOD_DIFF = '/assets/textures/oak_veneer_01_1k.blend/textures/oak_veneer_01_diff_1k.jpg'
const WOOD_AO = '/assets/textures/oak_veneer_01_1k.blend/textures/oak_veneer_01_ao_1k.jpg'
const WOOD_DISP = '/assets/textures/oak_veneer_01_1k.blend/textures/oak_veneer_01_disp_1k.png'

function useWoodTextures() {
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

function WoodMesh({ args, color, roughness = 0.5, metalness = 0.5, ...props }: {
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
      />
    </mesh>
  )
}

function Door({ color = '#2c2c2c', mouldingColor, panels = [], width = 12, height = 30, glassMat, glassPanelRule = 'top', ...props }: {
  color?: string
  mouldingColor?: string
  panels?: PanelConfig[]
  width?: number
  height?: number
  glassMat?: GlassMat
  glassPanelRule?: 'top' | 'all' | 'none'
  [key: string]: any
}) {
  const DOOR_D = 0.25
  const PANEL_Z = DOOR_D / 2 - 0.1
  const mc = mouldingColor ?? color

  const [glassBounds, setGlassBounds] = useState<Record<number, { w: number; h: number }>>({})

  const panelsKey = panels.map(p => `${p.y}_${p.x ?? 0}`).join('|')
  useEffect(() => { setGlassBounds({}) }, [panelsKey])

  const setBoundsForIdx = useCallback((idx: number, w: number, h: number) => {
    setGlassBounds(prev => {
      if (prev[idx]?.w === w && prev[idx]?.h === h) return prev
      return { ...prev, [idx]: { w, h } }
    })
  }, [])

  const SCALE = 0.4
  const holes = useMemo(() => panels.flatMap((panel, i) => {
    const showGlass = glassMat && glassPanelRule !== 'none' && (glassPanelRule === 'all' || i === 0)
    const b = glassBounds[i]
    if (!showGlass || !b) return []
    return [{ cx: panel.x ?? 0, cy: panel.y, w: b.w * SCALE, h: b.h * SCALE }]
  }), [panels, glassBounds, glassMat, glassPanelRule])

  const stilePieces = useMemo(
    () => holes.length > 0 ? buildStileRail(width, height, holes) : null,
    [width, height, holes]
  )

  return (
    <group {...props}>
      {stilePieces ? (
        stilePieces.map((p, i) => (
          <WoodMesh key={i} args={[p.w, p.h, DOOR_D]} color={color} position={[p.cx, p.cy, 0]} />
        ))
      ) : (
        <WoodMesh args={[width, height, DOOR_D]} color={color} />
      )}

      {panels.map((panel, i) => {
        const showGlass = glassMat && glassPanelRule !== 'none' && (glassPanelRule === 'all' || i === 0)
        return (
          <PanelMoulding
            key={i}
            color={mc}
            moldScale={panel.moldScale}
            moldScale2={panel.moldScale2}
            position={[panel.x ?? 0, panel.y, PANEL_Z]}
            scale={[0.4, 0.4, 1]}
            glassMat={showGlass ? glassMat : undefined}
            onGlassBounds={showGlass ? (w, h) => setBoundsForIdx(i, w, h) : undefined}
          />
        )
      })}

      <DoorHandler position={[-(width / 2 - 0.9), 0, PANEL_Z]} rotation={[0, 0, 0]} />
    </group>
  )
}

const DEFAULT_GLASS_MAT: GlassMat = { color: '#c8dff0', opacity: 0.4, roughness: 0.05, metalness: 0.1 }

function GlassPane({ width, height, z, mat }: { width: number; height: number; z: number; mat: GlassMat }) {
  return (
    <mesh position={[0, 0, z]}>
      <boxGeometry args={[width, height, 0.04]} />
      <meshStandardMaterial color={mat.color} transparent opacity={mat.opacity} roughness={mat.roughness} metalness={mat.metalness} />
    </mesh>
  )
}

function SideLite({ color = '#2c2c2c', width = 4.5, height = 30, glassMat, ...props }: {
  color?: string
  width?: number
  height?: number
  glassMat?: GlassMat
  [key: string]: any
}) {
  const RAIL = 0.5
  const D = 0.25
  const Z = 1.4
  const hw = width / 2
  const hh = height / 2
  const gm = glassMat ?? DEFAULT_GLASS_MAT

  return (
    <group {...props}>
      <WoodMesh args={[RAIL, height, D]} color={color} position={[-hw + RAIL / 2, 0, Z]} />
      <WoodMesh args={[RAIL, height, D]} color={color} position={[hw - RAIL / 2, 0, Z]} />
      <WoodMesh args={[width, RAIL, D]} color={color} position={[0, hh - RAIL / 2, Z]} />
      <WoodMesh args={[width, RAIL, D]} color={color} position={[0, -hh + RAIL / 2, Z]} />
      <GlassPane width={width - 2 * RAIL} height={height - 2 * RAIL} z={Z} mat={gm} />
    </group>
  )
}

function Transom({ color = '#2c2c2c', width = 12, height = 5, glassMat, ...props }: {
  color?: string
  width?: number
  height?: number
  glassMat?: GlassMat
  [key: string]: any
}) {
  const RAIL = 0.5
  const D = 0.25
  const Z = 1.4
  const hw = width / 2
  const hh = height / 2
  const gm = glassMat ?? DEFAULT_GLASS_MAT

  return (
    <group {...props}>
      <WoodMesh args={[RAIL, height, D]} color={color} position={[-hw + RAIL / 2, 0, Z]} />
      <WoodMesh args={[RAIL, height, D]} color={color} position={[hw - RAIL / 2, 0, Z]} />
      <WoodMesh args={[width, RAIL, D]} color={color} position={[0, hh - RAIL / 2, Z]} />
      <WoodMesh args={[width, RAIL, D]} color={color} position={[0, -hh + RAIL / 2, Z]} />
      <GlassPane width={width - 2 * RAIL} height={height - 2 * RAIL} z={Z} mat={gm} />
    </group>
  )
}

function FrameDoor({ color = '#2c2c2c', width = 12, height = 30, style = 'single', glassMat, ...props }: {
  color?: string
  width?: number
  height?: number
  style?: string
  glassMat?: GlassMat
  [key: string]: any
}) {
  const T = 0.5   // frame thickness
  const D = 1.5   // frame depth
  const Z = 0.75  // z offset
  const LITE_W = 4.5   // side lite panel width
  const TRANSOM_H = 5  // transom panel height

  const hasLeft = ['single-left', 'single-double-side', 'single-transom-left', 'single-transom-double'].includes(style)
  const hasRight = ['single-right', 'single-double-side', 'single-transom-right', 'single-transom-double'].includes(style)
  const hasTransom = style.includes('transom')

  const hw = width / 2   // door half-width
  const hh = height / 2  // door half-height

  // Jambs taller when transom is present, shifted up to reach transom top
  const jambH = hasTransom ? height + T + TRANSOM_H : height
  const jambY = hasTransom ? (T + TRANSOM_H) / 2 : 0

  // Outer edges of the full assembly
  const xLeftEdge = hasLeft ? -(hw + T + LITE_W + T) : -(hw + T)
  const xRightEdge = hasRight ? (hw + T + LITE_W + T) : (hw + T)
  const aWidth = xRightEdge - xLeftEdge
  const aCenterX = (xRightEdge + xLeftEdge) / 2

  // Collect all [px, py, pw, ph] tuples for vertical and horizontal members
  const pieces: [number, number, number, number][] = [
    // Left outer jamb
    [xLeftEdge + T / 2, jambY, T, jambH],
    // Right outer jamb
    [xRightEdge - T / 2, jambY, T, jambH],
    // Door-top header (becomes horizontal mullion when transom present)
    [aCenterX, hh + T / 2, aWidth, T],
  ]

  // Inner mullions when side lites are present
  const innerJambH = hasTransom ? jambH - TRANSOM_H : jambH
  const innerJambY = hasTransom ? 0 : jambY
  if (hasLeft) pieces.push([-(hw + T / 2), innerJambY, T, innerJambH])
  if (hasRight) pieces.push([hw + T / 2, innerJambY, T, innerJambH])

  // Transom top header
  if (hasTransom) pieces.push([aCenterX, hh + T + TRANSOM_H + T / 2, aWidth, T])

  return (
    <group {...props}>
      {pieces.map(([px, py, pw, ph], i) => (
        <WoodMesh key={i} args={[pw, ph, D]} color={color} position={[px, py, Z]} />
      ))}

      {/* Side lite panels */}
      {hasRight && (
        <SideLite color={color} width={LITE_W} height={height} glassMat={glassMat} position={[hw + T + LITE_W / 2, 0, 0]} />
      )}
      {hasLeft && (
        <SideLite color={color} width={LITE_W} height={height} glassMat={glassMat} position={[-(hw + T + LITE_W / 2), 0, 0]} />
      )}

      {hasTransom && (
        <Transom color={color} width={aWidth - 2 * T} height={TRANSOM_H} glassMat={glassMat} position={[aCenterX, hh + T + TRANSOM_H / 2, 0]} />
      )}
    </group>
  )
}

function FrontWall({ visible = true, doorWidth, doorHeight, style }: {
  visible?: boolean
  doorWidth: number
  doorHeight: number
  style: string
}) {
  const T = 0.5
  const LITE_W = 4.5
  const TRANSOM_H = 5
  const hw = doorWidth / 2
  const hh = doorHeight / 2
  const hasLeft = ['single-left', 'single-double-side', 'single-transom-left', 'single-transom-double'].includes(style)
  const hasRight = ['single-right', 'single-double-side', 'single-transom-right', 'single-transom-double'].includes(style)
  const hasTransom = style.includes('transom')
  const xLeft = hasLeft ? -(hw + T + LITE_W + T) : -(hw + T)
  const xRight = hasRight ? (hw + T + LITE_W + T) : (hw + T)
  const yBottom = -hh
  const yTop = hasTransom ? hh + T + TRANSOM_H + T : hh + T
  const S = 100

  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-S / 2, -S / 2)
    shape.lineTo(S / 2, -S / 2)
    shape.lineTo(S / 2, S / 2)
    shape.lineTo(-S / 2, S / 2)
    const hole = new THREE.Path()
    hole.moveTo(xLeft, yBottom)
    hole.lineTo(xRight, yBottom)
    hole.lineTo(xRight, yTop)
    hole.lineTo(xLeft, yTop)
    shape.holes.push(hole)
    return new THREE.ShapeGeometry(shape)
  }, [xLeft, xRight, yBottom, yTop])

  return (
    <mesh geometry={geometry} position={[0, 0, 0]} visible={visible}>
      <meshBasicMaterial color='#ffffff' />
    </mesh>
  )
}

function CeilLamp({ position = [0, 0, -5] as [number, number, number] } = {}) {
  const CEIL_Y = 15
  const CABLE_LEN = 6.5
  const CABLE_BOT = CEIL_Y - CABLE_LEN   // 6.5
  const SHADE_H = 0.5
  const SHADE_Y = CABLE_BOT - SHADE_H / 2   // 6.25
  const LIGHT_Y = CABLE_BOT - SHADE_H       // 6.0

  return (
    <group position={position}>
      {/* Cable */}
      <mesh position={[0, CEIL_Y - CABLE_LEN / 2, 0]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[0.03, 0.03, CABLE_LEN, 8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Shade — inverted cone, narrow top, wide bottom */}
      <mesh position={[0, SHADE_Y, 0]} castShadow={false} receiveShadow={false}>
        <cylinderGeometry args={[0.25, 0.75, SHADE_H, 24]} />
        <meshStandardMaterial color="#d4cfc8" roughness={0.4} metalness={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Bulb */}
      <mesh position={[0, CABLE_BOT - 0.5, 0]} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshStandardMaterial color="#fff9e0" emissive="#ffe07a" emissiveIntensity={3} />
      </mesh>

      {/* Light */}
      <pointLight
        position={[0, LIGHT_Y, 0]}
        color="#ffe8a0"
        intensity={400}
        distance={90}
        decay={2}
        castShadow={false}
      />
    </group>
  )
}

const PAN_MIN = new THREE.Vector3(-5, -2, -5)
const PAN_MAX = new THREE.Vector3(5, 5, 5)

function PanClamper({ controlsRef }: { controlsRef: React.RefObject<any> }) {
  useFrame(() => {
    controlsRef.current?.target.clamp(PAN_MIN, PAN_MAX)
  })
  return null
}

function Rotator({ isRotating, children }: { isRotating: boolean, children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      if (isRotating) {
        groupRef.current.rotation.y += delta * 0.5
      } else {
        groupRef.current.rotation.y = 0
      }
    }
  })

  return <group ref={groupRef}>{children}</group>
}


useGLTF.preload('/assets/models/MoldOrleansDoor.glb')
useGLTF.preload('/assets/models/HandleBerlinLeverHandle.glb')
useTexture.preload([WOOD_DIFF, WOOD_AO, WOOD_DISP])

/* ── Types ──────────────────────────────────────────────────────── */

type CfgState = {
  productType: string
  style: string
  width: number
  height: number
  frame: string
  glass: string
  doorGlass: string
  hardware: string
  screen: string
}

/* ── Static data ─────────────────────────────────────────────────── */

const PRODUCT_TYPES = [
  {
    id: 'window', label: 'Window', sub: 'Casement, awning, hung, slider, picture',
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  },
  {
    id: 'patio', label: 'Patio Door', sub: 'Sliding patio doors, French doors',
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="10" cy="13" r="0.7" fill="currentColor"/></svg>`,
  },
  {
    id: 'front', label: 'Front Door', sub: 'The ultimate entry door',
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><line x1="3" y1="21" x2="21" y2="21"/><circle cx="15" cy="13" r="0.7" fill="currentColor"/></svg>`,
  },
  {
    id: 'wall', label: 'Window Wall', sub: 'Floor-to-ceiling, slim-frame',
    glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>`,
  },
]

const STYLES: Record<string, Array<{ id: string; label: string; sub: string }>> = {
  window: [
    { id: 'casement', label: 'Casement', sub: 'Push-out, Parallex® hardware' },
    { id: 'awning', label: 'Awning', sub: 'Top-hinged, opens outward' },
    { id: 'hung', label: 'Double Hung', sub: 'Traditional vertical slide' },
    { id: 'slider', label: 'Slider', sub: 'Horizontal glide' },
    { id: 'picture', label: 'Picture', sub: 'Fixed, maximum view' },
    { id: 'bay', label: 'Bay', sub: 'Three-panel projection' },
  ],
  patio: [
    { id: 'slider2', label: '2-Panel Slider', sub: 'Ultra smooth glide' },
    { id: 'slider3', label: '3-Panel Slider', sub: 'Wide opening' },
    { id: 'slider4', label: '4-Panel Slider', sub: 'Maximum aperture' },
    { id: 'french', label: 'French', sub: 'Centre-hinged double' },
  ],
  front: [
    { id: 'single', label: 'Single Door', sub: 'Standard residential' },
    { id: 'single-right', label: '+ Right Side Lite', sub: 'Right sidelite panel' },
    { id: 'single-left', label: '+ Left Side Lite', sub: 'Left sidelite panel' },
    { id: 'single-double-side', label: '+ Double Side Lite', sub: 'Both sidelite panels' },
    { id: 'single-transom', label: '+ Transom', sub: 'Transom panel above' },
    { id: 'single-transom-right', label: '+ Transom & Right Lite', sub: 'Transom + right sidelite' },
    { id: 'single-transom-left', label: '+ Transom & Left Lite', sub: 'Transom + left sidelite' },
    { id: 'single-transom-double', label: '+ Transom & Both Lites', sub: 'Transom + both sidelites' },
  ],
  wall: [
    { id: 'wall-3', label: '3-Bay Wall', sub: 'Slim frames, big views' },
    { id: 'wall-4', label: '4-Bay Wall', sub: 'Floor-to-ceiling glass' },
    { id: 'wall-corner', label: 'Corner Wall', sub: 'Wraparound glass' },
  ],
}

const FRAME_SWATCHES: Record<string, string> = {
  white: '#F4F5F7',
  cream: '#f0ede5',
  almond: '#E5DCC9',
  sage: '#9dbfb2',
  cobble: '#888A8C',
  charcoal: '#2c2c2c',
  black: '#1B1B1F',
  navy: '#001B70',
  forest: '#2d5448',
  espresso: '#3B2A1E',
  terracotta: '#e86253',
}

const GLASS_PACKAGES = [
  { id: 'double', label: 'Double Pane', sub: 'Standard argon · ER 21', price: 0 },
  { id: 'triple', label: 'Triple Pane', sub: '50% more argon · ER 38', price: 480 },
  { id: 'lowe', label: 'Triple + Low-E', sub: 'Best year-round comfort', price: 720 },
]

type GlassMat = { color: string; opacity: number; roughness: number; metalness: number }

const DOOR_GLASS: { id: string; label: string; category: string; swatch: string }[] = [
  { id: 'sandblast', label: 'Sandblast', category: 'Textured Glass', swatch: 'rgba(215,215,210,0.85)' },
  { id: 'edge', label: 'Edge', category: 'Textured Glass', swatch: 'linear-gradient(135deg,rgba(195,218,228,0.5) 50%,rgba(195,218,228,0.92) 50%)' },
  { id: 'pure', label: 'Pure', category: 'Skillscreen', swatch: 'rgba(238,246,255,0.45)' },
  { id: 'equation', label: 'Equation', category: 'Skillscreen', swatch: 'rgba(215,238,215,0.5)' },
  { id: 'nuando', label: 'Nuando', category: 'Skillscreen', swatch: 'rgba(244,236,218,0.55)' },
  { id: 'mist', label: 'Mist', category: 'Skillscreen', swatch: 'rgba(225,236,248,0.72)' },
  { id: 'winchester', label: 'Winchester', category: 'Stained Glass', swatch: '#b8956a' },
  { id: 'nobel', label: 'Nobel', category: 'Stained Glass', swatch: '#7b9cbf' },
  { id: 'belmont', label: 'Belmont', category: 'Stained Glass', swatch: '#8fb080' },
  { id: 'celeste', label: 'Celeste', category: 'Stained Glass', swatch: '#90b8d8' },
  { id: 'bolero', label: 'Bolero', category: 'Stained Glass', swatch: '#b890b0' },
  { id: 'bistro', label: 'Bistro', category: 'Stained Glass', swatch: '#c0a850' },
  { id: 'portrait', label: 'Portrait', category: 'Stained Glass', swatch: '#c8a080' },
]

const DOOR_GLASS_MAT: Record<string, GlassMat> = {
  sandblast: { color: '#e0e0d8', opacity: 0.98, roughness: 0.85, metalness: 0 },
  edge: { color: '#c8dce8', opacity: 0.65, roughness: 0.6, metalness: 0 },
  pure: { color: '#eef5ff', opacity: 0.45, roughness: 0.25, metalness: 0 },
  equation: { color: '#d8eed8', opacity: 0.5, roughness: 0.25, metalness: 0 },
  nuando: { color: '#f0e8d0', opacity: 0.5, roughness: 0.25, metalness: 0 },
  mist: { color: '#d8e8f5', opacity: 0.7, roughness: 0.5, metalness: 0 },
  winchester: { color: '#b8956a', opacity: 0.65, roughness: 0.1, metalness: 0.15 },
  nobel: { color: '#7b9cbf', opacity: 0.72, roughness: 0.08, metalness: 0.2 },
  belmont: { color: '#8fb080', opacity: 0.65, roughness: 0.1, metalness: 0.1 },
  celeste: { color: '#90b8d8', opacity: 0.72, roughness: 0.05, metalness: 0.2 },
  bolero: { color: '#b890b0', opacity: 0.65, roughness: 0.1, metalness: 0.15 },
  bistro: { color: '#c0a850', opacity: 0.62, roughness: 0.1, metalness: 0.1 },
  portrait: { color: '#c8a080', opacity: 0.62, roughness: 0.15, metalness: 0.1 },
}

const HARDWARE = [
  { id: 'parallex', label: 'Parallex® push-out', sub: 'Patented · never crank again', price: 0 },
  { id: 'crank', label: 'Traditional crank', sub: 'Compatible with retrofit setups', price: -90 },
]

const SCREENS = [
  { id: 'retractable', label: 'Retractable Bug Screen', sub: 'Hidden when not in use', price: 220 },
  { id: 'standard', label: 'Standard Screen', sub: 'Fixed, full-coverage', price: 0 },
  { id: 'none', label: 'No Screen', sub: 'Skip the screen', price: -60 },
]

type DoorModelDef = {
  id: string
  label: string
  sub: string
  color: string
  panels: PanelConfig[]
}

const DOOR_MODELS: DoorModelDef[] = [
  {
    id: 'orleans', label: 'Orleans', sub: '2 panels · top + bottom', color: '#2c2c2c',
    panels: [{ y: 4.0, moldScale: 112, moldScale2: 50 }, { y: -7.5, moldScale: 19, moldScale2: 50 }],
  },
  {
    id: 'uno', label: 'Uno', sub: '1 large panel', color: '#e86253',
    panels: [{ y: 1, moldScale: 150.0, moldScale2: 50.0 }],
  },
  {
    id: 'london', label: 'London', sub: '2 equal panels', color: '#f0ede5',
    panels: [{ y: 4, moldScale: 90, moldScale2: 50 }, { y: -7, moldScale: 35, moldScale2: 50 }],
  },
  {
    id: 'victoria', label: 'Victoria', sub: '3 panels', color: '#9dbfb2',
    panels: [{ y: 10, moldScale: 35, moldScale2: 50 }, { y: -2, x: 2.7, moldScale: 110, moldScale2: 10 }, { y: -2, x: -2.7, moldScale: 110, moldScale2: 10 }],
  },
  {
    id: 'soho', label: 'Soho', sub: '4 panels', color: '#2d5448',
    panels: [{ y: 10, moldScale: 30, moldScale2: 45 }, { y: 3, moldScale: 30, moldScale2: 45 }, { y: -4, moldScale: 30, moldScale2: 45 }, { y: -11, moldScale: 30, moldScale2: 45 }],
  },
  {
    id: 'vog', label: 'Vog', sub: 'Solid · no panels', color: '#3d3d3d',
    panels: [],
  },
]

const DOOR_GLASS_RULE: Record<string, 'top' | 'all' | 'none'> = {
  orleans: 'top', uno: 'top', london: 'top', victoria: 'top', soho: 'all', vog: 'none',
}

const LITE_PATTERNS: Record<string, Record<string, number[][]>> = {
  window: {
    casement: [[50, 4, 50, 96, 1.8]],
    awning: [[4, 50, 96, 50, 1.8]],
    hung: [[4, 50, 96, 50, 1.8]],
    slider: [[50, 4, 50, 96, 1.8]],
    picture: [],
    bay: [[33.3, 4, 33.3, 96, 1.8], [66.6, 4, 66.6, 96, 1.8]],
  },
  patio: {
    slider2: [[50, 4, 50, 96, 2.5]],
    slider3: [[33.3, 4, 33.3, 96, 2.5], [66.6, 4, 66.6, 96, 2.5]],
    slider4: [[25, 4, 25, 96, 2.5], [50, 4, 50, 96, 2.5], [75, 4, 75, 96, 2.5]],
    french: [[50, 4, 50, 96, 2.5]],
  },
  front: {
    'single': [],
    'single-right': [[70, 4, 70, 96, 2.5]],
    'single-left': [[30, 4, 30, 96, 2.5]],
    'single-double-side': [[24, 4, 24, 96, 2.5], [76, 4, 76, 96, 2.5]],
    'single-transom': [[4, 20, 96, 20, 2.5]],
    'single-transom-right': [[70, 4, 70, 96, 2.5], [4, 20, 70, 20, 2.5]],
    'single-transom-left': [[30, 4, 30, 96, 2.5], [30, 20, 96, 20, 2.5]],
    'single-transom-double': [[24, 4, 24, 96, 2.5], [76, 4, 76, 96, 2.5], [24, 20, 76, 20, 2.5]],
  },
  wall: {
    'wall-3': [[33.3, 4, 33.3, 96, 1.5], [66.6, 4, 66.6, 96, 1.5]],
    'wall-4': [[25, 4, 25, 96, 1.5], [50, 4, 50, 96, 1.5], [75, 4, 75, 96, 1.5]],
    'wall-corner': [[40, 4, 40, 96, 1.5]],
  },
}

function computePrice(state: CfgState) {
  const base: Record<string, number> = { window: 1180, patio: 3950, front: 4400, wall: 8600 }
  const sizeMult = (state.width * state.height) / (36 * 60)
  const glass = GLASS_PACKAGES.find(g => g.id === state.glass)?.price ?? 0
  const screen = SCREENS.find(s => s.id === state.screen)?.price ?? 0
  const hw = HARDWARE.find(h => h.id === state.hardware)?.price ?? 0
  return Math.round(((base[state.productType] ?? 1200) * sizeMult + glass + screen + hw) / 10) * 10
}

/* ── Step rail metadata ──────────────────────────────────────────── */

const STEPS = [
  { id: 'type', label: 'Product\nType', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="0.5"/><line x1="12" y1="3" x2="12" y2="21"/><line x1="3" y1="12" x2="21" y2="12"/></svg>` },
  { id: 'model', label: 'Select\nModel', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="2" width="14" height="20" rx="1"/><circle cx="15.5" cy="12" r="1" fill="currentColor" stroke="none"/></svg>` },
  { id: 'style', label: 'Style\n& Opening', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18"/><path d="M3 12h18"/><path d="M16 12 12 8"/></svg>` },
  { id: 'size', label: 'Size', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21V3M21 21V3M3 12h18"/></svg>` },
  { id: 'frame', label: 'Colour', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/></svg>` },
  { id: 'glass', label: 'Glass\nPackage', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/></svg>` },
  { id: 'hardware', label: 'Hardware', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/></svg>` },
  { id: 'screen', label: 'Screens\n& Extras', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18"/><path d="M3 8h18M3 13h18M3 18h18M8 3v18M13 3v18M18 3v18"/></svg>` },
  { id: 'review', label: 'Review\n& Quote', glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 12 5 5L20 7"/></svg>` },
]

/* ── Shared panel sub-components ─────────────────────────────────── */

function StepHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="cfg-step__head">
      <div className="cfg-step__h">{title}</div>
      {sub && <div className="cfg-step__sub">{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="cfg-section__title">{children}</div>
}

function OptionTile({ active, label, swatch, thumb, dimensions, onClick }: {
  active: boolean; label: string; swatch?: string; thumb?: string
  dimensions?: string; onClick: () => void
}) {
  return (
    <button className={`cfg-tile${active ? ' is-active' : ''}`} onClick={onClick}>
      <div className="cfg-tile__media">
        {swatch && <div className="cfg-tile__swatch" style={{ background: swatch }} />}
        {thumb && <div className="cfg-tile__thumb" dangerouslySetInnerHTML={{ __html: thumb }} />}
      </div>
      <div className="cfg-tile__label">{label}</div>
      {dimensions && <div className="cfg-tile__dim">{dimensions}</div>}
    </button>
  )
}

function SizeField({ label, value, onChange, min, max, step }: {
  label: string; value: number; onChange: (v: number) => void
  min: number; max: number; step: number
}) {
  return (
    <div className="cfg-size__field">
      <div className="cfg-size__label">{label} (in)</div>
      <div className="cfg-size__control">
        <button className="cfg-size__btn" onClick={() => onChange(Math.max(min, value - step))}>−</button>
        <div className="cfg-size__value">{value}</div>
        <button className="cfg-size__btn" onClick={() => onChange(Math.min(max, value + step))}>+</button>
      </div>
      <input className="cfg-size__range" type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)} />
    </div>
  )
}

function PickField({ label, value, options, onChange }: {
  label: string
  value: number
  options: { value: number; label: string; disabled?: boolean }[]
  onChange: (v: number) => void
}) {
  return (
    <div className="cfg-pick__field">
      <div className="cfg-size__label">{label}</div>
      <div className="cfg-pick__options">
        {options.map(opt => (
          <button
            key={opt.value}
            className={`cfg-pick__btn${value === opt.value ? ' is-active' : ''}`}
            onClick={() => onChange(opt.value)}
            disabled={opt.disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// function ScaleField({ label, value, min, max, step, onChange }: {
//   label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
// }) {
//   const dec = () => onChange(Math.max(min, Math.round((value - step) * 10) / 10))
//   const inc = () => onChange(Math.min(max, Math.round((value + step) * 10) / 10))
//   return (
//     <div className="cfg-size__field">
//       <div className="cfg-size__label">{label}</div>
//       <div className="cfg-size__control">
//         <button className="cfg-size__btn" onClick={dec}>−</button>
//         <div className="cfg-size__value">{value.toFixed(1)}</div>
//         <button className="cfg-size__btn" onClick={inc}>+</button>
//       </div>
//       <input className="cfg-size__range" type="range" min={min} max={max} step={step} value={value}
//         onChange={e => onChange(parseFloat(e.target.value))} />
//     </div>
//   )
// }

/* ── SVG viewport placeholder (Window / Patio / Wall) ───────────── */

function WindowSVG({ style, type }: { style: string; type: string }) {
  const lites = LITE_PATTERNS[type]?.[style] ?? []
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cfg__window">
      <rect x="0" y="0" width="100" height="100" fill="var(--cfg-frame, #F4F5F7)" />
      <rect x="4" y="4" width="92" height="92" fill="url(#cfg-glass)" />
      {lites.map((line, i) => (
        <line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]}
          stroke="var(--cfg-frame, #F4F5F7)" strokeWidth={line[4] ?? 2.4} strokeLinecap="square" />
      ))}
      <defs>
        <linearGradient id="cfg-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C7D2EC" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#E8F1F8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#6AC3E7" stopOpacity="0.55" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function SVGViewport({ state }: { state: CfgState }) {
  const isWall = state.productType === 'wall'
  const isDoor = state.productType === 'patio'
  const frameHex = FRAME_SWATCHES[state.frame] ?? '#F4F5F7'
  const aspect = isWall ? '2.2' : isDoor ? '0.55' : String(state.width / state.height)
  const product = PRODUCT_TYPES.find(t => t.id === state.productType)
  const styleLabel = STYLES[state.productType]?.find(s => s.id === state.style)?.label ?? ''
  return (
    <div className="cfg__stage">
      <div className="cfg__product"
        style={{ aspectRatio: aspect, '--cfg-frame': frameHex } as React.CSSProperties}>
        <WindowSVG style={state.style} type={state.productType} />
      </div>
      <div className="cfg__product-caption">
        <strong>{product?.label}</strong>
        <span> · {styleLabel}</span>
        <span> · {state.width}" × {state.height}"</span>
      </div>
    </div>
  )
}

/* ── App ─────────────────────────────────────────────────────────── */

export default function App() {
  const [cfg, setCfg] = useState<CfgState>({
    productType: 'front',
    style: 'single',
    width: 32,
    height: 80,
    frame: 'charcoal',
    glass: 'triple',
    doorGlass: 'sandblast',
    hardware: 'parallex',
    screen: 'retractable',
  })
  const update = (patch: Partial<CfgState>) => setCfg(s => ({ ...s, ...patch }))

  // const [ms1, setMs1] = useState(112)
  // const [ms2, setMs2] = useState(50)
  // const [ms3, setMs3] = useState(19)
  // const [ms4, setMs4] = useState(50)
  const ms1 = 112
  const ms2 = 50
  const ms3 = 19
  const ms4 = 50
  const [doorModel, setDoorModel] = useState('orleans')
  const [stepIdx, setStepIdx] = useState(0)
  const [isRotating, setIsRotating] = useState(false)
  const [currentUserColorSelected, setCurrentUserColorSelected] = useState<string | null>(null)
  const [currentUserGlassSelected, setCurrentUserGlassSelected] = useState<string | null>(null)

  // Snap to valid front-door sizes when switching product type
  useEffect(() => {
    if (cfg.productType !== 'front') return
    const validWidths = [32, 34, 36]
    const validHeights = [80, 95]
    const w = validWidths.includes(cfg.width) ? cfg.width : 36
    const h = validHeights.includes(cfg.height) ? cfg.height : 80
    if (w !== cfg.width || h !== cfg.height) update({ width: w, height: h })
  }, [cfg.productType])

  // Vog is not available in 32" — bump up to 34"
  useEffect(() => {
    if (doorModel === 'vog' && cfg.width === 32) update({ width: 34 })
  }, [doorModel])

  useEffect(() => {
    if (!isRotating) return
    const handleGlobalClick = () => setIsRotating(false)
    window.addEventListener('click', handleGlobalClick)
    return () => window.removeEventListener('click', handleGlobalClick)
  }, [isRotating])

  const price = computePrice(cfg)

  // const handleHorizontalScale = (value: number) => {
  //   setMs2(value)
  //   setMs4(value)
  // }

  const viewportRef = useRef<HTMLDivElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const controlsRef = useRef<any>(null);

  const handleLoaded = useCallback(() => {
    if (!cameraRef.current) return
    gsap.fromTo(cameraRef.current.position, { z: 90 }, { z: 30, duration: 1, ease: 'power2.out' })
  }, [])

  useEffect(() => {
    if (!cameraRef.current) return
    const targetZ = cfg.style.includes('transom') || cfg.height === 95 ? 42 : 30
    gsap.to(cameraRef.current.position, { z: targetZ, duration: 0.6, ease: 'power2.inOut' })
  }, [cfg.style, cfg.height])



  const toggleFullscreen = () => {
    if (!viewportRef.current) return
    if (!document.fullscreenElement) {
      viewportRef.current.requestFullscreen().catch(e => {
        console.error("Fullscreen error:", e)
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className="mw-app">
      <LoadingScreen onDismiss={handleLoaded} />

      {/* Nav */}
      <nav className="mw-nav">
        <div className="mw-nav__brand">
          <img src="/assets/images/logo.png" alt="Magic" className="mw-nav__logo" />
        </div>
        <div className="mw-nav__cta">
          <button className="mw-btn mw-btn--ghost">Save Configuration</button>
          <button className="mw-btn mw-btn--primary">Book a Quote</button>
        </div>
      </nav>

      {/* Configurator shell */}
      <div className="cfg">

        {/* Topbar */}
        <div className="cfg__topbar">
          <div className="cfg__chip">
            <a className="cfg__chip-ribbon" href="tel:8666792732">CALL US</a>
            <span>Free in-home consultation · 40-year warranty</span>
          </div>
          <div className="cfg__topbar-right">
            <div className="cfg__price">
              <div className="cfg__price-label">Estimated</div>
              <div className="cfg__price-amount">${price.toLocaleString()} <span>CAD</span></div>
            </div>
            <button className="mw-btn mw-btn--ghost cfg__details">Details</button>
          </div>
        </div>

        {/* Body grid: viewport | panel | step rail */}
        <div className="cfg__body">

          {/* Viewport */}
          <div
            className="cfg__viewport"
            ref={viewportRef}
          >
            <div
              className="cfg__background"
              style={{
                zIndex: 0,
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundImage: "url('/assets/images/interior-home.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'opacity 0.3s',
                opacity: 1
              }}
            ></div>
            {cfg.productType === 'front' ? (
              <Canvas shadows gl={{ alpha: true }}>
                <Suspense fallback={null}>
                  <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 30]} fov={60} />
                  <directionalLight position={[0, 5, 90]} intensity={1.5} />
                  {/* <directionalLight position={[0, 5, -90]} intensity={1.5} /> */}
                  <hemisphereLight args={['#e5ebf6', '#4e4f4e', 5]} />
                  {(() => {
                    const INCH = 12 / 32  // 0.375 Three.js units per inch
                    const doorW3d = cfg.width * INCH
                    const doorH3d = cfg.height * INCH
                    const model = DOOR_MODELS.find(m => m.id === doorModel) ?? DOOR_MODELS[0]
                    const panels = doorModel === 'orleans'
                      ? [{ y: 4.0, moldScale: ms1, moldScale2: ms2 }, { y: -7.5, moldScale: ms3, moldScale2: ms4 }]
                      : model.panels
                    const glassMat = currentUserGlassSelected ? DOOR_GLASS_MAT[currentUserGlassSelected] : undefined
                    const glassPanelRule = DOOR_GLASS_RULE[doorModel] ?? 'top'
                    const frameColor = currentUserColorSelected ?? model.color
                    return (
                      <>
                        <Rotator isRotating={isRotating}>
                          <FrameDoor color={frameColor} width={doorW3d} height={doorH3d} style={cfg.style} glassMat={glassMat} />
                          <Door color={frameColor} width={doorW3d} height={doorH3d} panels={panels} glassMat={glassMat} glassPanelRule={glassPanelRule} />
                        </Rotator>
                        <FrontWall doorWidth={doorW3d} doorHeight={doorH3d} style={cfg.style} visible={true} />
                      </>
                    )
                  })()}
                  <CeilLamp position={[0, 0, -5]} />
                  <Stats />
                  <ContactShadows position={[0, -(cfg.height * (12 / 32) / 2), 0]} scale={50} far={40} blur={1.5} opacity={0.75} resolution={512} color="#000000" />
                  <OrbitControls ref={controlsRef} makeDefault minPolarAngle={Math.PI * 0.5} maxPolarAngle={Math.PI * 0.5} minAzimuthAngle={Math.PI * -0.075} maxAzimuthAngle={Math.PI * 0.075} enableZoom={true} enablePan={true} minDistance={10} maxDistance={40} />
                  <PanClamper controlsRef={controlsRef} />
                </Suspense>
              </Canvas>
            ) : (
              <SVGViewport state={cfg} />
            )}
            {/* <div className="cfg__viewport-meta">
              <button className="cfg__viewport-chip">Show Interior</button>
              <button className="cfg__viewport-chip">Show Top View</button>
            </div> */}
            <div className="cfg__tools">
              <button
                title="Rotate"
                className={`cfg__tool ${isRotating ? 'is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsRotating(!isRotating)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 4v5h-5" />
                </svg>
              </button>
              <button title="Fullscreen" className="cfg__tool" onClick={toggleFullscreen}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Configuration panel */}
          <div className="cfg__panel">
            <div className="cfg__panel-inner">

              {/* Step 1 — Product Type */}
              {stepIdx === 0 && (
                <div className="cfg-step">
                  <StepHeader
                    title="What are we installing?"
                    sub="Pick a starting product — you can change this any time."
                  />
                  <SectionTitle>Select a product</SectionTitle>
                  <div className="cfg-grid cfg-grid--2col">
                    {PRODUCT_TYPES.map(t => (
                      <button
                        key={t.id}
                        className={`cfg-card${cfg.productType === t.id ? ' is-active' : ''}`}
                        onClick={() => update({ productType: t.id, style: STYLES[t.id][0].id })}
                      >
                        <div className="cfg-card__glyph" dangerouslySetInnerHTML={{ __html: t.glyph }} />
                        <div>
                          <div className="cfg-card__label">{t.label}</div>
                          <div className="cfg-card__sub">{t.sub}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="cfg-step__footer">
                    <button className="mw-btn mw-btn--primary" onClick={() => setStepIdx(1)}>Next</button>
                  </div>
                </div>
              )}

              {/* Step 2 — Select a Model */}
              {stepIdx === 1 && (
                <div className="cfg-step">
                  <StepHeader
                    title="Select a model"
                    sub={cfg.productType === 'front'
                      ? 'Choose the door design that suits your home.'
                      : `Model selection applies to Front Doors. Continue to configure your ${PRODUCT_TYPES.find(t => t.id === cfg.productType)?.label}.`}
                  />

                  {cfg.productType === 'front' ? (
                    <>
                      <div className="cfg-grid cfg-grid--2col">
                        {DOOR_MODELS.map(m => (
                          <button
                            key={m.id}
                            className={`cfg-card${doorModel === m.id ? ' is-active' : ''}`}
                            onClick={() => setDoorModel(m.id)}
                          >
                            <div
                              className="cfg-card__glyph"
                              style={{ background: m.color, borderRadius: 3 }}
                            />
                            <div>
                              <div className="cfg-card__label">{m.label}</div>
                              <div className="cfg-card__sub">{m.sub}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* {doorModel === 'orleans' && (
                        <>
                          <SectionTitle>Panel proportions (3D preview)</SectionTitle>
                          <div className="cfg-size">
                            <ScaleField label="Top Vertical" value={ms1} min={70} max={120} step={0.1} onChange={setMs1} />
                            <div className="cfg-size__by">×</div>
                            <ScaleField label="Top Horizontal" value={ms2} min={30} max={55} step={0.1} onChange={handleHorizontalScale} />
                          </div>
                          <div className="cfg-size">
                            <ScaleField label="Bottom Vertical" value={ms3} min={12} max={20} step={0.1} onChange={setMs3} />
                            <div className="cfg-size__by">×</div>
                            <ScaleField label="Bottom Horizontal" value={ms4} min={30} max={55} step={0.1} onChange={handleHorizontalScale} />
                          </div>
                        </>
                      )} */}
                    </>
                  ) : (
                    <div className="cfg-callout">
                      <p>Model selection is only available for <strong>Front Doors</strong>. Click <strong>Next</strong> to continue.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3 — Style & Opening */}
              {stepIdx === 2 && (
                <div className="cfg-step">
                  <StepHeader
                    title="Pick a style"
                    sub={`Available for ${PRODUCT_TYPES.find(t => t.id === cfg.productType)?.label}.`}
                  />
                  <div className="cfg-grid cfg-grid--3col">
                    {STYLES[cfg.productType].map(s => {
                      const lites = LITE_PATTERNS[cfg.productType]?.[s.id] ?? []
                      const thumb = `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="54" height="54" fill="#fff" stroke="#001B70" stroke-width="2"/><rect x="8" y="8" width="44" height="44" fill="#E8F1F8"/>${lites.map(l => `<line x1="${8 + (l[0] - 4) * 0.522}" y1="${8 + (l[1] - 4) * 0.522}" x2="${8 + (l[2] - 4) * 0.522}" y2="${8 + (l[3] - 4) * 0.522}" stroke="#001B70" stroke-width="${l[4] ?? 2}"/>`).join('')}</svg>`
                      return (
                        <OptionTile
                          key={s.id}
                          active={cfg.style === s.id}
                          label={s.label}
                          dimensions={s.sub}
                          thumb={thumb}
                          onClick={() => update({ style: s.id })}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 4 — Size */}
              {stepIdx === 3 && (
                <div className="cfg-step">
                  {cfg.productType === 'front' ? (
                    <>
                      <StepHeader
                        title="Door size"
                        sub="Standard sizes. Final measurements confirmed on-site."
                      />
                      <div className="cfg-pick">
                        <PickField
                          label="Width (inches)"
                          value={cfg.width}
                          onChange={v => update({ width: v })}
                          options={[
                            { value: 32, label: '32"', disabled: doorModel === 'vog' },
                            { value: 34, label: '34"' },
                            { value: 36, label: '36"' },
                          ]}
                        />
                        <PickField
                          label="Height (inches)"
                          value={cfg.height}
                          onChange={v => update({ height: v })}
                          options={[
                            { value: 80, label: '80"' },
                            { value: 95, label: '95"' },
                          ]}
                        />
                      </div>
                      {doorModel === 'vog' && (
                        <div className="cfg-callout">
                          <span className="mw-eyebrow">Note</span>
                          <p>The <strong>Vog</strong> model is only available in <strong>34"</strong> and <strong>36"</strong> widths.</p>
                        </div>
                      )}
                      <div className="cfg-help">
                        <SectionTitle>Visual size reference</SectionTitle>
                        <div className="cfg-help__row">
                          <div className="cfg-help__diagram">
                            <div className="cfg-help__win" style={{
                              width: Math.min(200, cfg.width * 2),
                              height: Math.min(240, cfg.height * 1.6),
                            }}>
                              <span className="cfg-help__dim cfg-help__dim--w">{cfg.width}"</span>
                              <span className="cfg-help__dim cfg-help__dim--h">{cfg.height}"</span>
                            </div>
                          </div>
                          <div className="cfg-help__text">
                            <p><strong>Available widths:</strong> 32" · 34" · 36"</p>
                            <p><strong>Available heights:</strong> 80" · 95"</p>
                            <p>Custom sizes outside this range available on request during consultation.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <StepHeader
                        title="Rough opening"
                        sub="Width × height in inches. Final measurements taken on-site."
                      />
                      <div className="cfg-size">
                        <SizeField label="Width" value={cfg.width} min={18} max={96} step={2} onChange={v => update({ width: v })} />
                        <div className="cfg-size__by">by</div>
                        <SizeField label="Height" value={cfg.height} min={24} max={120} step={2} onChange={v => update({ height: v })} />
                      </div>
                      <div className="cfg-help">
                        <SectionTitle>Visual size reference</SectionTitle>
                        <div className="cfg-help__row">
                          <div className="cfg-help__diagram">
                            <div className="cfg-help__win" style={{
                              width: Math.min(200, cfg.width * 2),
                              height: Math.min(240, cfg.height * 1.6),
                            }}>
                              <span className="cfg-help__dim cfg-help__dim--w">{cfg.width}"</span>
                              <span className="cfg-help__dim cfg-help__dim--h">{cfg.height}"</span>
                            </div>
                          </div>
                          <div className="cfg-help__text">
                            <p><strong>Minimum:</strong> 18" × 24"</p>
                            <p><strong>Maximum:</strong> 96" × 120"</p>
                            <p>Custom sizes available outside this range — request during consultation.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 5 — Frame Colour */}
              {stepIdx === 4 && (
                <div className="cfg-step">
                  <StepHeader
                    title="Frame finish"
                    sub="Inside and outside finishes can be matched or contrasted during consultation."
                  />
                  <div className="cfg-grid cfg-grid--6col">
                    {Object.entries(FRAME_SWATCHES).map(([id, hex]) => (
                      <OptionTile
                        key={id}
                        active={cfg.frame === id}
                        label={id[0].toUpperCase() + id.slice(1)}
                        swatch={hex}
                        onClick={() => { update({ frame: id }); setCurrentUserColorSelected(hex) }}
                      />
                    ))}
                  </div>
                  <div className="cfg-callout">
                    <span className="mw-eyebrow">Note</span>
                    <p>Magic frames are 50% stronger than vinyl thanks to our <strong>Hybrid Fusion</strong> construction. All finishes come with a 40-year parts &amp; labour warranty.</p>
                  </div>
                </div>
              )}

              {/* Step 6 — Glass */}
              {stepIdx === 5 && (
                <div className="cfg-step">
                  {cfg.productType === 'front' ? (
                    <>
                      <StepHeader
                        title="Choose your glass"
                        sub="Select a decorative glass style for your door panels, side lites, and transom."
                      />
                      {(['Textured Glass', 'Skillscreen', 'Stained Glass'] as const).map(cat => (
                        <div key={cat}>
                          <SectionTitle>{cat}</SectionTitle>
                          <div className="cfg-grid cfg-grid--4col" style={{ marginBottom: '0.5rem' }}>
                            {DOOR_GLASS.filter(g => g.category === cat).map(g => (
                              <button
                                key={g.id}
                                className={`cfg-tile${cfg.doorGlass === g.id ? ' is-active' : ''}`}
                                onClick={() => { update({ doorGlass: g.id }); setCurrentUserGlassSelected(g.id) }}
                                style={{ padding: '0.5rem' }}
                              >
                                <div style={{
                                  width: '100%',
                                  aspectRatio: '1',
                                  background: g.swatch,
                                  borderRadius: 4,
                                  border: '1px solid rgba(0,0,0,0.12)',
                                  marginBottom: '0.4rem',
                                }} />
                                <div className="cfg-tile__label" style={{ fontSize: '0.7rem', textAlign: 'center' }}>{g.label}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      <StepHeader
                        title="Choose your glass package"
                        sub="More argon, more layers, lower energy bills."
                      />
                      <div className="cfg-list">
                        {GLASS_PACKAGES.map(g => (
                          <button
                            key={g.id}
                            className={`cfg-row${cfg.glass === g.id ? ' is-active' : ''}`}
                            onClick={() => update({ glass: g.id })}
                          >
                            <div className="cfg-row__check" />
                            <div className="cfg-row__main">
                              <div className="cfg-row__label">{g.label}</div>
                              <div className="cfg-row__sub">{g.sub}</div>
                            </div>
                            <div className="cfg-row__price">
                              {g.price === 0 ? 'Included' : `+ $${g.price} CAD`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 7 — Hardware */}
              {stepIdx === 6 && (
                <div className="cfg-step">
                  <StepHeader title="Hardware" sub="Operation and lock mechanism." />
                  <div className="cfg-list">
                    {HARDWARE.map(h => (
                      <button
                        key={h.id}
                        className={`cfg-row${cfg.hardware === h.id ? ' is-active' : ''}`}
                        onClick={() => update({ hardware: h.id })}
                      >
                        <div className="cfg-row__check" />
                        <div className="cfg-row__main">
                          <div className="cfg-row__label">{h.label}</div>
                          <div className="cfg-row__sub">{h.sub}</div>
                        </div>
                        <div className="cfg-row__price">
                          {h.price === 0 ? 'Included' : h.price > 0 ? `+ $${h.price}` : `– $${Math.abs(h.price)}`}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="cfg-callout">
                    <span className="mw-eyebrow">Parallex® hardware</span>
                    <p>Cranks are mechanically flawed. They strip, loosen and break over time. Our patented Parallex® hardware eliminates the crank with a simple push-out mechanism. <strong>No cranks, no problems.</strong></p>
                  </div>
                </div>
              )}

              {/* Step 8 — Screens & Extras */}
              {stepIdx === 7 && (
                <div className="cfg-step">
                  <StepHeader
                    title="Screen system"
                    sub="The retractable bug screen rolls out of sight when you don't need it."
                  />
                  <div className="cfg-list">
                    {SCREENS.map(s => (
                      <button
                        key={s.id}
                        className={`cfg-row${cfg.screen === s.id ? ' is-active' : ''}`}
                        onClick={() => update({ screen: s.id })}
                      >
                        <div className="cfg-row__check" />
                        <div className="cfg-row__main">
                          <div className="cfg-row__label">{s.label}</div>
                          <div className="cfg-row__sub">{s.sub}</div>
                        </div>
                        <div className="cfg-row__price">
                          {s.price === 0 ? 'Included' : s.price > 0 ? `+ $${s.price}` : `– $${Math.abs(s.price)}`}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 9 — Review & Quote */}
              {stepIdx === 8 && (
                <div className="cfg-step">
                  <StepHeader
                    title="Your configuration"
                    sub="Review the details. A Magic specialist will confirm everything during your in-home consultation."
                  />
                  <div className="cfg-summary">
                    {([
                      ['Product', PRODUCT_TYPES.find(t => t.id === cfg.productType)?.label ?? ''],
                      ['Style', STYLES[cfg.productType]?.find(s => s.id === cfg.style)?.label ?? ''],
                      ['Size', `${cfg.width}" × ${cfg.height}"`],
                      ['Frame', cfg.frame[0].toUpperCase() + cfg.frame.slice(1)],
                      ['Glass', cfg.productType === 'front'
                        ? (DOOR_GLASS.find(g => g.id === cfg.doorGlass)?.label ?? '')
                        : (GLASS_PACKAGES.find(g => g.id === cfg.glass)?.label ?? '')],
                      ['Hardware', HARDWARE.find(h => h.id === cfg.hardware)?.label ?? ''],
                      ['Screen', SCREENS.find(s => s.id === cfg.screen)?.label ?? ''],
                    ] as [string, string][]).map(([k, v]) => (
                      <div className="cfg-summary__row" key={k}>
                        <div className="cfg-summary__k">{k}</div>
                        <div className="cfg-summary__v">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="cfg-callout cfg-callout--final">
                    <span className="mw-eyebrow">What happens next</span>
                    <p>Click <strong>Book a Quote</strong> below and we'll contact you within one business day to schedule a free in-home consultation. Final pricing and exact measurements are confirmed on-site — no obligation.</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Step rail */}
          <aside className="cfg-steps">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                className={[
                  'cfg-steps__item',
                  i === stepIdx ? 'is-active' : '',
                  i < stepIdx ? 'is-done' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => setStepIdx(i)}
              >
                <div className="cfg-steps__glyph" dangerouslySetInnerHTML={{ __html: s.glyph }} />
                <div className="cfg-steps__label">{s.label}</div>
              </button>
            ))}
          </aside>

        </div>

        {/* Footer */}
        <div className="cfg__footer">
          <button
            className="mw-btn mw-btn--tertiary cfg__back"
            onClick={() => setStepIdx(v => Math.max(0, v - 1))}
            disabled={stepIdx === 0}
          >
            ← Back
          </button>
          <div className="cfg__progress">
            Step {stepIdx + 1} of {STEPS.length} · {STEPS[stepIdx].label.replace('\n', ' ')}
          </div>
          <button className="mw-btn mw-btn--ghost">Save Configuration</button>
          {stepIdx < STEPS.length - 1 ? (
            <button className="mw-btn mw-btn--primary" onClick={() => setStepIdx(v => v + 1)}>
              Next: {STEPS[stepIdx + 1].label.replace('\n', ' ')} →
            </button>
          ) : (
            <button className="mw-btn mw-btn--primary">Book a Quote</button>
          )}
        </div>

      </div>
    </div>
  )
}
