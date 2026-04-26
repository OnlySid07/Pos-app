'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
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
import { Cliente } from '@/lib/types'
import { useEffect, useState } from 'react'

const clienteSchema = z.object({
  mz: z.string().min(1, 'MZ requerida'),
  lote: z.string().min(1, 'Lote requerido'),
  codigo_cliente: z.string().min(1, 'Código requerido'),
  apellidos: z.string().min(1, 'Apellidos requeridos'),
  nombres: z.string().min(1, 'Nombres requeridos'),
  tipo_documento: z.enum(['dni', 'ruc', 'pasaporte', 'otro']),
  dni: z.string().min(1, 'DNI requerido'),
  estado_civil: z.enum(['soltero', 'casado', 'divorciado', 'viudo', 'conviviente']).optional(),
  telefonos: z.string().optional(),
  correo: z.string().email('Email inválido').optional().or(z.literal('')),
  direccion: z.string().optional(),
  departamento: z.string().optional(),
  provincia: z.string().optional(),
  distrito: z.string().optional(),
  empresa_facturacion: z.string().optional(),
  grupo_inmobiliario: z.string().optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: Cliente
  onSuccess: () => void
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      mz: cliente?.mz || '',
      lote: cliente?.lote || '',
      codigo_cliente: cliente?.codigo_cliente || '',
      apellidos: cliente?.apellidos || '',
      nombres: cliente?.nombres || '',
      tipo_documento: cliente?.tipo_documento || 'dni',
      dni: cliente?.dni || '',
      estado_civil: cliente?.estado_civil,
      telefonos: cliente?.telefonos || '',
      correo: cliente?.correo || '',
      direccion: cliente?.direccion || '',
      departamento: cliente?.departamento || '',
      provincia: cliente?.provincia || '',
      distrito: cliente?.distrito || '',
      empresa_facturacion: cliente?.empresa_facturacion || '',
      grupo_inmobiliario: cliente?.grupo_inmobiliario || '',
    },
  })

  const mzValue = form.watch('mz')
  const dniValue = form.watch('dni')
  const loteValue = form.watch('lote')

  useEffect(() => {
    const mz = (mzValue || '').trim().toUpperCase()
    const dni = (dniValue || '').trim()
    const lote = (loteValue || '').trim()
    const codigo = [mz, dni, lote].filter(Boolean).join('')

    if (form.getValues('codigo_cliente') !== codigo) {
      form.setValue('codigo_cliente', codigo, { shouldValidate: true })
    }
  }, [mzValue, dniValue, loteValue, form])

  async function onSubmit(values: ClienteFormValues) {
    setIsLoading(true)

    try {
      if (cliente) {
        // Update
        const { error } = await supabase
          .from('clientes')
          .update(values)
          .eq('id', cliente.id)

        if (error) throw error
      } else {
        // Create
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { error } = await supabase
          .from('clientes')
          .insert({
            ...values,
            asesor_id: user?.id,
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
        {/* Información Básica */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Información Básica</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MZ *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lote *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="codigo_cliente"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Código Cliente *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="MZ-DNI-LOTE" readOnly />
                  </FormControl>
                  <FormDescription>
                    Se genera automáticamente con MZ + DNI + Lote.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="apellidos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellidos *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Pérez García" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nombres"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombres *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Juan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Documentación */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Documentación</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipo_documento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Documento *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="dni">DNI</SelectItem>
                      <SelectItem value="ruc">RUC</SelectItem>
                      <SelectItem value="pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI/RUC *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="12345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información Personal */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Información Personal</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="estado_civil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado Civil</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero</SelectItem>
                      <SelectItem value="casado">Casado</SelectItem>
                      <SelectItem value="divorciado">Divorciado</SelectItem>
                      <SelectItem value="viudo">Viudo</SelectItem>
                      <SelectItem value="conviviente">Conviviente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="telefonos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfonos</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="987654321 / 912345678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="cliente@example.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dirección */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Dirección</h3>

          <FormField
            control={form.control}
            name="direccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Calle 123, Apartamento 4B" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Departamento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Lima" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provincia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Lima" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="distrito"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distrito</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Miraflores" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Información Inmobiliaria */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Información Inmobiliaria</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="empresa_facturacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa de Facturación</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nombre empresa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grupo_inmobiliario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo Inmobiliario</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Grupo A" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : cliente ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
