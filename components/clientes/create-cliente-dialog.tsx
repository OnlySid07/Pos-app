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
import { ClienteForm } from './cliente-form'
import { Plus } from 'lucide-react'

export function CreateClienteDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSuccess = async () => {
    setOpen(false)
    await invalidateTagsAndRefresh(router, [
      CACHE_TAGS.clientes,
      CACHE_TAGS.ventas,
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
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Completa la información del cliente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>
        <ClienteForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
