import { Canvas } from '@react-three/fiber'
import { ACESFilmicToneMapping, MeshStandardMaterial, MeshBasicMaterial, Mesh, NoColorSpace, MeshPhysicalMaterial } from 'three'
import { OrbitControls, Environment, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei'
import { Suspense, useMemo, useState, useEffect, useRef } from 'react'
import { DoorHandle } from './components/DoorHandle'
import { useControls, Leva, button, folder } from 'leva'
import * as THREE from 'three'

const DEBUG = true

useGLTF.preload('/assets/models/uno-door-80x32.glb')
useGLTF.preload('/assets/models/uno-door-80x34.glb')
useGLTF.preload('/assets/models/uno-door-80x36-no-glass.glb')
useGLTF.preload('/assets/models/uno-door-80x36-20x64.glb')
useGLTF.preload('/assets/models/uno-door-80x36-22x64.glb')

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

type DoorAssets = { glb: string; aoMap: string | null; lightMap: string | null }

const DEFAULT_DOOR_ASSETS: DoorAssets = {
    glb: '/assets/models/uno-door-80x32-no-glass.glb',
    aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png',
    lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png',
}

const _def = DEFAULT_DOOR_ASSETS

// Key format: "{height}-{width}-{glass}"
const DOOR_ASSETS: Partial<Record<string, DoorAssets>> = {
    '80-32-no-glass': { glb: '/assets/models/uno-door-80x32-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },
    '80-34-no-glass': { glb: '/assets/models/uno-door-80x34-no-glass.glb', aoMap: _def.aoMap, lightMap: _def.lightMap },
    '80-36-no-glass': { glb: '/assets/models/uno-door-80x36-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-no-glass-Light.png' },
    '80-32-20x64': { glb: '/assets/models/uno-door-80x32-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-34-20x64': { glb: '/assets/models/uno-door-80x34-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-36-20x64': { glb: '/assets/models/uno-door-80x36-20x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },
    '80-32-22x64': { glb: '/assets/models/uno-door-80x32-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-34-22x64': { glb: '/assets/models/uno-door-80x34-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },//AO AND LIGHT MAP IS PENDING
    '80-36-22x64': { glb: '/assets/models/uno-door-80x36-22x64.glb', aoMap: '/assets/textures/doors/uno/uno-80x36-20x64-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x36-20x64-Light.png' },
    '80-32-22x17-3x': { glb: '/assets/models/uno-door-80x32-22x17-3x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-34-22x17-3x': { glb: '/assets/models/uno-door-80x34-22x17-3x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-36-22x17-3x': { glb: '/assets/models/uno-door-80x36-22x17-3x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-32-22x12-4x': { glb: '/assets/models/uno-door-80x32-22x12-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-34-22x12-4x': { glb: '/assets/models/uno-door-80x34-22x12-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-36-22x12-4x': { glb: '/assets/models/uno-door-80x36-22x12-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-32-12x12-4x': { glb: '/assets/models/uno-door-80x32-12x12-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-34-12x12-4x': { glb: '/assets/models/uno-door-80x34-12x12-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-36-12x12-4x': { glb: '/assets/models/uno-door-80x36-12x12-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-32-7x64-right': { glb: '/assets/models/uno-door-80x32-7x64-right.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-34-7x64-right': { glb: '/assets/models/uno-door-80x34-7x64-right.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-36-7x64-right': { glb: '/assets/models/uno-door-80x36-7x64-right.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-32-7x64-left': { glb: '/assets/models/uno-door-80x32-7x64-left.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-34-7x64-left': { glb: '/assets/models/uno-door-80x34-7x64-left.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '80-36-7x64-left': { glb: '/assets/models/uno-door-80x36-7x64-left.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-32-no-glass': { glb: '/assets/models/uno-door-95x32-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },//AO AND LIGHT MAP IS PENDING
    '95-34-no-glass': { glb: '/assets/models/uno-door-95x34-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },//AO AND LIGHT MAP IS PENDING
    '95-36-no-glass': { glb: '/assets/models/uno-door-95x36-no-glass.glb', aoMap: '/assets/textures/doors/uno/uno-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/uno/uno-80x32-no-glass-Light.png' },//AO AND LIGHT MAP IS PENDING
    '95-32-20x80': { glb: '/assets/models/uno-door-95x32-20x80.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-34-20x80': { glb: '/assets/models/uno-door-95x34-20x80.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-36-20x80': { glb: '/assets/models/uno-door-95x36-20x80.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-32-22x80': { glb: '/assets/models/uno-door-95x32-22x80.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-34-22x80': { glb: '/assets/models/uno-door-95x34-22x80.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-36-22x80': { glb: '/assets/models/uno-door-95x36-22x80.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-32-22x14-7-16-4x': { glb: '/assets/models/uno-door-95x32-22x14-7-16-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-34-22x14-7-16-4x': { glb: '/assets/models/uno-door-95x34-22x14-7-16-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-36-22x14-7-16-4x': { glb: '/assets/models/uno-door-95x36-22x14-7-16-4x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-32-22x9-5x': { glb: '/assets/models/uno-door-95x32-22x9-5x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-34-22x9-5x': { glb: '/assets/models/uno-door-95x34-22x9-5x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
    '95-36-22x9-5x': { glb: '/assets/models/uno-door-95x36-22x9-5x.glb', aoMap: null, lightMap: null },//AO AND LIGHT MAP IS PENDING
}

function getDoorAssets(height: DoorHeight, width: DoorWidth, glass: GlassConfig): DoorAssets {
    return DOOR_ASSETS[`${height}-${width}-${glass}`] ?? DEFAULT_DOOR_ASSETS
}

// ─── Material preset ──────────────────────────────────────────────────────────

type MaterialProps = { color: string; roughness: number; metalness: number }
type GlassProps = MaterialProps & { transmission: number; thickness: number; opacity: number }

type MaterialPreset = {
    slab: MaterialProps
    stopJam: MaterialProps
    sealTop: MaterialProps
    sealBot: MaterialProps
    glass: GlassProps
    lightSourceIntensity: number
}

const DEFAULT_PRESETS: Record<string, MaterialPreset> = {
    'Black(525-15)': {
        slab: { color: '#262626', roughness: 0.30, metalness: 0.75 },
        stopJam: { color: '#262626', roughness: 0.52, metalness: 0.75 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 5,
    },
    'White(298)': {
        slab: { color: '#ffffff', roughness: 1.0, metalness: 0.0 },
        stopJam: { color: '#ffffff', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 5,
    },
    'Bright Red(322)': {
        slab: { color: '#ca1921', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#ca1921', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Brown(k-7390)': {
        slab: { color: '#593c2c', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#593c2c', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Window Bronze(415)': {
        slab: { color: '#a29b89', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#a29b89', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Maize(502)': {
        slab: { color: '#FCF3D2', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#FCF3D2', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Windswept Smoke(506)': {
        slab: { color: '#696C65', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#696C65', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Canyon Clay(510)': {
        slab: { color: '#C4C1AE', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#C4C1AE', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Slate(523)': {
        slab: { color: '#6B7074', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#6B7074', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Cedar XL(527)': {
        slab: { color: '#A26A37', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#A26A37', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Almond(532)': {
        slab: { color: '#ECE5D3', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#ECE5D3', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Wedgewood Blue(535)': {
        slab: { color: '#667787', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#667787', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Dover Gray(536)': {
        slab: { color: '#BFC7CA', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#BFC7CA', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Venitian Red(539)': {
        slab: { color: '#794A3A', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#794A3A', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Old World Blue(542)': {
        slab: { color: '#2F3C4D', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#2F3C4D', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Chesnut Brown(554)': {
        slab: { color: '#402923', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#402923', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Pebble(559)': {
        slab: { color: '#837B6E', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#837B6E', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Juniper Grove(580)': {
        slab: { color: '#AFB091', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#AFB091', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Mountain Harbor(5P1)': {
        slab: { color: '#7E8059', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#7E8059', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Metallic Gray(5P4)': {
        slab: { color: '#AFAFAF', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#AFAFAF', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Iron Ore(5P6)': {
        slab: { color: '#333C39', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#333C39', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sandalwood L/G(11)': {
        slab: { color: '#9A9182', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#9A9182', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Antique Brown(265)': {
        slab: { color: '#292621', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#292621', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Clay 403(403)': {
        slab: { color: '#8F8B80', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#8F8B80', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sandalwood 411(411)': {
        slab: { color: '#B1A79B', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#B1A79B', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Cream L/G(492)': {
        slab: { color: '#E9DCBC', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#E9DCBC', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Lambeth Beige(501)': {
        slab: { color: '#CCC5B3', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#CCC5B3', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Tan(507)': {
        slab: { color: '#B5A395', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#B5A395', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sandalwood(508)': {
        slab: { color: '#D4C8BA', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#D4C8BA', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Midnight Surf(509)': {
        slab: { color: '#6A717B', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#6A717B', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Moonlit Moss(513)': {
        slab: { color: '#606B5B', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#606B5B', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Cashmere(514)': {
        slab: { color: '#E5E2DD', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#E5E2DD', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Amber(516)': {
        slab: { color: '#CFB886', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#CFB886', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sage(517)': {
        slab: { color: '#A8AC9D', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#A8AC9D', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Ivy Green(522)': {
        slab: { color: '#66797D', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#66797D', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Antique Ivory(533)': {
        slab: { color: '#EFE0C3', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#EFE0C3', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Pearl(534)': {
        slab: { color: '#DADFE2', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#DADFE2', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Wicker(538)': {
        slab: { color: '#C9C0AF', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#C9C0AF', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sandstone(540)': {
        slab: { color: '#FFFCED', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#FFFCED', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Khaki XL(541)': {
        slab: { color: '#776F64', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#776F64', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Harvest Wheat(543)': {
        slab: { color: '#B39B6F', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#B39B6F', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Dutch Green XL(545)': {
        slab: { color: '#272928', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#272928', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sable(547)': {
        slab: { color: '#655B51', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#655B51', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Country Red XL(551)': {
        slab: { color: '#4E312B', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#4E312B', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'River Rock XL(555)': {
        slab: { color: '#AAA69A', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#AAA69A', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Forest Green(556)': {
        slab: { color: '#254536', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#254536', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Dark Drift(557)': {
        slab: { color: '#63554C', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#63554C', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Commercial Brown(562)': {
        slab: { color: '#494136', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#494136', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Burgundy(567)': {
        slab: { color: '#612332', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#612332', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Nutmeg(568)': {
        slab: { color: '#564241', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#564241', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Saddle Brown(569)': {
        slab: { color: '#837062', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#837062', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Storm(570)': {
        slab: { color: '#919594', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#919594', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Brownstone(571)': {
        slab: { color: '#B3A797', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#B3A797', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Acadia XL(572)': {
        slab: { color: '#7E7C70', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#7E7C70', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Yellowstone(573)': {
        slab: { color: '#836A4C', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#836A4C', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Alu Copper(575)': {
        slab: { color: '#8C5421', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#8C5421', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Mist Grey XL(576)': {
        slab: { color: '#AEAFA9', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#AEAFA9', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sierra XL(577)': {
        slab: { color: '#614E40', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#614E40', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Scotia Blue XL(583)': {
        slab: { color: '#919499', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#919499', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Forest XL(586)': {
        slab: { color: '#5D5F4A', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#5D5F4A', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Sand XL(587)': {
        slab: { color: '#A79A8A', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#A79A8A', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Autumn Gold XL(591)': {
        slab: { color: '#A88952', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#A88952', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Walnut XL(593)': {
        slab: { color: '#4B4336', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#4B4336', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Green 598(598)': {
        slab: { color: '#252C24', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#252C24', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Rockwell Blue(5P2)': {
        slab: { color: '#768698', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#768698', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Espresso(5P3)': {
        slab: { color: '#66543B', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#66543B', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Graphite(5P5)': {
        slab: { color: '#535955', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#535955', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Monterey Sand(5P8)': {
        slab: { color: '#D6CBB7', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#D6CBB7', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Coastal Blue(5P9)': {
        slab: { color: '#385E73', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#385E73', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Midnight Blue XL(P31)': {
        slab: { color: '#1C2029', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#1C2029', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
    'Cream XL(P32)': {
        slab: { color: '#E4CFA0', roughness: 0.86, metalness: 1.0 },
        stopJam: { color: '#E4CFA0', roughness: 1.0, metalness: 0.0 },
        sealTop: { color: '#fffdfd', roughness: 0.2, metalness: 0.9 },
        sealBot: { color: '#2a2121', roughness: 0.2, metalness: 0.9 },
        glass: { color: '#dedede', roughness: 0.025, metalness: 0.9, transmission: 1, thickness: 0.1, opacity: 0.2 },
        lightSourceIntensity: 1,
    },
}

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
    slab, stopJam, sealTop, sealBot, glass,
}: MaterialPreset & { doorHeight: DoorHeight; doorWidth: DoorWidth; glassConfig: GlassConfig; onReady?: () => void }) {
    const assets = getDoorAssets(doorHeight, doorWidth, glassConfig)

    useEffect(() => { onReady?.() }, [])

    const { scene } = useGLTF(assets.glb)
    const aoMapPath = assets.aoMap ?? DEFAULT_DOOR_ASSETS.aoMap!
    const lightMapPath = assets.lightMap ?? DEFAULT_DOOR_ASSETS.lightMap!
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

    const normalMap = useTexture('/assets/textures/normal.jpg')

    const clone = useMemo(() => scene.clone(true), [scene])

    const slabMaterial = useMemo(() => new MeshStandardMaterial({ color: slab.color, metalness: slab.metalness, roughness: slab.roughness }), [slab.color, slab.metalness, slab.roughness])
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
            let applyLightMap = false

            if (name.includes('slab') || name.includes('mold')) {
                slabMaterial.normalMap = normalMap
                const scaleX = 0.01
                const scaleY = 0.01
                slabMaterial.normalScale = new THREE.Vector2(scaleX, scaleY)
                mesh.material = slabMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name.includes('stop') || name.includes('jam')) {
                stopJamMaterial.normalMap = normalMap
                const scale = 0.0
                stopJamMaterial.normalScale = new THREE.Vector2(scale, scale)
                mesh.material = stopJamMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-top') {
                mesh.material = sealTopMaterial
                applyAOMap = true
                applyLightMap = true
            } else if (name === 'seal-bottom') {
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
                mat.aoMapIntensity = glassConfig === 'no-glass' ? 0 : 0.5
                mat.needsUpdate = true
            }

            if (applyLightMap && assets.lightMap) {
                const mat = mesh.material as MeshStandardMaterial
                mat.lightMap = aoMapLight
                mat.lightMapIntensity = 1
                mat.needsUpdate = true
            }
        })
    }, [clone, aoMap, aoMapLight, glassConfig, slabMaterial, stopJamMaterial, sealTopMaterial, sealBotMaterial, glassMaterial])

    return <>
        <primitive object={clone} />
        <DoorHandle position={[assets.glb === DEFAULT_DOOR_ASSETS.glb && doorWidth !== '32' ? 4 : ({ '32': 5, '34': 3, '36': 1 }[doorWidth] ?? 4), 0, 0]} scale={1} roughness={0.5} metalness={0.8} color='silver' />
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
    const [selectedPreset, setSelectedPreset] = useState<string>('Black(525-15)')
    const [customPresets, setCustomPresets] = useState<Record<string, MaterialPreset>>(loadCustomPresets)
    const [doorHeight, setDoorHeight] = useState<DoorHeight>('80')
    const [doorWidth, setDoorWidth] = useState<DoorWidth>('32')
    const [glassConfig, setGlassConfig] = useState<GlassConfig>('no-glass')
    const [isLoading, setIsLoading] = useState(true)

    const allPresets = useMemo(() => ({ ...DEFAULT_PRESETS, ...customPresets }), [customPresets])

    const materialsRef = useRef<MaterialPreset>(DEFAULT_PRESETS['Black(525-15)'])

    const init = DEFAULT_PRESETS['Black(525-15)']

    const [{ hdr,
        slabColor, slabRoughness, slabMetalness,
        stopJamColor, stopJamRoughness, stopJamMetalness,
        sealTopColor, sealTopRoughness, sealTopMetalness,
        sealBotColor, sealBotRoughness, sealBotMetalness,
        glassColor, glassRoughness, glassMetalness, glassTransmission, glassThickness, glassOpacity,
        lightSourceIntensity,
    }, set] = useControls(() => ({
        hdr: {
            label: 'Environment',
            value: 'Passendorf Snow',
            options: Object.keys(HDR_OPTIONS),
        },
        'Slab / Frame': folder({
            slabColor: { label: 'Color', value: init.slab.color },
            slabRoughness: { label: 'Roughness', value: init.slab.roughness, min: 0, max: 1, step: 0.01 },
            slabMetalness: { label: 'Metalness', value: init.slab.metalness, min: 0, max: 1, step: 0.01 },
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
        lightSourceIntensity: { label: 'Light Intensity', value: init.lightSourceIntensity, min: 0, max: 20, step: 0.1 },
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
        stopJam: { color: stopJamColor, roughness: stopJamRoughness, metalness: stopJamMetalness },
        sealTop: { color: sealTopColor, roughness: sealTopRoughness, metalness: sealTopMetalness },
        sealBot: { color: sealBotColor, roughness: sealBotRoughness, metalness: sealBotMetalness },
        glass: { color: glassColor, roughness: glassRoughness, metalness: glassMetalness, transmission: glassTransmission, thickness: glassThickness, opacity: glassOpacity },
        lightSourceIntensity,
    }

    useEffect(() => {
        const preset = allPresets[selectedPreset]
        if (preset) set({
            slabColor: preset.slab.color, slabRoughness: preset.slab.roughness, slabMetalness: preset.slab.metalness,
            stopJamColor: preset.stopJam.color, stopJamRoughness: preset.stopJam.roughness, stopJamMetalness: preset.stopJam.metalness,
            sealTopColor: preset.sealTop.color, sealTopRoughness: preset.sealTop.roughness, sealTopMetalness: preset.sealTop.metalness,
            sealBotColor: preset.sealBot.color, sealBotRoughness: preset.sealBot.roughness, sealBotMetalness: preset.sealBot.metalness,
            glassColor: preset.glass.color, glassRoughness: preset.glass.roughness, glassMetalness: preset.glass.metalness,
            glassTransmission: preset.glass.transmission, glassThickness: preset.glass.thickness, glassOpacity: preset.glass.opacity,
            lightSourceIntensity: preset.lightSourceIntensity,
        })
    }, [selectedPreset])

    const handleDeletePreset = (key: string) => {
        setCustomPresets(prev => {
            const updated = { ...prev }
            delete updated[key]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            return updated
        })
        if (selectedPreset === key) setSelectedPreset('Black(525-15)')
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
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#ffffff' }}>
                <Canvas shadows gl={{ alpha: true, toneMapping: ACESFilmicToneMapping, antialias: true }}>
                    <Suspense fallback={null}>
                        <PerspectiveCamera makeDefault position={[0, 0, doorHeight === '95' ? 250 : 200]} fov={50} />
                        <Environment files={hdrFile} environmentIntensity={1} background={false} />
                        <directionalLight position={[12, 70, 100]} intensity={lightSourceIntensity} color="#ffffff" />
                        <directionalLight position={[12, 70, -100]} intensity={lightSourceIntensity} color="#ffffff" />
                        <UnoDoor
                            key={doorKey}
                            doorHeight={doorHeight}
                            doorWidth={doorWidth}
                            glassConfig={glassConfig}
                            onReady={() => setIsLoading(false)}
                            slab={{ color: slabColor, roughness: slabRoughness, metalness: slabMetalness }}
                            stopJam={{ color: stopJamColor, roughness: stopJamRoughness, metalness: stopJamMetalness }}
                            sealTop={{ color: sealTopColor, roughness: sealTopRoughness, metalness: sealTopMetalness }}
                            sealBot={{ color: sealBotColor, roughness: sealBotRoughness, metalness: sealBotMetalness }}
                            glass={{ color: glassColor, roughness: glassRoughness, metalness: glassMetalness, transmission: glassTransmission, thickness: glassThickness, opacity: glassOpacity }}
                            lightSourceIntensity={lightSourceIntensity}
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
