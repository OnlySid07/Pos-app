# 👨‍💻 Guía de Desarrollo - Agregar Nuevas Funcionalidades

## Introducción

Este documento explica cómo el proyecto está estructurado y cómo agregar nuevas funcionalidades siguiendo los patrones establecidos.

---

## 📁 Estructura de Carpetas

```
/app                 → Rutas y páginas (Next.js App Router)
/components          → Componentes React reutilizables
/lib                 → Utilidades, tipos, y configuración
/public              → Archivos estáticos
/scripts             → Scripts de setup y utilidad
/styles              → Estilos globales
```

---

## 🔄 Patrón Estándar para Nuevo Módulo

Cuando agregas un nuevo módulo (como Clientes, Propiedades, Ventas), siempre sigue este patrón:

### 1. Crear la Tabla en la Base de Datos

**Archivo**: `/scripts/setup.sql`

```sql
-- Agregar a la sección de CREATE TABLE

CREATE TABLE IF NOT EXISTS nuevo_modulo (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Crear índices
CREATE INDEX idx_nuevo_modulo_user_id ON nuevo_modulo(user_id);
CREATE INDEX idx_nuevo_modulo_estado ON nuevo_modulo(estado);

-- Habilitar RLS
ALTER TABLE nuevo_modulo ENABLE ROW LEVEL SECURITY;

-- Crear políticas
CREATE POLICY "Users can view their own records" ON nuevo_modulo
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM usuarios WHERE id = auth.uid() AND rol = 'admin')
  );
```

### 2. Actualizar Tipos TypeScript

**Archivo**: `/lib/types.ts`

```typescript
export interface NuevoModulo {
  id: number
  user_id: string
  nombre: string
  descripcion?: string
  estado: 'activo' | 'inactivo'
  created_at: string
  updated_at: string
}

export const NuevoModuloSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  estado: z.enum(['activo', 'inactivo']).default('activo'),
})

export type NuevoModuloFormData = z.infer<typeof NuevoModuloSchema>
```

### 3. Crear Página Principal

**Archivo**: `/app/nuevo-modulo/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { NuevoModuloTable } from '@/components/nuevo-modulo/nuevo-modulo-table'
import { CreateNuevoModuloDialog } from '@/components/nuevo-modulo/create-nuevo-modulo-dialog'

export default function NuevoModuloPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar datos
  const loadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('nuevo_modulo')
        .select('*')
      
      if (error) throw error
      setData(data || [])
    } finally {
      setLoading(false)
    }
  }

  // useEffect para cargar al montar
  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nuevo Módulo</h1>
        <CreateNuevoModuloDialog onSuccess={loadData} />
      </div>
      
      <NuevoModuloTable data={data} onRefresh={loadData} />
    </div>
  )
}
```

### 4. Crear Componente Tabla

**Archivo**: `/components/nuevo-modulo/nuevo-modulo-table.tsx`

```typescript
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { EditNuevoModuloDialog } from './edit-nuevo-modulo-dialog'
import { DeleteNuevoModuloDialog } from './delete-nuevo-modulo-dialog'
import type { NuevoModulo } from '@/lib/types'

interface Props {
  data: NuevoModulo[]
  onRefresh: () => Promise<void>
}

export function NuevoModuloTable({ data, onRefresh }: Props) {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nombre}</TableCell>
              <TableCell>{item.descripcion}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-sm ${
                  item.estado === 'activo' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {item.estado}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <EditNuevoModuloDialog item={item} onSuccess={onRefresh} />
                <DeleteNuevoModuloDialog item={item} onSuccess={onRefresh} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

### 5. Crear Formulario

**Archivo**: `/components/nuevo-modulo/nuevo-modulo-form.tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner' // o tu toast solution
import { NuevoModuloSchema, type NuevoModuloFormData } from '@/lib/types'

interface Props {
  item?: any
  onSuccess?: () => Promise<void>
  onCancel?: () => void
}

export function NuevoModuloForm({ item, onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<NuevoModuloFormData>({
    resolver: zodResolver(NuevoModuloSchema),
    defaultValues: item || {},
  })

  const onSubmit = async (data: NuevoModuloFormData) => {
    try {
      const supabase = createClient()

      if (item) {
        // Actualizar
        const { error } = await supabase
          .from('nuevo_modulo')
          .update(data)
          .eq('id', item.id)

        if (error) throw error
        toast.success('Actualizado correctamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('nuevo_modulo')
          .insert([data])

        if (error) throw error
        toast.success('Creado correctamente')
      }

      onSuccess?.()
      onCancel?.()
    } catch (error) {
      console.error('[v0] Error:', error)
      toast.error('Ocurrió un error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <Input
          {...register('nombre')}
          placeholder="Ingrese el nombre"
        />
        {errors.nombre && (
          <span className="text-red-500 text-sm">{errors.nombre.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Input
          {...register('descripcion')}
          placeholder="Ingrese la descripción"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : item ? 'Actualizar' : 'Crear'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
```

### 6. Crear Diálogos (Create, Edit, Delete)

**Archivo**: `/components/nuevo-modulo/create-nuevo-modulo-dialog.tsx`

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { NuevoModuloForm } from './nuevo-modulo-form'

interface Props {
  onSuccess?: () => Promise<void>
}

export function CreateNuevoModuloDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Agregar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Registro</DialogTitle>
          <DialogDescription>
            Completa el formulario para crear un nuevo registro
          </DialogDescription>
        </DialogHeader>
        <NuevoModuloForm
          onSuccess={async () => {
            await onSuccess?.()
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
```

Repite similar para `edit-nuevo-modulo-dialog.tsx` y `delete-nuevo-modulo-dialog.tsx`.

---

## 🎨 Patrones de Styling

Todo el proyecto usa **Tailwind CSS v4** con **shadcn/ui components**.

### Ejemplo de Componente Estilizado

```typescript
export function MiComponente() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Título</CardTitle>
          </CardHeader>
          <CardContent>
            Contenido del card
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Clases Tailwind Comunes

```
Spacing: p-4, m-2, gap-2, space-y-4
Flexbox: flex, items-center, justify-between
Grid: grid, grid-cols-2, gap-4
Colors: bg-blue-500, text-white, border-gray-200
Responsive: md:grid-cols-2, lg:p-8
```

---

## 📝 Validación de Datos

Usamos **Zod** para validación. Ejemplo:

```typescript
import { z } from 'zod'

export const ClienteSchema = z.object({
  codigo: z.string().min(1, 'Código requerido'),
  nombre: z.string().min(1, 'Nombre requerido'),
  dni: z.string().regex(/^\d{8}$/, 'DNI debe tener 8 dígitos'),
  email: z.string().email('Email inválido').optional(),
  telefono: z.string().min(7, 'Teléfono inválido').optional(),
})
```

---

## 🔗 Integración con Supabase

### Crear Cliente

```typescript
const supabase = createClient()
const { data, error } = await supabase
  .from('tabla')
  .insert([{ campo: 'valor' }])
```

### Leer Datos

```typescript
const { data, error } = await supabase
  .from('tabla')
  .select('*')
  .eq('estado', 'activo')
  .order('created_at', { ascending: false })
```

### Actualizar

```typescript
const { error } = await supabase
  .from('tabla')
  .update({ campo: 'nuevo_valor' })
  .eq('id', id)
```

### Eliminar

```typescript
const { error } = await supabase
  .from('tabla')
  .delete()
  .eq('id', id)
```

---

## 🧪 Debugging

Usa `console.log` con prefijo `[v0]`:

```typescript
console.log('[v0] Cliente creado:', cliente)
console.log('[v0] Error:', error)
console.log('[v0] Datos:', data)
```

Abre F12 en el navegador para ver los logs.

---

## 📱 Responsive Design

El proyecto es responsive. Para componentes específicos:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items aquí */}
</div>
```

---

## 🚀 Deployment

El proyecto se deploya automáticamente a Vercel cuando haces push a GitHub:

1. Edita archivos localmente
2. `git add .`
3. `git commit -m "Descripción"`
4. `git push`
5. Vercel deploya automáticamente
6. Tu app se actualiza en 1-2 minutos

---

## 📊 Agregar Reportes

Los reportes van en `/lib/reports/`:

```typescript
// /lib/reports/nuevo-reporte.ts

import jsPDF from 'jspdf'

export function generateReporte(datos: any[]) {
  const doc = new jsPDF()
  
  doc.setFontSize(16)
  doc.text('Mi Reporte', 20, 20)
  
  // Agregar contenido
  let y = 40
  datos.forEach(item => {
    doc.text(`${item.nombre}: ${item.valor}`, 20, y)
    y += 10
  })
  
  doc.save('reporte.pdf')
}
```

---

## ✅ Checklist para Nuevo Módulo

- [ ] Crear tabla en SQL
- [ ] Agregar tipos en `types.ts`
- [ ] Crear página en `/app/nuevo-modulo/page.tsx`
- [ ] Crear componentes en `/components/nuevo-modulo/`
  - [ ] Tabla
  - [ ] Formulario
  - [ ] Diálogos (crear, editar, eliminar)
- [ ] Actualizar sidebar en `components/layout/sidebar.tsx`
- [ ] Probar crear, editar, eliminar
- [ ] Hacer commit y push

---

## 🐛 Solución de Problemas Comunes

### "No veo mi nuevo módulo en el sidebar"
→ Actualiza `/components/layout/sidebar.tsx` y agrega el link

### "Los datos no se guardan"
→ Verifica que ejecutaste el SQL en Supabase

### "Tengo errores de TypeScript"
→ Asegúrate de agregar tipos en `/lib/types.ts`

### "El formulario no valida"
→ Verifica que usaste el schema correcto con Zod

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)

---

**¡Ahora estás listo para agregar nuevas funcionalidades!**
