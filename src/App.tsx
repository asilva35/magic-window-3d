import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei'
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

  useEffect(() => {
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        mesh.material = new THREE.MeshStandardMaterial({
          color: color,
          metalness: 0.1,
          roughness: 0.3,
        })
      }
    })
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
      <Moulding color={color} moldScale={moldScale} onTipZ={setVTip} position={[-hTip, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
      <Moulding color={color} moldScale={moldScale} position={[hTip, 0, 0.1]} rotation={[Math.PI / 2, Math.PI, 0.1]} />
      <Moulding color={color} moldScale={moldScale2} onTipZ={setHTip} position={[0, -hSideY, 0.1]} rotation={[Math.PI / 2, Math.PI / 2, 0.1]} />
      <Moulding color={color} moldScale={moldScale2} position={[0, hSideY, 0.1]} rotation={[Math.PI / 2, -Math.PI / 2, 0.1]} />
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
  const DOOR_W = 12 // Equivalent to a 32 Inches
  const DOOR_H = 30 // Equivalent to a 80 Inches
  const DOOR_D = 0.25
  const PANEL_Z = DOOR_D / 2 - 0.1
  const mc = mouldingColor ?? color

  return (
    <group {...props}>
      <mesh visible={true}>
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
          scale={[0.4, 0.4, 1]}
        />
      ))}

      <DoorHandler position={[-5.1, 0, PANEL_Z]} rotation={[0, 0, 0]} />
    </group>
  )
}

function FrameDoor({ color = '#2c2c2c', width = 12, height = 30, ...props }: {
  color?: string
  width?: number
  height?: number
  [key: string]: any
}) {
  const FRAME_THICKNESS = 0.5
  const FRAME_DEPTH = 3

  return (
    <group {...props}>
      {/* Left jamb */}
      <mesh position={[-(width / 2 + FRAME_THICKNESS / 2), 0, 0]}>
        <boxGeometry args={[FRAME_THICKNESS, height, FRAME_DEPTH]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[(width / 2 + FRAME_THICKNESS / 2), 0, 0]}>
        <boxGeometry args={[FRAME_THICKNESS, height, FRAME_DEPTH]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Top header */}
      <mesh position={[0, height / 2 + FRAME_THICKNESS / 2, 0]}>
        <boxGeometry args={[width + FRAME_THICKNESS * 2, FRAME_THICKNESS, FRAME_DEPTH]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  )
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

/* ── Types ──────────────────────────────────────────────────────── */

type CfgState = {
  productType: string
  style: string
  width: number
  height: number
  frame: string
  glass: string
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
    width: 36,
    height: 80,
    frame: 'charcoal',
    glass: 'triple',
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

  const handleLoaded = useCallback(() => {
    if (!cameraRef.current) return
    gsap.fromTo(cameraRef.current.position, { z: 90 }, { z: 30, duration: 1, ease: 'power2.out' })
  }, [])

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
          <div className="cfg__viewport" ref={viewportRef}>
            {cfg.productType === 'front' ? (
              <Canvas shadows>
                <Suspense fallback={null}>
                  <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 30]} fov={60} />
                  <directionalLight position={[0, 5, 90]} intensity={1.5} />
                  <directionalLight position={[0, 5, -90]} intensity={1.5} />
                  {(() => {
                    const model = DOOR_MODELS.find(m => m.id === doorModel) ?? DOOR_MODELS[0]
                    const panels = doorModel === 'orleans'
                      ? [{ y: 4.0, moldScale: ms1, moldScale2: ms2 }, { y: -7.5, moldScale: ms3, moldScale2: ms4 }]
                      : model.panels
                    return (
                      <Rotator isRotating={isRotating}>
                        <FrameDoor color={currentUserColorSelected ?? model.color} width={12} height={30} />
                        <Door color={currentUserColorSelected ?? model.color} panels={panels} />
                      </Rotator>
                    )
                  })()}
                  <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} enableZoom={false} />
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

              {/* Step 6 — Glass Package */}
              {stepIdx === 5 && (
                <div className="cfg-step">
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
                      ['Glass', GLASS_PACKAGES.find(g => g.id === cfg.glass)?.label ?? ''],
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
