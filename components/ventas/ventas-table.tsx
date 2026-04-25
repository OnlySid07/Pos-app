'use client'

import { Costo } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { EditVentaDialog } from './edit-venta-dialog'
import { DeleteVentaDialog } from './delete-venta-dialog'

const tipoVentaLabels: Record<string, string> = {
  contado: 'Contado',
  financiado: 'Financiado',
  mixto: 'Mixto',
}

export function VentasTable({
  ventas,
  userRole,
}: {
  ventas: any[]
  userRole?: string
}) {
  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Tipo Venta</TableHead>
            <TableHead>Costo Venta</TableHead>
            <TableHead>Cuota Inicial</TableHead>
            <TableHead>Monto a Financiar</TableHead>
            <TableHead>Fecha Venta</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ventas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No hay ventas registradas
              </TableCell>
            </TableRow>
          ) : (
            ventas.map((venta) => (
              <TableRow key={venta.id}>
                <TableCell className="font-medium">
                  {venta.clientes?.codigo_cliente} - {[venta.clientes?.apellidos, venta.clientes?.nombres].filter(Boolean).join(' ')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {tipoVentaLabels[venta.tipo_venta] || venta.tipo_venta}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">S/. {venta.costo_venta?.toFixed(2)}</TableCell>
                <TableCell className="font-mono">
                  {venta.aporte_cuota_inicial ? `S/. ${venta.aporte_cuota_inicial.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="font-mono">
                  {venta.monto_financiar ? `S/. ${venta.monto_financiar.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="text-sm">
                  {venta.fecha_venta ? new Date(venta.fecha_venta).toLocaleDateString('es-ES') : '-'}
                </TableCell>
                <TableCell className="flex gap-2">
                  {(userRole === 'admin' || userRole === 'asesor') && (
                    <>
                      <EditVentaDialog venta={venta} />
                      <DeleteVentaDialog ventaId={venta.id} />
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
