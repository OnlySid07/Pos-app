import { createClient } from '@/lib/supabase/server'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { ReportesContent } from '@/components/reportes/reportes-content'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

export default async function ReportesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  const getReportesData = unstable_cache(
    async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[cache-miss] reportes query user=${user?.id || 'anonymous'} ts=${new Date().toISOString()}`)
      }

      const [{ data: clientes }, { data: costos }, { data: pagos }] = await Promise.all([
        supabase
          .from('clientes')
          .select('id, apellidos, nombres, codigo_cliente'),
        supabase
          .from('ventas')
          .select('*, clientes(apellidos, nombres)')
          .order('fecha_venta', { ascending: false }),
        supabase
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
          .order('fecha_pago', { ascending: false }),
      ])

      return {
        clientes: clientes || [],
        costos: costos || [],
        pagos: pagos || [],
      }
    },
    ['reportes-page-data', user?.id || 'anonymous'],
    {
      tags: [CACHE_TAGS.reportes, CACHE_TAGS.clientes, CACHE_TAGS.ventas, CACHE_TAGS.pagos],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const { clientes, costos, pagos } = await getReportesData()

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground mt-2">Genera reportes de ventas y cobranza</p>
        </div>
        <DataRefreshButton
          tags={[CACHE_TAGS.reportes, CACHE_TAGS.clientes, CACHE_TAGS.ventas, CACHE_TAGS.pagos]}
          label="Refrescar reportes"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles</CardTitle>
        </CardHeader>
        <ReportesContent
          clientes={clientes}
          costos={costos}
          pagos={pagos}
          userRole={userData?.role}
        />
      </Card>
    </div>
  )
}
