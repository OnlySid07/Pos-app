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
import { Propiedad, Cliente } from '@/lib/types'

const propiedadSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente requerido'),
  mz: z.string().optional(),
  lote: z.string().optional(),
  sector: z.string().optional(),
  metros_terreno: z.coerce.number().positive().optional(),
  ubicacion: z.string().optional(),
  status: z.enum(['disponible', 'vendida', 'reservada', 'en_construccion']),
})

type PropiedadFormValues = z.infer<typeof propiedadSchema>

interface PropiedadFormProps {
  propiedad?: Propiedad
  onSuccess: () => void
}

export function PropiedadForm({ propiedad, onSuccess }: PropiedadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const supabase = createClient()

  const form = useForm<PropiedadFormValues>({
    resolver: zodResolver(propiedadSchema),
    defaultValues: {
      cliente_id: propiedad?.cliente_id || '',
      mz: propiedad?.mz || '',
      lote: propiedad?.lote || '',
      sector: propiedad?.sector || '',
      metros_terreno: propiedad?.metros_terreno,
      ubicacion: propiedad?.ubicacion || '',
      status: propiedad?.status || 'disponible',
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

  async function onSubmit(values: PropiedadFormValues) {
    setIsLoading(true)

    try {
      if (propiedad) {
        const { error } = await supabase
          .from('propiedades')
          .update(values)
          .eq('id', propiedad.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('propiedades')
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mz"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MZ</FormLabel>
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
                <FormLabel>Lote</FormLabel>
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
            name="sector"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Sector 1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metros_terreno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metros (terreno)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="250.50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ubicacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ubicación</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Coordenadas o dirección" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="vendida">Vendida</SelectItem>
                  <SelectItem value="reservada">Reservada</SelectItem>
                  <SelectItem value="en_construccion">En Construcción</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : propiedad ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
