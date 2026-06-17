export type GlassConfig =
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

export const GLASS_CONFIG_LABELS: Record<GlassConfig, string> = {
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