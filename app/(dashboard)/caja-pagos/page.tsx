import { createClient } from '@/lib/supabase/server'
import { CajaPagosTable } from '@/components/caja-pagos/caja-pagos-table'
import { CreatePagoDialog } from '@/components/caja-pagos/create-pago-dialog'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default async function CajaPagosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

const { data: pagos } = await supabase
  .from('pagos')
  .select(`
    *,
    ventas (
      id,
      clientes (
        apellidos, 
        nombres, 
        codigo_cliente
      )
    )
  `)
  .order('fecha_pago', { ascending: false })

// 1. Total Cobrado: Solo sumamos lo que ya está "confirmado"
const totalCobrado = pagos
  ?.filter((p) => p.estado === 'confirmado')
  .reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0

// 2. Pagos Pendientes: Filtramos los registros que aún no se validan
const pagosPendientes = pagos?.filter((p) => p.estado === 'pendiente') || []

// 3. Monto Pendiente: Sumamos solo esos registros pendientes
const montoPendiente = pagosPendientes.reduce((sum, pago) => sum + (pago.monto || 0), 0) || 0
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caja y Pagos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los pagos y el flujo de caja</p>
        </div>
        {(userData?.role === 'admin' || userData?.role === 'finanzas') && (
          <CreatePagoDialog />
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/. {(totalCobrado / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Pagos confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagosPendientes.length}</div>
            <p className="text-xs text-muted-foreground">Registros sin confirmar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/. {(montoPendiente / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Por confirmar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Pagos</CardTitle>
        </CardHeader>
        <CajaPagosTable pagos={pagos || []} userRole={userData?.role} />
      </Card>
    </div>
  )
}
