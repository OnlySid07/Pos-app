'use client'

import { User } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EditUsuarioDialog } from './edit-usuario-dialog'
import { DeleteUsuarioDialog } from './delete-usuario-dialog'
import { CreateUsuarioDialog } from './create-usuario-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  asesor: 'Asesor',
  finanzas: 'Finanzas',
  gerencia: 'Gerencia',
}

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  asesor: 'bg-blue-100 text-blue-800',
  finanzas: 'bg-green-100 text-green-800',
  gerencia: 'bg-purple-100 text-purple-800',
}

export function UsuariosAdmin({ usuarios }: { usuarios: User[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateUsuarioDialog />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.full_name}</TableCell>
                  <TableCell className="text-sm">{usuario.email}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[usuario.role] || 'bg-gray-100 text-gray-800'}>
                      {roleLabels[usuario.role] || usuario.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={usuario.active ? 'outline' : 'destructive'}>
                      {usuario.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(usuario.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <EditUsuarioDialog usuario={usuario} />
                    <DeleteUsuarioDialog usuarioId={usuario.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
