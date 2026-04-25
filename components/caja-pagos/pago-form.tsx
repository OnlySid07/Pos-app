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

const pagoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente requerido'),
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
  const [clientes, setClientes] = useState<Cliente[]>([])
  const supabase = createClient()

  const form = useForm<PagoFormValues>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      cliente_id: pago?.cliente_id || '',
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
    const fetchClientes = async () => {
      const { data } = await supabase
        .from('clientes')
        .select('id, apellidos, nombres, codigo_cliente')
        .order('apellidos')

      setClientes(data || [])
    }

    fetchClientes()
  }, [supabase])

  async function onSubmit(values: PagoFormValues) {
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (pago) {
        const { error } = await supabase
          .from('caja_pagos')
          .update(values)
          .eq('id', pago.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('caja_pagos')
          .insert({
            ...values,
            registrado_por: user?.id,
          })

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
      </form>
    </Form>
  )
}
