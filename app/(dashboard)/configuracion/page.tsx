import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UsuariosAdmin } from '@/components/configuracion/usuarios-admin'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  // Solo admins pueden acceder
  if (userData?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: usuarios } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground mt-2">Administra los usuarios del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <UsuariosAdmin usuarios={usuarios || []} />
      </Card>
    </div>
  )
}
