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
import { CajaPago } from '@/lib/types'
import { Pencil } from 'lucide-react'

export function EditPagoDialog({ pago }: { pago: CajaPago }) {
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
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Pago</DialogTitle>
          <DialogDescription>
            Actualiza la información del pago
          </DialogDescription>
        </DialogHeader>
        <PagoForm pago={pago} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
