import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ============================================================================
// FUNCIÓN AUXILIAR: Inicializa el cliente Admin sin afectar la sesión actual
// ============================================================================
function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("El servidor no tiene configurada la llave maestra (Service Role)")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ============================================================================
// 1. CREAR USUARIO (POST)
// ============================================================================
export async function POST(request: Request) {
  try {
    const { email, password, full_name, role } = await request.json()
    const supabaseAdmin = getAdminClient()

    // Crea el usuario en auth.users y le pasa los metadatos al trigger
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, role },
      email_confirm: true,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Error al crear usuario:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// ============================================================================
// 2. ACTUALIZAR USUARIO (PATCH)
// ============================================================================
export async function PATCH(request: Request) {
  try {
    const { id, email, password, full_name, role } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const supabaseAdmin = getAdminClient()

    // A) Preparamos los datos de autenticación que van a cambiar
    const authUpdateData: any = {
      user_metadata: { full_name, role }
    }
    if (email) authUpdateData.email = email
    if (password) authUpdateData.password = password // Si se envía una nueva contraseña

    // B) Actualizamos en auth.users
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      id, 
      authUpdateData
    )
    
    if (authError) throw authError

    // C) Actualizamos los datos en tu tabla pública 'users'
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ full_name, role, email })
      .eq('id', id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// ============================================================================
// 3. ELIMINAR USUARIO (DELETE)
// ============================================================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 })
    }

    const supabaseAdmin = getAdminClient()

    // Al borrar de auth.admin, el ON DELETE CASCADE en tu base de datos 
    // borra automáticamente el perfil de la tabla public.users
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error al eliminar usuario:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}