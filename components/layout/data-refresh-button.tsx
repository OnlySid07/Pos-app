'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { invalidateTagsAndRefresh } from '@/lib/cache-client'
import type { CacheTag } from '@/lib/cache-tags'

type DataRefreshButtonProps = {
  tags: CacheTag[]
  label?: string
}

export function DataRefreshButton({ tags, label = 'Refrescar' }: DataRefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await invalidateTagsAndRefresh(router, tags)
    } catch (error) {
      console.error('Error refreshing page data:', error)
      router.refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleRefresh} 
      disabled={isRefreshing}
      size="sm"
      className="flex items-center gap-2 whitespace-nowrap"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      <span className="hidden md:inline">{isRefreshing ? 'Actualizando...' : label}</span>
    </Button>
  )
}
