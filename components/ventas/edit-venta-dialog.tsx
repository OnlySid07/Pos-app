'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VentaForm } from './venta-form'
import { Costo } from '@/lib/types'
import { Pencil } from 'lucide-react'

export function EditVentaDialog({ venta }: { venta: Costo }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Venta</DialogTitle>
          <DialogDescription>
            Actualiza la información de la venta
          </DialogDescription>
        </DialogHeader>
        <VentaForm venta={venta} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
