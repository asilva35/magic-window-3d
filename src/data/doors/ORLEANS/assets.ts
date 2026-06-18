export type DoorAssets = { glb: string; aoMap: string | null; lightMap: string | null, normalMap: string | null, roughnessMap: string | null, diffuseMap: string | null }

export const DEFAULT_DOOR_ASSETS: DoorAssets = {
    glb: '/assets/models/orleans-door-80x32-no-glass.glb',
    aoMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-AO.png',
    lightMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-Light.png',
    normalMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-Normal.png',
    roughnessMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-ROU.png',
    diffuseMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-Diffuse.png',
}

// Key format: "{height}-{width}-{glass}"
export const DOOR_ASSETS: Partial<Record<string, DoorAssets>> = {
    '80-32-no-glass': { glb: '/assets/models/orleans-door-80x32-no-glass.glb', aoMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-AO.png', lightMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-Light.png', normalMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/orleans/orleans-80x32-no-glass-Diffuse.png' },
    '80-34-no-glass': { glb: '/assets/models/orleans-door-80x34-no-glass.glb', aoMap: '/assets/textures/doors/orleans/orleans-80x34-no-glass-AO.png', lightMap: '/assets/textures/doors/orleans/orleans-80x34-no-glass-Light.png', normalMap: '/assets/textures/doors/orleans/orleans-80x34-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/orleans/orleans-80x34-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/orleans/orleans-80x34-no-glass-Diffuse.png' },
    '80-36-no-glass': { glb: '/assets/models/orleans-door-80x36-no-glass.glb', aoMap: '/assets/textures/doors/orleans/orleans-80x36-no-glass-AO.png', lightMap: '/assets/textures/doors/orleans/orleans-80x36-no-glass-Light.png', normalMap: '/assets/textures/doors/orleans/orleans-80x36-no-glass-Normal.png', roughnessMap: '/assets/textures/doors/orleans/orleans-80x36-no-glass-ROU.png', diffuseMap: '/assets/textures/doors/orleans/orleans-80x36-no-glass-Diffuse.png' },
    '80-32-22x48': { glb: '/assets/models/orleans-door-80x32-22x48.glb', aoMap: '/assets/textures/doors/orleans/orleans-80x32-22x48-AO.png', lightMap: '/assets/textures/doors/orleans/orleans-80x32-22x48-Light.png', normalMap: '/assets/textures/doors/orleans/orleans-80x32-22x48-Normal.png', roughnessMap: '/assets/textures/doors/orleans/orleans-80x32-22x48-ROU.png', diffuseMap: '/assets/textures/doors/orleans/orleans-80x32-22x48-Diffuse.png' },
    '80-34-22x48': { glb: '/assets/models/orleans-door-80x34-22x48.glb', aoMap: '/assets/textures/doors/orleans/orleans-80x34-22x48-AO.png', lightMap: '/assets/textures/doors/orleans/orleans-80x34-22x48-Light.png', normalMap: '/assets/textures/doors/orleans/orleans-80x34-22x48-Normal.png', roughnessMap: '/assets/textures/doors/orleans/orleans-80x34-22x48-ROU.png', diffuseMap: '/assets/textures/doors/orleans/orleans-80x34-22x48-Diffuse.png' },
    '80-36-22x48': { glb: '/assets/models/orleans-door-80x36-22x48.glb', aoMap: '/assets/textures/doors/orleans/orleans-80x36-22x48-AO.png', lightMap: '/assets/textures/doors/orleans/orleans-80x36-22x48-Light.png', normalMap: '/assets/textures/doors/orleans/orleans-80x36-22x48-Normal.png', roughnessMap: '/assets/textures/doors/orleans/orleans-80x36-22x48-ROU.png', diffuseMap: '/assets/textures/doors/orleans/orleans-80x36-22x48-Diffuse.png' },
}
