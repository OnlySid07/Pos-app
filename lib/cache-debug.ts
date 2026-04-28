/**
 * Cache debugging utility
 * Helps distinguish between cache hits and cache misses
 */

let queryTimestamps: Map<string, { timestamp: number; count: number }> = new Map()

export function logCacheMiss(
  label: string,
  userId: string,
  isProduction?: boolean
): void {
  if (isProduction) return

  const key = `${label}:${userId}`
  const now = Date.now()
  const lastEntry = queryTimestamps.get(key)

  // Si la última query fue hace menos de 100ms, probablemente es cache hit (misma renderización)
  if (lastEntry && now - lastEntry.timestamp < 100) {
    console.log(`[cache-hit] ${label} user=${userId} (reused from cache)`)
    lastEntry.count++
    return
  }

  // Si fue hace más de 100ms, es probablemente un cache miss real
  queryTimestamps.set(key, { timestamp: now, count: 1 })
  console.log(
    `[cache-miss] ${label} user=${userId} ts=${new Date().toISOString()} (querying DB)`
  )

  // Limpiar registros antiguos cada 5 minutos
  if (queryTimestamps.size > 100) {
    queryTimestamps.clear()
  }
}

export function debugCacheMetrics(): void {
  if (process.env.NODE_ENV === 'production') return
  console.log('[cache-metrics]', {
    trackedQueries: queryTimestamps.size,
    entries: Array.from(queryTimestamps.entries()).map(([key, val]) => ({
      key,
      lastTime: new Date(val.timestamp).toISOString(),
      count: val.count,
    })),
  })
}
