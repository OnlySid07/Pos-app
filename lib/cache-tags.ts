export const CACHE_TAGS = {
  clientes: 'clientes',
  ventas: 'ventas',
  pagos: 'pagos',
  propiedades: 'propiedades',
  usuarios: 'usuarios',
  dashboard: 'dashboard',
  reportes: 'reportes',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

export const ALLOWED_CACHE_TAGS: ReadonlySet<string> = new Set(Object.values(CACHE_TAGS))

export const DEFAULT_CACHE_REVALIDATE_SECONDS = 60 * 30
