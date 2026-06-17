import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, MeshBasicMaterial, Mesh, NoColorSpace, MeshPhysicalMaterial } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useState, useEffect, useRef } from 'react'
import { DoorHandle } from './components/DoorHandle'
import { useControls, Leva, button, folder } from 'leva'
import type { MaterialPreset } from './data/doorPresets'
import { DEFAULT_PRESETS } from './data/doorPresets'

const DEBUG = true

useGLTF.preload('/assets/models/uno-door-80x32-no-glass.glb')

const HDR_OPTIONS = {
    'Passendorf Snow': '/assets/hdr/passendorf_snow_1k.hdr',
    'Snowy Park': '/assets/hdr/snowy_park_01_1k.hdr',
    'Horn Koppe Snow': '/assets/hdr/horn-koppe_snow_1k.hdr',
    'Snowy Field': '/assets/hdr/snowy_field_1k.hdr',
    'Birchwood': '/assets/hdr/birchwood_1k.hdr',
    //'Debris Basement Corridor': '/assets/hdr/debris_basement_corridor_1k.hdr',
    'Snowy Forest Path': '/assets/hdr/snowy_forest_path_01_1k.hdr',
    'Stierberg Sunrise': '/assets/hdr/stierberg_sunrise_1k.hdr',
    'Furstenstein Castle': '/assets/hdr/furstenstein_1k.hdr',
    'Suburban Garden': '/assets/hdr/suburban_garden_1k.hdr',
    'Braustuble Alley': '/assets/hdr/braustuble_alley_1k.hdr',
    //'Church Meeting Room': '/assets/hdr/church_meeting_room_1k.hdr',
    'Citrus Orchard Road': '/assets/hdr/citrus_orchard_road_puresky_1k.hdr',
    //'Empty Warehouse': '/assets/hdr/empty_warehouse_01_2k.hdr',
    //'Glasshouse Interior': '/assets/hdr/glasshouse_interior_1k.hdr',
    'Goegap Road': '/assets/hdr/goegap_road_1k.hdr',
    'Kloofendal Cloudy': '/assets/hdr/kloofendal_48d_partly_cloudy_puresky_1k.hdr',
    'Meadow': '/assets/hdr/meadow_1k.hdr',
    'Qwantani Dusk': '/assets/hdr/qwantani_dusk_2_puresky_1k.hdr',
    'Sundowner Overlook': '/assets/hdr/sundowner_overlook_1k.hdr',
}

// ─── Door size & glass types ───────────────────────────────────────────────────

type DoorHeight = '80' | '95'
type DoorWidth = '32' | '34' | '36'

type GlassConfig =
    | 'no-glass'
    | '20x64'
    | '22x64'
    | '22x17-3x'
    | '22x12-4x'
    | '12x12-4x'
    | '7x64-right'
    | '7x64-left'
    | '20x80'
    | '22x80'
    | '22x14-7-16-4x'
    | '22x9-5x'

const GLASS_CONFIG_LABELS: Record<GlassConfig, string> = {
    'no-glass': 'No Glass',
    '20x64': '20" × 64"',
    '22x64': '22" × 64"',
    '22x17-3x': '22" × 17" (3×)',
    '22x12-4x': '22" × 12" (4×)',
    '12x12-4x': '12" × 12" (4×)',
    '7x64-right': '7" × 64" Right',
    '7x64-left': '7" × 64" Left',
    '20x80': '20" × 80"',
    '22x80': '22" × 80"',
    '22x14-7-16-4x': '22" × 14 7/16" (4×)',
    '22x9-5x': '22" × 9" (5×)',
}

// ─── Asset map ────────────────────────────────────────────────────────────────

type DoorAssets = { glb: string; aoMap: string | null; lightMap: string | null, normalMap: string | null, roughnessMap: string | null, diffuseMap: string | null }

const DEFAULT_DOOR_ASSETS: DoorAssets = {
    glb: '/assets/models/uno-door-80x32-no-glass.glb',
    aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png',
    lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png',
    normalMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Normal.png',
    roughnessMap: '/assets/textures/doors/uno/uno-80x32-no-glass-ROU.png',
    diffuseMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Diffuse.png',
}

// Key format: "{height}-{width}-{glass}"
const DOOR_ASSETS: Partial<Record<string, DoorAssets>> = {
    '80-32-no-glass': { glb: '/assets/models/uno-door-80x32-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Diffuse.png' },
    '80-34-no-glass': { glb: '/assets/models/uno-door-80x34-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-no-glass-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-no-glass-Diffuse.png' },
    '80-36-no-glass': { glb: '/assets/models/uno-door-80x36-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-no-glass-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-no-glass-Diffuse.png' },
    '80-32-20x64': { glb: '/assets/models/uno-door-80x32-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-20x64-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-20x64-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-20x64-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-20x64-Diffuse.png' },
    '80-34-20x64': { glb: '/assets/models/uno-door-80x34-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-20x64-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-20x64-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-20x64-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-20x64-Diffuse.png' },
    '80-36-20x64': { glb: '/assets/models/uno-door-80x36-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-20x64-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-20x64-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-20x64-Diffuse.png' },
    '80-32-22x64': { glb: '/assets/models/uno-door-80x32-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-22x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-22x64-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-22x64-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-22x64-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-22x64-Diffuse.png' },
    '80-34-22x64': { glb: '/assets/models/uno-door-80x34-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-22x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-22x64-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-22x64-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-22x64-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-22x64-Diffuse.png' },
    '80-36-22x64': { glb: '/assets/models/uno-door-80x36-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-22x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-22x64-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-22x64-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-22x64-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-22x64-Diffuse.png' },
    '80-32-22x17-3x': { glb: '/assets/models/uno-door-80x32-22x17-3x.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-22x17-3x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-22x17-3x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-22x17-3x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-22x17-3x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-22x17-3x-Diffuse.png' },
    '80-34-22x17-3x': { glb: '/assets/models/uno-door-80x34-22x17-3x.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-22x17-3x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-22x17-3x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-22x17-3x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-22x17-3x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-22x17-3x-Diffuse.png' },
    '80-36-22x17-3x': { glb: '/assets/models/uno-door-80x36-22x17-3x.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-22x17-3x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-22x17-3x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-22x17-3x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-22x17-3x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-22x17-3x-Diffuse.png' },
    '80-32-22x12-4x': { glb: '/assets/models/uno-door-80x32-22x12-4x.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-22x12-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-22x12-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-22x12-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-22x12-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-22x12-4x-Diffuse.png' },
    '80-34-22x12-4x': { glb: '/assets/models/uno-door-80x34-22x12-4x.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-22x12-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-22x12-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-22x12-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-22x12-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-22x12-4x-Diffuse.png' },
    '80-36-22x12-4x': { glb: '/assets/models/uno-door-80x36-22x12-4x.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-22x12-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-22x12-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-22x12-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-22x12-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-22x12-4x-Diffuse.png' },
    '80-32-12x12-4x': { glb: '/assets/models/uno-door-80x32-12x12-4x.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-12x12-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-12x12-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-12x12-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-12x12-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-12x12-4x-Diffuse.png' },
    '80-34-12x12-4x': { glb: '/assets/models/uno-door-80x34-12x12-4x.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-12x12-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-12x12-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-12x12-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-12x12-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-12x12-4x-Diffuse.png' },
    '80-36-12x12-4x': { glb: '/assets/models/uno-door-80x36-12x12-4x.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-12x12-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-12x12-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-12x12-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-12x12-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-12x12-4x-Diffuse.png' },
    '80-32-7x64-right': { glb: '/assets/models/uno-door-80x32-7x64-right.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-7x64-right-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-7x64-right-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-7x64-right-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-7x64-right-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-7x64-right-Diffuse.png' },
    '80-34-7x64-right': { glb: '/assets/models/uno-door-80x34-7x64-right.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-7x64-right-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-7x64-right-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-7x64-right-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-7x64-right-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-7x64-right-Diffuse.png' },
    '80-36-7x64-right': { glb: '/assets/models/uno-door-80x36-7x64-right.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-7x64-right-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-7x64-right-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-7x64-right-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-7x64-right-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-7x64-right-Diffuse.png' },
    '80-32-7x64-left': { glb: '/assets/models/uno-door-80x32-7x64-left.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-7x64-left-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-7x64-left-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x32-7x64-left-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x32-7x64-left-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x32-7x64-left-Diffuse.png' },
    '80-34-7x64-left': { glb: '/assets/models/uno-door-80x34-7x64-left.glb', aoMap: '/assets/textures/doors/uno/uno-80x34-7x64-left-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x34-7x64-left-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x34-7x64-left-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x34-7x64-left-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x34-7x64-left-Diffuse.png' },
    '80-36-7x64-left': { glb: '/assets/models/uno-door-80x36-7x64-left.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-7x64-left-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-7x64-left-Light.png', normalMap: '/assets/textures/doors/uno/uno-80x36-7x64-left-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-80x36-7x64-left-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-80x36-7x64-left-Diffuse.png' },
    '95-32-no-glass': { glb: '/assets/models/uno-door-95x32-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-95x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x32-no-glass-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x32-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x32-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x32-no-glass-Diffuse.png' },
    '95-34-no-glass': { glb: '/assets/models/uno-door-95x34-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-95x34-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x34-no-glass-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x34-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x34-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x34-no-glass-Diffuse.png' },
    '95-36-no-glass': { glb: '/assets/models/uno-door-95x36-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-95x36-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x36-no-glass-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x36-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x36-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x36-no-glass-Diffuse.png' },
    '95-32-20x80': { glb: '/assets/models/uno-door-95x32-20x80.glb', aoMap: '/assets/textures/doors/uno/uno-95x32-20x80-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x32-20x80-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x32-20x80-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x32-20x80-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x32-20x80-Diffuse.png' },
    '95-34-20x80': { glb: '/assets/models/uno-door-95x34-20x80.glb', aoMap: '/assets/textures/doors/uno/uno-95x34-20x80-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x34-20x80-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x34-20x80-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x34-20x80-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x34-20x80-Diffuse.png' },
    '95-36-20x80': { glb: '/assets/models/uno-door-95x36-20x80.glb', aoMap: '/assets/textures/doors/uno/uno-95x36-20x80-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x36-20x80-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x36-20x80-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x36-20x80-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x36-20x80-Diffuse.png' },
    '95-32-22x80': { glb: '/assets/models/uno-door-95x32-22x80.glb', aoMap: '/assets/textures/doors/uno/uno-95x32-22x80-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x32-22x80-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x32-22x80-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x32-22x80-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x32-22x80-Diffuse.png' },
    '95-34-22x80': { glb: '/assets/models/uno-door-95x34-22x80.glb', aoMap: '/assets/textures/doors/uno/uno-95x34-22x80-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x34-22x80-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x34-22x80-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x34-22x80-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x34-22x80-Diffuse.png' },
    '95-36-22x80': { glb: '/assets/models/uno-door-95x36-22x80.glb', aoMap: '/assets/textures/doors/uno/uno-95x36-22x80-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x36-22x80-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x36-22x80-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x36-22x80-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x36-22x80-Diffuse.png' },
    '95-32-22x14-7-16-4x': { glb: '/assets/models/uno-door-95x32-22x14-7-16-4x.glb', aoMap: '/assets/textures/doors/uno/uno-95x32-22x14-7-16-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x32-22x14-7-16-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x32-22x14-7-16-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x32-22x14-7-16-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x32-22x14-7-16-4x-Diffuse.png' },
    '95-34-22x14-7-16-4x': { glb: '/assets/models/uno-door-95x34-22x14-7-16-4x.glb', aoMap: '/assets/textures/doors/uno/uno-95x34-22x14-7-16-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x34-22x14-7-16-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x34-22x14-7-16-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x34-22x14-7-16-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x34-22x14-7-16-4x-Diffuse.png' },
    '95-36-22x14-7-16-4x': { glb: '/assets/models/uno-door-95x36-22x14-7-16-4x.glb', aoMap: '/assets/textures/doors/uno/uno-95x36-22x14-7-16-4x-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x36-22x14-7-16-4x-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x36-22x14-7-16-4x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x36-22x14-7-16-4x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x36-22x14-7-16-4x-Diffuse.png' },
    '95-32-22x9-5x': { glb: '/assets/models/uno-door-95x32-22x9-5x.glb', aoMap: '/assets/textures/doors/uno/uno-95x32-22x9-5x-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x32-22x9-5x-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x32-22x9-5x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x32-22x9-5x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x32-22x9-5x-Diffuse.png' },
    '95-34-22x9-5x': { glb: '/assets/models/uno-door-95x34-22x9-5x.glb', aoMap: '/assets/textures/doors/uno/uno-95x34-22x9-5x-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x34-22x9-5x-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x34-22x9-5x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x34-22x9-5x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x34-22x9-5x-Diffuse.png' },
    '95-36-22x9-5x': { glb: '/assets/models/uno-door-95x36-22x9-5x.glb', aoMap: '/assets/textures/doors/uno/uno-95x36-22x9-5x-AO.png', lightMap: '/assets/textures/doors/uno/uno-95x36-22x9-5x-Light.png', normalMap: '/assets/textures/doors/uno/uno-95x36-22x9-5x-Normal.png', roughnessMap: '/assets/textures/doors/uno/uno-95x36-22x9-5x-ROU.png', diffuseMap: '/assets/textures/doors/uno/uno-95x36-22x9-5x-Diffuse.png' },
}

function getDoorAssets(height: DoorHeight, width: DoorWidth, glass: GlassConfig): DoorAssets {
    return DOOR_ASSETS[`${height}-${width}-${glass}`] ?? DEFAULT_DOOR_ASSETS
}

// ─── Material preset ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'uno-door-presets'

function loadCustomPresets(): Record<string, MaterialPreset> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

// ─── 3D component ─────────────────────────────────────────────────────────────

function UnoDoor({
    doorHeight, doorWidth, glassConfig, onReady,
    slab, mold = slab, stopJam, sealTop, sealBot, glass,
}: MaterialPreset & { doorHeight: DoorHeight; doorWidth: DoorWidth; glassConfig: GlassConfig; onReady?: () => void }) {
    const assets = getDoorAssets(doorHeight, doorWidth, glassConfig)

    useEffect(() => { onReady?.() }, [])

    const { scene } = useGLTF(assets.glb)
    const aoMapPath = assets.aoMap ?? DEFAULT_DOOR_ASSETS.aoMap!
    const lightMapPath = assets.lightMap ?? DEFAULT_DOOR_ASSETS.lightMap!
    const normalMapPath = assets.normalMap ?? DEFAULT_DOOR_ASSETS.normalMap!
    const roughnessMapPath = assets.roughnessMap ?? DEFAULT_DOOR_ASSETS.roughnessMap!
    const diffuseMapPath = assets.diffuseMap ?? DEFAULT_DOOR_ASSETS.diffuseMap!
    const aoMap = useTexture(aoMapPath, (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    })
    const aoMapLight = useTexture(lightMapPath, (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    })

    const normalMap = useTexture(normalMapPath, (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    });

    const roughnessMap = useTexture(roughnessMapPath, (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    });

    const diffuseMap = useTexture(diffuseMapPath, (t) => {
        t.colorSpace = NoColorSpace
        t.channel = 0
        t.flipY = false
    });

    const clone = useMemo(() => scene.clone(true), [scene])

    const slabMaterial = useMemo(() => new MeshStandardMaterial({ color: slab.color, metalness: slab.metalness, roughness: slab.roughness }), [slab.color, slab.metalness, slab.roughness])
    const moldMaterial = useMemo(() => new MeshStandardMaterial({ color: mold.color, metalness: mold.metalness, roughness: mold.roughness }), [mold.color, mold.metalness, mold.roughness])
    const stopJamMaterial = useMemo(() => new MeshStandardMaterial({ color: stopJam.color, metalness: stopJam.metalness, roughness: stopJam.roughness }), [stopJam.color, stopJam.metalness, stopJam.roughness])
    const sealTopMaterial = useMemo(() => new MeshStandardMaterial({ color: sealTop.color, metalness: sealTop.metalness, roughness: sealTop.roughness }), [sealTop.color, sealTop.metalness, sealTop.roughness])
    const sealBotMaterial = useMemo(() => new MeshStandardMaterial({ color: sealBot.color, metalness: sealBot.metalness, roughness: sealBot.roughness }), [sealBot.color, sealBot.metalness, sealBot.roughness])
    const glassMaterial = useMemo(() => new MeshPhysicalMaterial({
        color: glass.color,
        roughness: glass.roughness,
        metalness: glass.metalness,
        transmission: glass.transmission,
        thickness: glass.thickness,
        ior: 1.5,
        transparent: true,
        opacity: glass.opacity,
        envMapIntensity: 1,
    }), [glass.color, glass.roughness, glass.metalness, glass.transmission, glass.thickness, glass.opacity])
    const rubberMaterial = useMemo(() => new MeshBasicMaterial({ color: slab.color }), [slab.color])

    useMemo(() => {
        clone.traverse((child) => {
            if (!(child as Mesh).isMesh) return
            const mesh = child as Mesh
            const name = mesh.name
            let applyAOMap = false
            let applyLightMap = false;
            let mapAoIntensity = 0.5;

            if (name.includes('slab')) {
                slabMaterial.normalMap = normalMap
                slabMaterial.roughnessMap = roughnessMap
                slabMaterial.map = diffuseMap
                mesh.material = slabMaterial
                applyAOMap = true
                applyLightMap = true
            }
            else if (name.includes('mold')) {
                moldMaterial.normalMap = normalMap
                moldMaterial.roughnessMap = roughnessMap
                //moldMaterial.map = diffuseMap
                mesh.material = moldMaterial
                applyAOMap = true
                applyLightMap = true
                mapAoIntensity = 0.3
            } else if (name.includes('stop') || name.includes('jam')) {
                stopJamMaterial.normalMap = normalMap
                stopJamMaterial.roughnessMap = roughnessMap
                stopJamMaterial.map = diffuseMap
                mesh.material = stopJamMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-top') {
                sealTopMaterial.roughnessMap = roughnessMap
                sealTopMaterial.normalMap = normalMap
                sealTopMaterial.map = diffuseMap
                mesh.material = sealTopMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-bottom') {
                sealBotMaterial.roughnessMap = roughnessMap
                sealBotMaterial.normalMap = normalMap
                sealBotMaterial.map = diffuseMap
                mesh.material = sealBotMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('glass')) {
                mesh.material = glassMaterial
            } else if (name.includes('rubber')) {
                mesh.material = rubberMaterial
            }

            if (applyAOMap && assets.aoMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.aoMap = aoMap
                mat.aoMapIntensity = mapAoIntensity
                mat.needsUpdate = true
            }

            if (applyLightMap && assets.lightMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.lightMap = aoMapLight
                mat.lightMapIntensity = 0.4
                mat.needsUpdate = true
            }
        })
    }, [clone, aoMap, aoMapLight, glassConfig, slabMaterial, moldMaterial, stopJamMaterial, sealTopMaterial, sealBotMaterial, glassMaterial])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[assets.glb === DEFAULT_DOOR_ASSETS.glb && doorWidth !== '32' ? 4 : ({ '32': 5, '34': 3, '36': 1 }[doorWidth] ?? 4), 0, 0]} scale={1} roughness={0.4} metalness={0.8} color='#777777' />
    </>
}

// ─── UI pickers ───────────────────────────────────────────────────────────────

const PICKER_STYLE: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    borderRadius: 10,
    padding: '12px 14px',
    zIndex: 10,
}

const PICKER_LABEL_STYLE: React.CSSProperties = {
    color: '#aaa',
    fontSize: 10,
    fontFamily: 'sans-serif',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 2,
}

function pickerBtn(selected: boolean): React.CSSProperties {
    return {
        background: selected ? '#fff' : 'rgba(255,255,255,0.1)',
        color: selected ? '#111' : '#ddd',
        border: 'none',
        borderRadius: 6,
        padding: '6px 14px',
        fontFamily: 'sans-serif',
        fontSize: 13,
        fontWeight: selected ? 700 : 400,
        cursor: 'pointer',
        textAlign: 'left',
        whiteSpace: 'pre-line',
        transition: 'background 0.15s, color 0.15s',
    }
}

function DoorSizePicker({ height, width, onHeightSelect, onWidthSelect }: {
    height: DoorHeight
    width: DoorWidth
    onHeightSelect: (h: DoorHeight) => void
    onWidthSelect: (w: DoorWidth) => void
}) {
    const heights: DoorHeight[] = ['80', '95']
    const widths: DoorWidth[] = ['32', '34', '36']
    return (
        <div style={{ position: 'absolute', top: 24, left: 24, width: 140, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Door Size</span>
            <span style={{ ...PICKER_LABEL_STYLE, marginBottom: 0 }}>Height</span>
            {heights.map(h => (
                <button key={h} onClick={() => onHeightSelect(h)} style={pickerBtn(height === h)}>{h}"</button>
            ))}
            <span style={{ ...PICKER_LABEL_STYLE, marginTop: 4, marginBottom: 0 }}>Width</span>
            {widths.map(w => (
                <button key={w} onClick={() => onWidthSelect(w)} style={pickerBtn(width === w)}>{w}"</button>
            ))}
        </div>
    )
}

const GLASS_OPTIONS_BY_HEIGHT: Record<DoorHeight, GlassConfig[]> = {
    '80': ['no-glass', '20x64', '22x64', '22x17-3x', '22x12-4x', '12x12-4x', '7x64-right', '7x64-left'],
    '95': ['no-glass', '20x80', '22x80', '22x14-7-16-4x', '22x9-5x'],
}

function GlassConfigPicker({ selected, onSelect, doorHeight }: { selected: GlassConfig; onSelect: (c: GlassConfig) => void; doorHeight: DoorHeight }) {
    const options = GLASS_OPTIONS_BY_HEIGHT[doorHeight]
    return (
        <div style={{ position: 'absolute', top: 24, left: 180, width: 160, ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Glass Configuration</span>
            {options.map((opt) => (
                <button key={opt} onClick={() => onSelect(opt)} style={pickerBtn(selected === opt)}>
                    {GLASS_CONFIG_LABELS[opt]}
                </button>
            ))}
        </div>
    )
}

function PresetMaterialPicker({ presets, selected, onSelect, onDelete }: {
    presets: Record<string, MaterialPreset>
    selected: string
    onSelect: (p: string) => void
    onDelete: (p: string) => void
}) {
    return (
        <div style={{ position: 'absolute', top: 400, left: 24, maxHeight: 500, overflowY: 'auto', ...PICKER_STYLE }}>
            <span style={PICKER_LABEL_STYLE}>Material Preset</span>
            {Object.keys(presets).map((key) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: 3,
                        background: presets[key].slab.color,
                        border: '1px solid rgba(255,255,255,0.2)',
                        flexShrink: 0,
                    }} />
                    <button onClick={() => onSelect(key)} style={{ flex: 1, ...pickerBtn(selected === key) }}>
                        {key}
                    </button>
                    {!DEFAULT_PRESETS[key] && (
                        <button
                            onClick={() => onDelete(key)}
                            title="Delete preset"
                            style={{
                                background: 'rgba(255,80,80,0.2)',
                                color: '#ff9090',
                                border: 'none',
                                borderRadius: 4,
                                padding: '4px 8px',
                                fontFamily: 'sans-serif',
                                fontSize: 13,
                                lineHeight: 1,
                                cursor: 'pointer',
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TestUnoDoorPage() {
    const [selectedPreset, setSelectedPreset] = useState<string>('Black')
    const [customPresets, setCustomPresets] = useState<Record<string, MaterialPreset>>(loadCustomPresets)
    const [doorHeight, setDoorHeight] = useState<DoorHeight>('80')
    const [doorWidth, setDoorWidth] = useState<DoorWidth>('32')
    const [glassConfig, setGlassConfig] = useState<GlassConfig>('no-glass')
    const [isLoading, setIsLoading] = useState(true)

    const allPresets = useMemo(() => ({ ...DEFAULT_PRESETS, ...customPresets }), [customPresets])

    const materialsRef = useRef<MaterialPreset>(DEFAULT_PRESETS['Black'])

    const init = DEFAULT_PRESETS['Black']

    const [{ hdr,
        slabColor, slabRoughness, slabMetalness,
        moldColor, moldRoughness, moldMetalness,
        stopJamColor, stopJamRoughness, stopJamMetalness,
        sealTopColor, sealTopRoughness, sealTopMetalness,
        sealBotColor, sealBotRoughness, sealBotMetalness,
        glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
        lightSourceIntensity, hdrIntensity,
    }, set] = useControls(() => ({
        hdr: {
            label: 'Environment',
            value: 'Passendorf Snow',
            options: Object.keys(HDR_OPTIONS),
        },
        lightSourceIntensity: { label: 'Light Intensity', value: init.lightSourceIntensity, min: 0, max: 2, step: 0.001 },
        hdrIntensity: { label: 'HDR Intensity', value: init.hdrIntensity, min: 0, max: 2, step: 0.001 },
        'Slab / Frame': folder({
            slabColor: { label: 'Color', value: init.slab.color },
            slabRoughness: { label: 'Roughness', value: init.slab.roughness, min: 0, max: 1, step: 0.01 },
            slabMetalness: { label: 'Metalness', value: init.slab.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Mold': folder({
            moldColor: { label: 'Color', value: init.slab.color },
            moldRoughness: { label: 'Roughness', value: init.slab.roughness, min: 0, max: 1, step: 0.01 },
            moldMetalness: { label: 'Metalness', value: init.slab.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Stop / Jam': folder({
            stopJamColor: { label: 'Color', value: init.stopJam.color },
            stopJamRoughness: { label: 'Roughness', value: init.stopJam.roughness, min: 0, max: 1, step: 0.01 },
            stopJamMetalness: { label: 'Metalness', value: init.stopJam.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Seal Top': folder({
            sealTopColor: { label: 'Color', value: init.sealTop.color },
            sealTopRoughness: { label: 'Roughness', value: init.sealTop.roughness, min: 0, max: 1, step: 0.01 },
            sealTopMetalness: { label: 'Metalness', value: init.sealTop.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Seal Bottom': folder({
            sealBotColor: { label: 'Color', value: init.sealBot.color },
            sealBotRoughness: { label: 'Roughness', value: init.sealBot.roughness, min: 0, max: 1, step: 0.01 },
            sealBotMetalness: { label: 'Metalness', value: init.sealBot.metalness, min: 0, max: 1, step: 0.01 },
        }),
        'Glass': folder({
            glassColor: { label: 'Color', value: init.glass.color },
            glassRoughness: { label: 'Roughness', value: init.glass.roughness, min: 0, max: 1, step: 0.001 },
            glassMetalness: { label: 'Metalness', value: init.glass.metalness, min: 0, max: 1, step: 0.01 },
            glassTransmission: { label: 'Transmission', value: init.glass.transmission, min: 0, max: 1, step: 0.01 },
            glassThickness: { label: 'Thickness', value: init.glass.thickness, min: 0, max: 5, step: 0.01 },
            glassOpacity: { label: 'Opacity', value: init.glass.opacity, min: 0, max: 1, step: 0.01 },
        }),
        'Save as Preset': button(() => {
            const name = window.prompt('Enter preset name')
            if (!name || !name.trim()) return
            const trimmed = name.trim()
            setCustomPresets(prev => {
                const updated = { ...prev, [trimmed]: { ...materialsRef.current } }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
                return updated
            })
        }),
    }))

    materialsRef.current = {
        slab: { color: slabColor, roughness: slabRoughness, metalness: slabMetalness },
        mold: { color: moldColor, roughness: moldRoughness, metalness: moldMetalness },
        stopJam: { color: stopJamColor, roughness: stopJamRoughness, metalness: stopJamMetalness },
        sealTop: { color: sealTopColor, roughness: sealTopRoughness, metalness: sealTopMetalness },
        sealBot: { color: sealBotColor, roughness: sealBotRoughness, metalness: sealBotMetalness },
        glass: { color: glassColor, roughness: glassRoughness, metalness: glassMetalness, transmission: glassTransmission, thickness: glassThickness, opacity: glassOpacity },
        lightSourceIntensity,
        hdrIntensity,
    }

    useEffect(() => {
        const preset = allPresets[selectedPreset]
        if (preset) set({
            slabColor: preset.slab.color, slabRoughness: preset.slab.roughness, slabMetalness: preset.slab.metalness,
            moldColor: (preset.mold ?? preset.slab).color, moldRoughness: (preset.mold ?? preset.slab).roughness, moldMetalness: (preset.mold ?? preset.slab).metalness,
            stopJamColor: preset.stopJam.color, stopJamRoughness: preset.stopJam.roughness, stopJamMetalness: preset.stopJam.metalness,
            sealTopColor: preset.sealTop.color, sealTopRoughness: preset.sealTop.roughness, sealTopMetalness: preset.sealTop.metalness,
            sealBotColor: preset.sealBot.color, sealBotRoughness: preset.sealBot.roughness, sealBotMetalness: preset.sealBot.metalness,
            glassColor: preset.glass.color, glassRoughness: preset.glass.roughness, glassMetalness: preset.glass.metalness,
            glassTransmission: preset.glass.transmission, glassThickness: preset.glass.thickness, glassOpacity: preset.glass.opacity,
            lightSourceIntensity: preset.lightSourceIntensity,
            hdrIntensity: preset.hdrIntensity,
        })
    }, [selectedPreset])

    const handleDeletePreset = (key: string) => {
        setCustomPresets(prev => {
            const updated = { ...prev }
            delete updated[key]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
        if (selectedPreset === key) setSelectedPreset('Black')
    }

    useEffect(() => {
        if (!GLASS_OPTIONS_BY_HEIGHT[doorHeight].includes(glassConfig)) {
            setGlassConfig('no-glass')
        }
    }, [doorHeight])

    const hdrFile = HDR_OPTIONS[hdr as keyof typeof HDR_OPTIONS]
    const doorKey = `${doorHeight}-${doorWidth}-${glassConfig}`
    const isUsingDefault = !DOOR_ASSETS[doorKey]

    useEffect(() => { setIsLoading(true) }, [doorKey])

    return (
        <>
            <Leva hidden={!DEBUG} />
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#e1e1e1' }}>
                <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.0, antialias: true }}>
                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[0, 0, doorHeight === '95' ? 250 : 200]} fov={50} />
                        <Environment files={hdrFile} environmentIntensity={hdrIntensity} background={false} backgroundRotation={[0, 0, 0]} environmentRotation={[0, 0, 0]} />
                        <directionalLight position={[12, 50, 200]} intensity={lightSourceIntensity} color="#ffffff" />
                        {/* <directionalLight position={[12, 70, -100]} intensity={lightSourceIntensity} color="#ffffff" /> */}
                        <hemisphereLight position={[0, 50, 0]} intensity={lightSourceIntensity} color="#ffffff" groundColor="#232872" />
                        <UnoDoor
                            key={doorKey}
                            doorHeight={doorHeight}
                            doorWidth={doorWidth}
                            glassConfig={glassConfig}
                            onReady={() => setIsLoading(false)}
                            slab={{ color: slabColor, roughness: slabRoughness, metalness: slabMetalness }}
                            mold={{ color: moldColor, roughness: moldRoughness, metalness: moldMetalness }}
                            stopJam={{ color: stopJamColor, roughness: stopJamRoughness, metalness: stopJamMetalness }}
                            sealTop={{ color: sealTopColor, roughness: sealTopRoughness, metalness: sealTopMetalness }}
                            sealBot={{ color: sealBotColor, roughness: sealBotRoughness, metalness: sealBotMetalness }}
                            glass={{ color: glassColor, roughness: glassRoughness, metalness: glassMetalness, transmission: glassTransmission, thickness: glassThickness, opacity: glassOpacity }}
                            lightSourceIntensity={lightSourceIntensity}
                            hdrIntensity={hdrIntensity}
                        />
                        <OrbitControls />
                    </Suspense>
                </Canvas>
                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 20 }}>
                        <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'sans-serif', fontSize: 15, borderRadius: 10, padding: '12px 24px' }}>
                            Loading…
                        </div>
                    </div>
                )}
                {!isLoading && isUsingDefault && (
                    <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 20 }}>
                        <div style={{ background: 'rgba(180,100,0,0.85)', backdropFilter: 'blur(6px)', color: '#fff', fontFamily: 'sans-serif', fontSize: 13, borderRadius: 10, padding: '10px 20px', whiteSpace: 'nowrap' }}>
                            The 3D Model for this combination is not ready yet — showing default 3D model
                        </div>
                    </div>
                )}
                {/* {DEBUG && <Stats />} */}
                <DoorSizePicker
                    height={doorHeight}
                    width={doorWidth}
                    onHeightSelect={setDoorHeight}
                    onWidthSelect={setDoorWidth}
                />
                {DEBUG && <PresetMaterialPicker
                    presets={allPresets}
                    selected={selectedPreset}
                    onSelect={setSelectedPreset}
                    onDelete={handleDeletePreset}
                />}
                <GlassConfigPicker selected={glassConfig} onSelect={setGlassConfig} doorHeight={doorHeight} />
            </div>
        </>
    )
}
