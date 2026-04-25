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
import { Cliente, Costo } from '@/lib/types'

const ventaSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente requerido'),
  tipo_venta: z.enum(['contado', 'financiado', 'mixto']),
  costo_venta: z.coerce.number().positive('Costo debe ser mayor a 0'),
  aporte_cuota_inicial: z.coerce.number().optional(),
  monto_financiar: z.coerce.number().optional(),
  fecha_venta: z.string().optional(),
  num_cuotas: z.coerce.number().int().optional(),
  monto_cuota: z.coerce.number().optional(),
  fecha_contrato: z.string().optional(),
  deuda_mora: z.coerce.number().default(0),
  sobrante: z.coerce.number().default(0),
  observacion: z.string().optional(),
  comision_venta: z.coerce.number().optional(),
})

type VentaFormValues = z.infer<typeof ventaSchema>

interface VentaFormProps {
  venta?: Costo
  onSuccess: () => void
}

export function VentaForm({ venta, onSuccess }: VentaFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const supabase = createClient()

  const form = useForm<VentaFormValues>({
    resolver: zodResolver(ventaSchema),
    defaultValues: {
      cliente_id: venta?.cliente_id || '',
      tipo_venta: venta?.tipo_venta || 'contado',
      costo_venta: venta?.costo_venta,
      aporte_cuota_inicial: venta?.aporte_cuota_inicial,
      monto_financiar: venta?.monto_financiar,
      fecha_venta: venta?.fecha_venta || '',
      num_cuotas: venta?.num_cuotas,
      monto_cuota: venta?.monto_cuota,
      fecha_contrato: venta?.fecha_contrato || '',
      deuda_mora: venta?.deuda_mora || 0,
      sobrante: venta?.sobrante || 0,
      observacion: venta?.observacion || '',
      comision_venta: venta?.comision_venta,
    },
  })

  useEffect(() => {
    const fetchClientes = async () => {
      const { data } = await supabase
        .from('clientes')
        .select('id, apellidos, nombres, codigo_cliente')
        .order('apellidos')

      setClientes(data || [])
    }

    fetchClientes()
  }, [supabase])

  async function onSubmit(values: VentaFormValues) {
    setIsLoading(true)

    try {
      if (venta) {
        const { error } = await supabase
          .from('costos')
          .update(values)
          .eq('id', venta.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('costos')
          .insert(values)

        if (error) throw error
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
          name="cliente_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.codigo_cliente} - {[cliente.apellidos, cliente.nombres].filter(Boolean).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Información de Venta</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipo_venta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Venta *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="contado">Contado</SelectItem>
                      <SelectItem value="financiado">Financiado</SelectItem>
                      <SelectItem value="mixto">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costo_venta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo Venta *</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="500000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Financiamiento</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="aporte_cuota_inicial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aporte / Cuota Inicial</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="100000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto_financiar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a Financiar</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="400000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="num_cuotas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Cuotas</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="120" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="monto_cuota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto de la Cuota</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="3333.33" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Fechas y Estado</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fecha_venta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Venta</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fecha_contrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha Contrato</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Situación de Pago</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="deuda_mora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deuda por Mora</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comision_venta"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pago de Comisión</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" placeholder="0" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="sobrante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobrante</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Notas adicionales" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : venta ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
