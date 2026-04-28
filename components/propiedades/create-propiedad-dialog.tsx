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
import { PropiedadForm } from './propiedad-form'
import { Plus } from 'lucide-react'

export function CreatePropiedadDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = async () => {
    setOpen(false)
    await invalidateTagsAndRefresh(router, [CACHE_TAGS.propiedades])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Propiedad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nueva Propiedad</DialogTitle>
          <DialogDescription>
            Completa la información de la propiedad
          </DialogDescription>
        </DialogHeader>
        <PropiedadForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
