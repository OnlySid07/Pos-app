'use client'

import { Propiedad } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EditPropiedadDialog } from './edit-propiedad-dialog'
import { DeletePropiedadDialog } from './delete-propiedad-dialog'

const statusLabels: Record<string, string> = {
  disponible: 'Disponible',
  vendida: 'Vendida',
  reservada: 'Reservada',
  en_construccion: 'En Construcción',
}

const statusColors: Record<string, string> = {
  disponible: 'bg-green-100 text-green-800',
  vendida: 'bg-blue-100 text-blue-800',
  reservada: 'bg-yellow-100 text-yellow-800',
  en_construccion: 'bg-orange-100 text-orange-800',
}

export function PropiedadesTable({
  propiedades,
  userRole,
}: {
  propiedades: Propiedad[]
  userRole?: string
}) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>MZ</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Metros</TableHead>
            <TableHead>Ubicación</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propiedades.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay propiedades registradas
              </TableCell>
            </TableRow>
          ) : (
            propiedades.map((propiedad) => (
              <TableRow key={propiedad.id}>
                <TableCell className="font-medium">{propiedad.mz || '-'}</TableCell>
                <TableCell>{propiedad.lote || '-'}</TableCell>
                <TableCell>{propiedad.sector || '-'}</TableCell>
                <TableCell>{propiedad.metros_terreno?.toFixed(2) || '-'} m²</TableCell>
                <TableCell className="text-sm">{propiedad.ubicacion || '-'}</TableCell>
                <TableCell>
                  <Badge className={statusColors[propiedad.status] || 'bg-gray-100 text-gray-800'}>
                    {statusLabels[propiedad.status] || propiedad.status}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {(userRole === 'admin' || userRole === 'asesor') && (
                    <>
                      <EditPropiedadDialog propiedad={propiedad} />
                      <DeletePropiedadDialog propiedadId={propiedad.id} />
                    </>
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
