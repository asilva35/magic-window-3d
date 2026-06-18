export type GlassConfig =
    | 'no-glass'
    | '22x48'

export const GLASS_CONFIG_LABELS: Record<GlassConfig, string> = {
    'no-glass': 'No Glass',
    '22x48': '22x48',
}
