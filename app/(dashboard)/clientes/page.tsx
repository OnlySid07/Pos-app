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
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[cache-miss] clientes query user=${user.id} ts=${new Date().toISOString()}`)
      }

      const { data } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false })

      return data || []
    },
    ['clientes-page-list', user.id],
    {
      tags: [CACHE_TAGS.clientes],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const clientes = await getClientes()

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