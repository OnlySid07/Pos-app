import { VentasTable } from '@/components/ventas/ventas-table'
import { CreateVentaDialog } from '@/components/ventas/create-venta-dialog'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserAndRole } from '@/lib/auth-service'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

export default async function VentasPage() {
  const { user, role, supabase } = await getUserAndRole()

  const getVentas = unstable_cache(
    async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[cache-miss] ventas query user=${user.id} ts=${new Date().toISOString()}`)
      }

      const { data } = await supabase
        .from('ventas')
        .select('*, clientes(apellidos, nombres, codigo_cliente)')
        .order('fecha_venta', { ascending: false })

      return data || []
    },
    ['ventas-page-list', user.id],
    {
      tags: [CACHE_TAGS.ventas],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const ventas = await getVentas()

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground mt-2">Gestiona las condiciones y costos de venta</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataRefreshButton
            tags={[CACHE_TAGS.ventas]}
            label="Refrescar ventas"
          />
          {(role === 'admin' || role === 'asesor') && (
            <CreateVentaDialog />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Ventas</CardTitle>
        </CardHeader>
        <VentasTable ventas={ventas} userRole={role} />
      </Card>
    </div>
  )
}
