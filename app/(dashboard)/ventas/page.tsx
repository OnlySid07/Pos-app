import { VentasTable } from '@/components/ventas/ventas-table'
import { CreateVentaDialog } from '@/components/ventas/create-venta-dialog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserAndRole } from '@/lib/auth-service'

export default async function VentasPage() {
  const { role, supabase } = await getUserAndRole()

  const { data: ventas } = await supabase
    .from('costos')
    .select('*, clientes(apellidos, nombres, codigo_cliente)')
    .order('fecha_venta', { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground mt-2">Gestiona las condiciones y costos de venta</p>
        </div>
        {(role === 'admin' || role === 'asesor') && (
          <CreateVentaDialog />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Ventas</CardTitle>
        </CardHeader>
        <VentasTable ventas={ventas || []} userRole={role} />
      </Card>
    </div>
  )
}
