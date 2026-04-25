'use client'

import { useState } from 'react'
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
import { User } from '@/lib/types'

const usuarioSchema = z.object({
  full_name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'asesor', 'finanzas', 'gerencia']),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
})

type UsuarioFormValues = z.infer<typeof usuarioSchema>

interface UsuarioFormProps {
  usuario?: User
  onSuccess: () => void
}

export function UsuarioForm({ usuario, onSuccess }: UsuarioFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      full_name: usuario?.full_name || '',
      email: usuario?.email || '',
      role: usuario?.role || 'asesor',
      password: '',
    },
  })

async function onSubmit(values: UsuarioFormValues) {
  setIsLoading(true)
  setError(null)

  try {
    if (usuario) {
      // Actualización (Esto sigue igual)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: values.full_name,
          role: values.role,
        })
        .eq('id', usuario.id)

      if (updateError) throw updateError
    } else {
      // CREACIÓN DE NUEVO USUARIO
      if (!values.password) throw new Error('Contraseña requerida')

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          // AQUÍ enviamos los datos para que el TRIGGER los reciba
          data: {
            full_name: values.full_name,
            role: values.role,
          },
        },
      })

      if (authError) throw authError

      // ¡IMPORTANTE!: Ya NO hagas el .from('users').insert(...) 
      // El trigger de la base de datos ya lo hizo por ti.
    }

    onSuccess()
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error al guardar usuario')
  } finally {
    setIsLoading(false)
  }
}

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Juan Pérez" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="usuario@ejemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!usuario && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña *</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rol *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="asesor">Asesor</SelectItem>
                  <SelectItem value="finanzas">Finanzas</SelectItem>
                  <SelectItem value="gerencia">Gerencia</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : usuario ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
