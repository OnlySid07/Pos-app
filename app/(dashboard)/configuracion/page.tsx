import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { UsuariosAdmin } from '@/components/configuracion/usuarios-admin'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

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

  const getUsuarios = unstable_cache(
    async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[cache-miss] usuarios query user=${user?.id || 'anonymous'} ts=${new Date().toISOString()}`)
      }

      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      return data || []
    },
    ['usuarios-page-list', user?.id || 'anonymous'],
    {
      tags: [CACHE_TAGS.usuarios],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const usuarios = await getUsuarios()

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-2">Administra los usuarios del sistema</p>
        </div>
        <DataRefreshButton
          tags={[CACHE_TAGS.usuarios]}
          label="Refrescar usuarios"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
        </CardHeader>
        <UsuariosAdmin usuarios={usuarios} />
      </Card>
    </div>
  )
}
