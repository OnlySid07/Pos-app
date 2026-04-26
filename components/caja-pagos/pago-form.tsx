'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Cliente, CajaPago } from '@/lib/types'
import { generateReciboPDF } from '@/lib/reports/recibo'
const pagoSchema = z.object({
  venta_id: z.string().min(1, 'La venta es requerida'),
  tipo_pago: z.string().min(1, 'Tipo de pago requerido'),
  monto: z.coerce.number().positive('Monto debe ser mayor a 0'),
  fecha_pago: z.string().min(1, 'Fecha requerida'),
  numero_recibo: z.string().optional(),
  metodo_pago: z.string().optional(),
  referencia: z.string().optional(),
  estado: z.enum(['pendiente', 'confirmado', 'cancelado']),
})

type PagoFormValues = z.infer<typeof pagoSchema>

interface PagoFormProps {
  pago?: CajaPago
  onSuccess: () => void
}

export function PagoForm({ pago, onSuccess }: PagoFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const [ventas, setVentas] = useState<any[]>([])
  const [imprimirBoleta, setImprimirBoleta] = useState(true)
  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      venta_id: pago?.venta_id || '', //👈 Asegúrate que aquí también diga venta_id
      tipo_pago: pago?.tipo_pago || '',
      monto: pago?.monto,
      fecha_pago: pago?.fecha_pago || new Date().toISOString().split('T')[0],
      numero_recibo: pago?.numero_recibo || '',
      metodo_pago: pago?.metodo_pago || 'transferencia',
      referencia: pago?.referencia || '',
      estado: pago?.estado as 'pendiente' | 'confirmado' | 'cancelado' || 'pendiente',
    },
  })

  useEffect(() => {
    const fetchVentas = async () => {
      const { data, error } = await supabase
        .from('ventas')
        .select(`
        id, 
        costo_venta,
        clientes (apellidos, nombres, codigo_cliente)
      `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando ventas:', error)
        return
      }

      setVentas(data || []) // Ahora sí encontrará 'setVentas'
    }

    fetchVentas()
  }, [supabase])

async function onSubmit(values: PagoFormValues) {
  setIsLoading(true)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Buscamos la venta seleccionada para obtener los datos del cliente
    const ventaData = ventas.find(v => v.id === values.venta_id)

    if (pago) {
      // MODO EDICIÓN: Solo actualizamos
      const { error } = await supabase
        .from('pagos')
        .update(values)
        .eq('id', pago.id)

      if (error) throw error
    } else {
      // MODO REGISTRO: Insertamos y generamos boleta si se requiere
      const { data: nuevoPago, error } = await supabase
        .from('pagos')
        .insert({
          ...values,
          cliente_id: ventaData?.clientes?.id, // Pasamos el cliente asociado a la venta
          registrado_por: user?.id,
        })
        .select()
        .single() // Obtenemos el registro creado

      if (error) throw error

      // Si el usuario marcó la opción de imprimir
      if (imprimirBoleta && nuevoPago && ventaData?.clientes) {
        await generateReciboPDF(nuevoPago, ventaData.clientes)
      }
    }

    onSuccess()
  } catch (error) {
    console.error('[v0] Form error:', error)
  } finally {
    setIsLoading(false)
  }
}

  return (
<Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="venta_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venta / Contrato</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                // 2. BLOQUEAMOS el selector si estamos editando
                disabled={!!pago} 
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una venta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {/* Si estamos editando y no ha cargado la lista, 
                      podemos mostrar al menos el valor actual */}
                  {ventas.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.clientes?.codigo_cliente} - {v.clientes?.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pago && (
                <p className="text-[0.8rem] text-muted-foreground">
                  La venta asociada no se puede cambiar al editar un pago.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo_pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Pago *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Cuota, Aporte, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto *</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="5000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fecha_pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Pago *</FormLabel>
                <FormControl>
                  <Input {...field} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metodo_pago"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método Pago</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_recibo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Recibo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="RCP-001" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="referencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referencia / Observación</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Detalles adicionales del pago" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : pago ? 'Actualizar' : 'Registrar'}
          </Button>
          
        </div>
        <div className="flex items-center space-x-2 py-4 border-t">
  <input
    type="checkbox"
    id="imprimir"
    checked={imprimirBoleta}
    onChange={(e) => setImprimirBoleta(e.target.checked)}
    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
  />
  <label htmlFor="imprimir" className="text-sm font-medium leading-none">
    Generar boleta de pago automáticamente
  </label>
</div>
      </form>
    </Form >
  )
}
