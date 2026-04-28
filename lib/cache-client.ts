'use client'

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { CacheTag } from '@/lib/cache-tags'

async function invalidateTags(tags: CacheTag[]): Promise<void> {
  const response = await fetch('/api/cache/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tags }),
  })

  if (!response.ok) {
    throw new Error('No se pudo invalidar cache')
  }
}

export async function invalidateTagsAndRefresh(
  router: AppRouterInstance,
  tags: CacheTag[]
): Promise<void> {
  await invalidateTags(tags)
  router.refresh()
}
