import { ClientesTable } from '@/components/clientes/clientes-table'
import { CreateClienteDialog } from '@/components/clientes/create-cliente-dialog'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserAndRole } from '@/lib/auth-service'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

export default async function ClientesPage() {
  const { user, role, supabase } = await getUserAndRole()

  const getClientes = unstable_cache(
    async () => {
      // Este log solo aparece si realmente está haciendo query a la DB
      // Si no lo ves, significa que está usando el cache
      const startTime = Date.now()
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[DB-QUERY] clientes - Ejecutando query a la DB para user=${user.id}`
        )
      }

      const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      const duration = Date.now() - startTime
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `[DB-QUERY-DONE] clientes - Query completada en ${duration}ms`
        )
      }

      return data || []
    },
    ['clientes-page-list', user.id],
    {
      tags: [CACHE_TAGS.clientes],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const clientes = await getClientes()

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[CACHE-CHECK] clientes - Si viste [DB-QUERY] arriba = query nueva. Si no lo viste = usando cache ✓`)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gestiona la información de tus clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <DataRefreshButton
            tags={[CACHE_TAGS.clientes]}
            label="Refrescar clientes"
          />
          {(role === 'admin' || role === 'asesor') && (
            <CreateClienteDialog />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
        </CardHeader>
        <ClientesTable clientes={clientes} userRole={role} userId={user.id} />
      </Card>
    </div>
  )
}