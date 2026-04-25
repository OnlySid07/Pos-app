import { ClientesTable } from '@/components/clientes/clientes-table'
import { CreateClienteDialog } from '@/components/clientes/create-cliente-dialog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserAndRole } from '@/lib/auth-service'

export default async function ClientesPage() {
  const { user, role, supabase } = await getUserAndRole()

  // Obtener clientes basado en el rol
  let query = supabase.from('clientes').select('*')

  if (role === 'asesor') {
    query = query.eq('asesor_id', user.id)
  }

  const { data: clientes } = await query.order('created_at', { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-2">Gestiona la información de tus clientes</p>
        </div>
        {(role === 'admin' || role === 'asesor') && (
          <CreateClienteDialog />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
        </CardHeader>
        <ClientesTable clientes={clientes || []} userRole={role} userId={user.id} />
      </Card>
    </div>
  )
}
