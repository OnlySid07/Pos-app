import { createClient } from '@/lib/supabase/server'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const getDashboardData = unstable_cache(
    async () => {
      const startTime = Date.now()
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[DB-QUERY] dashboard - Ejecutando query a la DB para user=${user?.id || 'anonymous'}`
        )
      }

      const [{ data: clientesData }, { data: costosData }, { data: pagosData }] = await Promise.all([
        supabase.from('clientes').select('id'),
        supabase
          .from('ventas')
          .select('costo_venta, fecha_venta')
          .order('fecha_venta', { ascending: true }),
        supabase
          .from('pagos')
          .select('monto, fecha_pago, estado')
          .order('fecha_pago', { ascending: true }),
      ])

      const duration = Date.now() - startTime
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[DB-QUERY-DONE] dashboard - Query completada en ${duration}ms`
        )
      }

      return {
        clientesData: clientesData || [],
        costosData: costosData || [],
        pagosData: pagosData || [],
      }
    },
    ['dashboard-page-data', user?.id || 'anonymous'],
    {
      tags: [CACHE_TAGS.dashboard, CACHE_TAGS.clientes, CACHE_TAGS.ventas, CACHE_TAGS.pagos],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const { clientesData, costosData, pagosData } = await getDashboardData()

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[CACHE-CHECK] dashboard - Si viste [DB-QUERY] arriba = query nueva. Si no lo viste = usando cache ✓`)
  }

  const totalClientes = clientesData.length
  const totalVentas = costosData.length
  
  // 2. Monto Total Vendido (Suma de contratos)
  const montoTotalVendido = costosData.reduce((sum, item) => sum + (item.costo_venta || 0), 0)

  // 3. Monto Cobrado REAL (Solo lo confirmado)
  const montoCobrado = pagosData
    .filter((p) => p.estado === 'confirmado')
    .reduce((sum, item) => sum + (item.monto || 0), 0)

  // Agrupar datos por mes para gráficos
  const ventasPorMes = (costosData || []).reduce((acc: any, item: any) => {
    if (!item.fecha_venta) return acc
    const fecha = new Date(item.fecha_venta)
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
    const existing = acc.find((m: any) => m.mes === mes)
    if (existing) {
      existing.monto += item.costo_venta || 0
    } else {
      acc.push({ mes, monto: item.costo_venta || 0 })
    }
    return acc
  }, [])

// 4. Pagos por mes REALES (Solo lo confirmado para el gráfico)
  const pagosPorMes = (pagosData || [])
    .filter((p: any) => p.estado === 'confirmado') // <--- FILTRO AGREGADO AQUÍ TAMBIÉN
    .reduce((acc: any, item: any) => {
      if (!item.fecha_pago) return acc
      const fecha = new Date(item.fecha_pago)
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      const existing = acc.find((m: any) => m.mes === mes)
      if (existing) {
        existing.monto += item.monto || 0
      } else {
        acc.push({ mes, monto: item.monto || 0 })
      }
      return acc
    }, [])

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Bienvenido de vuelta al sistema</p>
          </div>
          <DataRefreshButton
            tags={[CACHE_TAGS.dashboard, CACHE_TAGS.clientes, CACHE_TAGS.ventas, CACHE_TAGS.pagos]}
            label="Refrescar dashboard"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">Clientes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVentas}</div>
            <p className="text-xs text-muted-foreground">Transacciones registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Vendido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/. {(montoTotalVendido / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Valor total en ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Cobrado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/. {(montoCobrado / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">Pagos recibidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts ventasPorMes={ventasPorMes} pagosPorMes={pagosPorMes} />
    </div>
  )
}
