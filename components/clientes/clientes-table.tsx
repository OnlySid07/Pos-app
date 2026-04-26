'use client'

import { Cliente } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { EditClienteDialog } from './edit-cliente-dialog'
import { DeleteClienteDialog } from './delete-cliente-dialog'


export function ClientesTable({
  clientes,
  userRole,
  userId,
}: {
  clientes: Cliente[]
  userRole?: string
  userId?: string
}) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>DNI</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No hay clientes registrados
              </TableCell>
            </TableRow>
          ) : (
            clientes.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className="font-medium">{cliente.codigo_cliente}</TableCell>
                <TableCell>
                  {[cliente.apellidos, cliente.nombres].filter(Boolean).join(' ') || '-'}
                </TableCell>
                <TableCell>{cliente.dni}</TableCell>
                <TableCell>{cliente.telefonos || '-'}</TableCell>
                <TableCell className="text-sm">{cliente.correo || '-'}</TableCell>
                <TableCell className="flex gap-2">
                  <EditClienteDialog cliente={cliente} userRole={userRole} />
                  {(userRole === 'admin' || userId === cliente.asesor_id) && (
                    <DeleteClienteDialog clienteId={cliente.id} />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
