import { createClient } from '@/lib/supabase/server'
import { ReportesContent } from '@/components/reportes/reportes-content'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

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

  // Obtener datos para reportes
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, apellidos, nombres, codigo_cliente')

  const { data: costos } = await supabase
    .from('costos')
    .select('*, clientes(apellidos, nombres)')
    .order('fecha_venta', { ascending: false })

  const { data: pagos } = await supabase
    .from('caja_pagos')
    .select('*, clientes(apellidos, nombres)')
    .order('fecha_pago', { ascending: false })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
        <p className="text-muted-foreground mt-2">Genera reportes de ventas y cobranza</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reportes Disponibles</CardTitle>
        </CardHeader>
        <ReportesContent
          clientes={clientes || []}
          costos={costos || []}
          pagos={pagos || []}
          userRole={userData?.role}
        />
      </Card>
    </div>
  )
}
