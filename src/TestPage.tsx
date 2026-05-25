import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { GlbDoorSlab } from './components/GlbDoorSlab'
import { SteelMesh } from './components/SteelMesh'
import { Suspense } from 'react'

useGLTF.preload('/assets/models/vog-door.glb')

// ─── Door slab dimensions ────────────────────────────────────────────────────
const DOOR_W = 12       // slab width
const DOOR_H = 30       // slab height
const DOOR_D = 0.25     // slab thickness (depth in Z)

// ─── Jamb (Leg / Head) ───────────────────────────────────────────────────────
// The jamb is the structural lining that wraps the interior of the rough wall
// opening. The two vertical pieces are called "legs" (or side jambs); the
// horizontal top piece is the "head jamb". Together they form the load-bearing
// box that the door slab hangs inside.
const JAMB_W = 1.5  // face width visible from the front
const JAMB_DEPTH = 1.5  // depth into the wall — equal to wall thickness

// ─── Stop ────────────────────────────────────────────────────────────────────
// A thin rebate (strip) nailed or routed into the face of each jamb. The door
// slab presses against the stop when closed, limiting its travel and providing
// a weather / air seal. Side stops run the full door height; the head stop
// spans the full opening width between the side stops.
const STOP_W = 0.4   // protrudes inward into the opening
const STOP_THICKNESS = 0.4   // depth (Z) of the stop
// Z position: the stop sits just behind where the door slab face would be
const STOP_Z = (DOOR_D / 2 + STOP_THICKNESS / 2)

// ─── Architrave (Casing) ─────────────────────────────────────────────────────
// Purely decorative trim applied flat on the wall face, on both sides of the
// frame. It covers the joint between the jamb edge and the plasterboard/wall
// finish. The "reveal" is the intentional gap left between the inner edge of
// the architrave and the door opening — it exposes a thin strip of jamb face
// and gives the installation a clean, shadow-line look.
const ARCH_W = 2.5   // face width of the casing
const ARCH_THICKNESS = 0.35  // how far it stands proud of the wall face
const ARCH_REVEAL = 0.3   // setback from door-opening edge to casing inner edge
const ARCH_Z = ARCH_THICKNESS / 2  // centered proud of jamb front face (Z=0)

// ─── Threshold / Sill ────────────────────────────────────────────────────────
// The bottom horizontal member that sits in the opening at floor level.
// On exterior doors it provides weather-sealing and bridging over the
// subfloor gap; on interior doors it is often flush or absent.
const THRESH_H = 1.2
const THRESH_DEPTH = JAMB_DEPTH

const COLOR = '#4e4d4d'

// Door slab — the panel that swings open and closed
function DoorModel() {
  return (
    <GlbDoorSlab path="/assets/models/vog-door.glb" color={COLOR} width={DOOR_W} height={DOOR_H} />
  )
}

function DoorFrame() {
  const hw = DOOR_W / 2   // half door width
  const hh = DOOR_H / 2   // half door height

  return (
    <group>

      {/* ── JAMBS (structural lining of the wall opening) ─────────────────── */}

      {/* Left leg jamb — vertical, outer-left side of the opening */}
      <group position={[-(hw + JAMB_W / 2), 0, JAMB_DEPTH / 2]}>
        <SteelMesh args={[JAMB_W, DOOR_H, JAMB_DEPTH]} color={COLOR} />
      </group>

      {/* Right leg jamb — vertical, outer-right side of the opening */}
      <group position={[hw + JAMB_W / 2, 0, JAMB_DEPTH / 2]}>
        <SteelMesh args={[JAMB_W, DOOR_H, JAMB_DEPTH]} color={COLOR} />
      </group>

      {/* Head jamb — horizontal, sits on top of the two leg jambs */}
      <group position={[0, hh + JAMB_W / 2, JAMB_DEPTH / 2]}>
        <SteelMesh args={[DOOR_W + JAMB_W * 2, JAMB_W, JAMB_DEPTH]} color={COLOR} />
      </group>

      {/* ── STOPS (rebate that the door slab closes against) ──────────────── */}

      {/* Left stop — protrudes from inner face of left leg jamb into the opening */}
      <group position={[-(hw - STOP_W / 2), 0, STOP_Z]}>
        <SteelMesh args={[STOP_W, DOOR_H, STOP_THICKNESS]} color={COLOR} />
      </group>

      {/* Right stop — protrudes from inner face of right leg jamb */}
      <group position={[hw - STOP_W / 2, 0, STOP_Z]}>
        <SteelMesh args={[STOP_W, DOOR_H, STOP_THICKNESS]} color={COLOR} />
      </group>

      {/* Head stop — protrudes down from inner face of head jamb,
          spans the opening width between the two side stops */}
      <group position={[0, hh - STOP_W / 2, STOP_Z]}>
        <SteelMesh args={[DOOR_W, STOP_W, STOP_THICKNESS]} color={COLOR} />
      </group>

      {/* ── THRESHOLD / SILL ──────────────────────────────────────────────── */}

      {/* Threshold — sits at floor level across the bottom of the opening.
          Spans only the door width (legs sit beside it, not on top). */}
      <group position={[0, -(hh + THRESH_H / 2), THRESH_DEPTH / 2]}>
        <SteelMesh args={[DOOR_W + JAMB_W * 2, THRESH_H, THRESH_DEPTH]} color={COLOR} />
      </group>

    </group>
  )
}

export default function TestPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
      <Canvas shadows gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 55]} fov={50} />
          {/* <ambientLight intensity={10.7} /> */}
          {/* <directionalLight position={[0, 5, 90]} intensity={1.5} /> */}
          {/* <hemisphereLight args={['#e5ebf6', '#4e4f4e', 50]} /> */}
          {/* <pointLight position={[5, 14, 10.5]} intensity={100} color={'#ffff00'} /> */}
          <DoorModel />
          <DoorFrame />
          <Environment files="/assets/hdr/sundowner_overlook_1k.hdr" environmentIntensity={4} />
          <OrbitControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
