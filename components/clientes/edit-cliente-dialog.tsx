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
import { ClienteForm } from './cliente-form'
import { Cliente } from '@/lib/types'
import { Pencil } from 'lucide-react'

interface EditClienteDialogProps {
  cliente: Cliente
  userRole?: string
}

export function EditClienteDialog({ cliente, userRole }: EditClienteDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = async () => {
    setOpen(false)
    router.refresh()
  }

  const canEdit = userRole === 'admin' || userRole === 'asesor'

  if (!canEdit) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Actualiza la información del cliente
          </DialogDescription>
        </DialogHeader>
        <ClienteForm cliente={cliente} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}
