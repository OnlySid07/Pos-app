import { createClient } from '@/lib/supabase/server'
import { CajaPagosTable } from '@/components/caja-pagos/caja-pagos-table'
import { CreatePagoDialog } from '@/components/caja-pagos/create-pago-dialog'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

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

  const getPagos = unstable_cache(
    async () => {
      const startTime = Date.now()
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[DB-QUERY] pagos - Ejecutando query a la DB para user=${user?.id || 'anonymous'}`
        )
      }

      const { data } = await supabase
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

      const duration = Date.now() - startTime
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[DB-QUERY-DONE] pagos - Query completada en ${duration}ms`
        )
      }

      return data || []
    },
    ['pagos-page-list', user?.id || 'anonymous'],
    {
      tags: [CACHE_TAGS.pagos],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const pagos = await getPagos()

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[CACHE-CHECK] pagos - Si viste [DB-QUERY] arriba = query nueva. Si no lo viste = usando cache ✓`)
  }

// 1. Total Cobrado: Solo sumamos lo que ya está "confirmado"
  const totalCobrado = pagos
    .filter((p) => p.estado === 'confirmado')
    .reduce((sum, pago) => sum + (pago.monto || 0), 0)

// 2. Pagos Pendientes: Filtramos los registros que aún no se validan
  const pagosPendientes = pagos.filter((p) => p.estado === 'pendiente')

// 3. Monto Pendiente: Sumamos solo esos registros pendientes
  const montoPendiente = pagosPendientes.reduce((sum, pago) => sum + (pago.monto || 0), 0)
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caja y Pagos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los pagos y el flujo de caja</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataRefreshButton
            tags={[CACHE_TAGS.pagos]}
            label="Refrescar pagos"
          />
          {(userData?.role === 'admin' || userData?.role === 'finanzas') && (
            <CreatePagoDialog />
          )}
        </div>
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
        <CajaPagosTable pagos={pagos} userRole={userData?.role} />
      </Card>
    </div>
  )
}
