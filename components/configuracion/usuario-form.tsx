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
import { Checkbox } from '@/components/ui/checkbox'
import { User } from '@/lib/types'

const usuarioSchema = z.object({
  full_name: z.string().min(1, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'asesor', 'finanzas', 'gerencia']),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
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
const [changePassword, setChangePassword] = useState(false)
  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      full_name: usuario?.full_name || '',
      email: usuario?.email || '',
      role: usuario?.role || 'asesor',
      password: '',
    },
  })

// ... dentro de tu función onSubmit
// Dentro de components/configuracion/usuario-form.tsx

async function onSubmit(values: UsuarioFormValues) {
  setIsLoading(true)
  setError(null)

  try {
if (usuario) {
        // MODO EDICIÓN
        const updatePayload: any = {
          id: usuario.id,
          full_name: values.full_name,
          email: values.email,
          role: values.role,
        }

        // Solo si marcaron la casilla, intentamos actualizar la contraseña
        if (changePassword) {
          if (!values.password || values.password.length < 6) {
            setError("La nueva contraseña debe tener al menos 6 caracteres")
            setIsLoading(false)
            return
          }
          updatePayload.password = values.password
        }

        const response = await fetch('/api/usuarios', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        })

        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Error al actualizar usuario')

      } else {
      // ==========================================
      // MODO CREACIÓN: Llama a la API con POST
      // ==========================================
      if (!values.password) {
        throw new Error('Contraseña requerida para nuevo usuario')
      }

      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear usuario')
      }
    }

    // Si todo salió bien, cerramos el modal y recargamos
    onSuccess()
  } catch (err: any) {
    setError(err.message || 'Error al guardar usuario')
    console.error('[v0] Form error:', err)
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

        
 {/* CHECKBOX PARA CAMBIAR CONTRASEÑA (SOLO SE MUESTRA AL EDITAR) */}
        {usuario && (
          <div className="flex items-center space-x-2 pt-2 pb-2">
            <Checkbox 
              id="change-password" 
              checked={changePassword} 
              onCheckedChange={(checked) => setChangePassword(checked as boolean)} 
            />
            <label
              htmlFor="change-password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Quiero modificar la contraseña
            </label>
          </div>
        )}

        {/* INPUT DE CONTRASEÑA (SIEMPRE AL CREAR, O SI SE MARCA EL CHECKBOX AL EDITAR) */}
        {(!usuario || changePassword) && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{usuario ? 'Nueva Contraseña *' : 'Contraseña *'}</FormLabel>
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
