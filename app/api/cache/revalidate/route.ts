import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ALLOWED_CACHE_TAGS } from '@/lib/cache-tags'

type RevalidateBody = {
  tags?: string[]
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = (await request.json()) as RevalidateBody
    const tags = (body.tags || []).filter((tag) => ALLOWED_CACHE_TAGS.has(tag))

    if (tags.length === 0) {
      return NextResponse.json({ error: 'No se enviaron tags validos' }, { status: 400 })
    }

    for (const tag of tags) {
      revalidateTag(tag)
    }

    return NextResponse.json({ success: true, tags })
  } catch (error) {
    console.error('Error invalidating cache tags:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
