'use client'

import { CajaPago } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EditPagoDialog } from './edit-pago-dialog'
import { DeletePagoDialog } from './delete-pago-dialog'

const estadoLabels: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
}

const estadoColors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
}

export function CajaPagosTable({
  pagos,
  userRole,
}: {
  pagos: any[]
  userRole?: string
}) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo Pago</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Fecha Pago</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay pagos registrados
              </TableCell>
            </TableRow>
          ) : (
            pagos.map((pago) => (
              <TableRow key={pago.id}>
                <TableCell className="font-medium">
                  {pago.clientes?.codigo_cliente} - {[pago.clientes?.apellidos, pago.clientes?.nombres].filter(Boolean).join(' ')}
                </TableCell>
                <TableCell>{pago.tipo_pago}</TableCell>
                <TableCell className="font-mono font-semibold">
                  S/. {pago.monto?.toFixed(2)}
                </TableCell>
                <TableCell className="text-sm">
                  {pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES') : '-'}
                </TableCell>
                <TableCell className="text-sm">{pago.metodo_pago || '-'}</TableCell>
                <TableCell>
                  <Badge className={estadoColors[pago.estado] || 'bg-gray-100 text-gray-800'}>
                    {estadoLabels[pago.estado] || pago.estado}
                  </Badge>
                </TableCell>
                <TableCell className="flex gap-2">
                  {(userRole === 'admin' || userRole === 'finanzas') && (
                    <>
                      <EditPagoDialog pago={pago} />
                      <DeletePagoDialog pagoId={pago.id} />
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
