'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Propiedad } from '@/lib/types'
import { Pencil } from 'lucide-react'

export function EditPropiedadDialog({ propiedad }: { propiedad: Propiedad }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = async () => {
    setOpen(false)
    await invalidateTagsAndRefresh(router, [CACHE_TAGS.propiedades])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Propiedad</DialogTitle>
          <DialogDescription>
            Actualiza la información de la propiedad
          </DialogDescription>
        </DialogHeader>
        <PropiedadForm propiedad={propiedad} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
