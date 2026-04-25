import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserAndRole() {
  const supabase = await createClient()

  // 1. Obtener usuario autenticado
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // 2. Obtener rol de la base de datos
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError) {
    console.error('Error fetching role:', roleError)
  }

  return {
    user,
    role: userData?.role || 'asesor', // Rol por defecto si hay un error
    supabase
  }
}
