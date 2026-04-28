'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { invalidateTagsAndRefresh } from '@/lib/cache-client'
import { CACHE_TAGS } from '@/lib/cache-tags'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

export function DeletePropiedadDialog({ propiedadId }: { propiedadId: string }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('propiedades')
        .delete()
        .eq('id', propiedadId)

      if (error) throw error

      setOpen(false)
      await invalidateTagsAndRefresh(router, [CACHE_TAGS.propiedades])
    } catch (error) {
      console.error('[v0] Delete error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Propiedad</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar esta propiedad? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
