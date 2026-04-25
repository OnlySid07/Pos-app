import { createClient } from '@/lib/supabase/server'
import { PropiedadesTable } from '@/components/propiedades/propiedades-table'
import { CreatePropiedadDialog } from '@/components/propiedades/create-propiedad-dialog'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PropiedadesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  const { data: propiedades } = await supabase
    .from('propiedades')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground mt-2">Gestiona el inventario de propiedades</p>
        </div>
        {(userData?.role === 'admin' || userData?.role === 'asesor') && (
          <CreatePropiedadDialog />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Propiedades</CardTitle>
        </CardHeader>
        <PropiedadesTable propiedades={propiedades || []} userRole={userData?.role} />
      </Card>
    </div>
  )
}
