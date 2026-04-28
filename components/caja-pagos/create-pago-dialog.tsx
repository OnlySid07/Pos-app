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
import { PagoForm } from './pago-form'
import { Plus } from 'lucide-react'

export function CreatePagoDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = async () => {
    setOpen(false)
    await invalidateTagsAndRefresh(router, [
      CACHE_TAGS.pagos,
      CACHE_TAGS.dashboard,
      CACHE_TAGS.reportes,
    ])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Pago</DialogTitle>
          <DialogDescription>
            Completa los detalles del pago recibido
          </DialogDescription>
        </DialogHeader>
        <PagoForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
