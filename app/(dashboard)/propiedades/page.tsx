import { createClient } from '@/lib/supabase/server'
import { PropiedadesTable } from '@/components/propiedades/propiedades-table'
import { CreatePropiedadDialog } from '@/components/propiedades/create-propiedad-dialog'
import { DataRefreshButton } from '@/components/layout/data-refresh-button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CACHE_TAGS, DEFAULT_CACHE_REVALIDATE_SECONDS } from '@/lib/cache-tags'
import { unstable_cache } from 'next/cache'

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

  const getPropiedades = unstable_cache(
    async () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[cache-miss] propiedades query user=${user?.id || 'anonymous'} ts=${new Date().toISOString()}`)
      }

      const { data } = await supabase
        .from('propiedades')
        .select('*')
        .order('created_at', { ascending: false })

      return data || []
    },
    ['propiedades-page-list', user?.id || 'anonymous'],
    {
      tags: [CACHE_TAGS.propiedades],
      revalidate: DEFAULT_CACHE_REVALIDATE_SECONDS,
    }
  )

  const propiedades = await getPropiedades()

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propiedades</h1>
          <p className="text-muted-foreground mt-2">Gestiona el inventario de propiedades</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataRefreshButton
            tags={[CACHE_TAGS.propiedades]}
            label="Refrescar propiedades"
          />
          {(userData?.role === 'admin' || userData?.role === 'asesor') && (
            <CreatePropiedadDialog />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Propiedades</CardTitle>
        </CardHeader>
        <PropiedadesTable propiedades={propiedades} userRole={userData?.role} />
      </Card>
    </div>
  )
}
