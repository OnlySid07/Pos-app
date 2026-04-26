import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardCharts } from '@/components/dashboard/dashboard-charts'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener estadísticas
  const { data: clientesData } = await supabase
    .from('clientes')
    .select('id')
    

  const { data: costosData } = await supabase
    .from('ventas')
    .select('costo_venta, fecha_venta')
    .order('fecha_venta', { ascending: true })

// 1. Actualizamos la consulta para traer el campo 'estado'
  const { data: pagosData } = await supabase
    .from('pagos')
    .select('monto, fecha_pago, estado') // <--- IMPORTANTE
    .order('fecha_pago', { ascending: true })

  const totalClientes = clientesData?.length || 0
  const totalVentas = costosData?.length || 0
  
  // 2. Monto Total Vendido (Suma de contratos)
  const montoTotalVendido = costosData?.reduce((sum, item) => sum + (item.costo_venta || 0), 0) || 0

  // 3. Monto Cobrado REAL (Solo lo confirmado)
  const montoCobrado = pagosData
    ?.filter((p) => p.estado === 'confirmado') // <--- FILTRO AGREGADO
    .reduce((sum, item) => sum + (item.monto || 0), 0) || 0

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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bienvenido de vuelta al sistema</p>
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
