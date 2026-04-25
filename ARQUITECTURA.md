# 🏗️ Arquitectura - Fair Sistema de Gestión Inmobiliaria

## Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR DEL USUARIO                     │
│  (Chrome, Firefox, Safari, Edge en Desktop/Mobile)               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NEXT.JS 16 (VERCEL)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  App Router - Rutas y Páginas                          │   │
│  │  ├─ /login          → Autenticación                    │   │
│  │  ├─ /dashboard      → Panel principal                  │   │
│  │  ├─ /clientes       → Gestión de clientes              │   │
│  │  ├─ /propiedades    → Gestión de propiedades           │   │
│  │  ├─ /ventas         → Gestión de ventas                │   │
│  │  ├─ /caja-pagos     → Control de cobranza              │   │
│  │  ├─ /reportes       → Generación de reportes           │   │
│  │  └─ /configuracion  → Admin panel                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────┬──────────────────────────────────┐   │
│  │   COMPONENTES (React)│  API ROUTES (Server)            │   │
│  │  ├─ Login Form       │  ├─ /api/admin/init-db         │   │
│  │  ├─ Sidebar          │  └─ Más rutas por venir...      │   │
│  │  ├─ Tablas           │                                  │   │
│  │  ├─ Formularios      │                                  │   │
│  │  ├─ Diálogos         │                                  │   │
│  │  └─ Reportes         │                                  │   │
│  └──────────────────────┴──────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LIBRERÍAS CORE                                         │   │
│  │  ├─ @supabase/supabase-js  → Cliente para BD y Auth    │   │
│  │  ├─ react-hook-form        → Gestión de formularios    │   │
│  │  ├─ zod                    → Validación de datos       │   │
│  │  ├─ recharts               → Gráficos                  │   │
│  │  ├─ jspdf                  → Generación de PDF         │   │
│  │  └─ xlsx                   → Generación de Excel       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  MIDDLEWARE/PROXY                                       │   │
│  │  └─ proxy.ts → Protege rutas autenticadas              │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┬───────────┘
                 │                                    │
                 ▼                                    ▼
    ┌──────────────────────────┐      ┌─────────────────────────┐
    │   SUPABASE              │      │  TAILWIND CSS + shadcn │
    │  (Base de Datos)        │      │   (Styling)             │
    │                         │      └─────────────────────────┘
    │  ┌──────────────────┐  │
    │  │  PostgreSQL DB   │  │      ┌──────────────────────────┐
    │  │                  │  │      │   TIPADO TYPESCRIPT     │
    │  │  Tablas:         │  │      │  - types.ts             │
    │  │  - users         │  │      │  - Validación con Zod   │
    │  │  - clientes      │  │      │  - Type safety 100%     │
    │  │  - propiedades   │  │      └──────────────────────────┘
    │  │  - ventas        │  │
    │  │  - costos        │  │
    │  │  - pagos         │  │
    │  │  - etc           │  │
    │  └──────────────────┘  │
    │                         │
    │  ┌──────────────────┐  │
    │  │  Authentication  │  │
    │  │  - JWT Tokens    │  │
    │  │  - Sessions      │  │
    │  └──────────────────┘  │
    │                         │
    │  ┌──────────────────┐  │
    │  │  Row Level       │  │
    │  │  Security (RLS)  │  │
    │  │  - Protege datos │  │
    │  │  - Por usuario   │  │
    │  └──────────────────┘  │
    └──────────────────────────┘
```

---

## Flujo de Autenticación

```
Usuario abre la app
        │
        ▼
┌───────────────────┐
│ Middleware/Proxy  │ → Verifica si hay sesión JWT
└────────┬──────────┘
         │
     ¿Autenticado?
        / \
       /   \
      NO   SÍ
     /       \
    ▼         ▼
  /login    /dashboard
    │         │
    ▼         ▼
Login Form   ✅ Acceso permitido
    │
    ├─ Email + Password
    │
    ▼
Supabase Auth
    │
    ├─ Valida credenciales
    │
    ▼
Genera JWT Token
    │
    ├─ Se guarda en cookie
    │
    ▼
Redirige a /dashboard
```

---

## Flujo de Datos - Crear Cliente

```
Usuario en Componente ClienteForm
        │
        ▼
┌──────────────────────┐
│ React Hook Form      │
│ + Zod Validation     │
└────────┬─────────────┘
         │
         ├─ Valida email, DNI, etc
         │
    ¿Válido?
    / \
   /   \
  NO   SÍ
 /       \
▼         ▼
Error   Submit a Supabase
msg     
         │
         ▼
    ┌──────────────────┐
    │  Supabase Client │
    │  .insert('       │
    │   clientes')     │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  PostgreSQL DB   │
    │  (INSERT)        │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  RLS Policy      │
    │  Verifica permisos│
    └────────┬─────────┘
             │
    ¿Usuario puede crear?
    / \
   /   \
  NO   SÍ
 /       \
▼         ▼
Error   INSERT exitoso
msg     
         │
         ▼
    Refetch de datos
         │
         ▼
    Actualiza tabla
         │
         ▼
    Toast de éxito
```

---

## Modelo de Base de Datos

```
┌──────────────────┐
│     users        │ (Supabase Auth)
│                  │
│ - id (UUID)      │
│ - email          │
│ - password       │
│ - role           │
│ - created_at     │
└────────┬─────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────┐         ┌──────────────────┐
│    clientes      │────────▶│  propiedades     │
│                  │ 1:N     │                  │
│ - id (PK)        │         │ - id (PK)        │
│ - codigo         │         │ - cliente_id (FK)│
│ - nombre         │         │ - direccion      │
│ - apellido       │         │ - metros         │
│ - dni            │         │ - status         │
│ - email          │         │ - created_at     │
│ - telefono       │         └────────┬─────────┘
│ - direccion      │                  │
│ - asesor_id (FK) │                  │ 1:N
│ - created_at     │                  │
└────────┬─────────┘                  ▼
         │          ┌──────────────────┐
         │          │      ventas      │
         │     ────▶│                  │
         │    /     │ - id (PK)        │
         │   /      │ - cliente_id (FK)│
         │  /       │ - propiedad_id   │
         └─────────▶│ - costo          │
            1:N     │ - aporte_inicial │
                    │ - plazo_entrega  │
                    │ - created_at     │
                    └────────┬─────────┘
                             │
                             │ 1:N
                             │
                             ▼
                    ┌──────────────────┐
                    │      pagos       │
                    │                  │
                    │ - id (PK)        │
                    │ - venta_id (FK)  │
                    │ - monto          │
                    │ - fecha_pago     │
                    │ - forma_pago     │
                    │ - created_at     │
                    └──────────────────┘
```

---

## Permisos y Row Level Security

```
┌─────────────────────────────────────────┐
│       TABLA: clientes                   │
│                                         │
│  RLS POLICY: Lectura por usuario        │
│  ┌──────────────────────────────────┐  │
│  │ SELECT permitido si:             │  │
│  │ - Usuario es Admin, O            │  │
│  │ - Cliente pertenece al usuario   │  │
│  │   (asesor_id = user_id)          │  │
│  └──────────────────────────────────┘  │
│                                         │
│  RLS POLICY: Crear                      │
│  ┌──────────────────────────────────┐  │
│  │ INSERT permitido si:             │  │
│  │ - Usuario es Admin, O            │  │
│  │ - Usuario es Asesor              │  │
│  │ - Establece asesor_id = user_id  │  │
│  └──────────────────────────────────┘  │
│                                         │
│  RLS POLICY: Actualizar                 │
│  ┌──────────────────────────────────┐  │
│  │ UPDATE permitido si:             │  │
│  │ - Usuario es Admin, O            │  │
│  │ - Cliente.asesor_id = user_id    │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│       TABLA: pagos                      │
│                                         │
│  RLS POLICY: Lectura                    │
│  ┌──────────────────────────────────┐  │
│  │ SELECT permitido si:             │  │
│  │ - Usuario es Admin, O            │  │
│  │ - Usuario es Finanzas, O         │  │
│  │ - Pago.venta.cliente.asesor_id   │  │
│  │   = user_id                      │  │
│  └──────────────────────────────────┘  │
│                                         │
│  RLS POLICY: Crear                      │
│  ┌──────────────────────────────────┐  │
│  │ INSERT permitido si:             │  │
│  │ - Usuario es Admin, O            │  │
│  │ - Usuario es Finanzas            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Stack Tecnológico Completo

```
┌─────────────────────────────────────────────┐
│        INTERFAZ DE USUARIO (Frontend)       │
├─────────────────────────────────────────────┤
│ React 19 → Componentes funcionales          │
│ Next.js 16 → Framework SSR/SSG              │
│ Tailwind CSS v4 → Utilidades CSS            │
│ shadcn/ui → Componentes base pre-diseñados  │
│ React Hook Form → Gestión de formularios    │
│ Zod → Validación de esquemas                │
│ Recharts → Gráficos (futuro)                │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│      MIDDLEWARE Y SERVIDOR (Backend)        │
├─────────────────────────────────────────────┤
│ Node.js → Runtime                           │
│ Next.js API Routes → Endpoints REST         │
│ TypeScript → Tipado estático                │
│ Supabase SDK → Cliente DB/Auth              │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│      AUTENTICACIÓN Y BASE DE DATOS          │
├─────────────────────────────────────────────┤
│ Supabase Auth → JWT, Sessions               │
│ PostgreSQL → Base de datos relacional       │
│ Row Level Security → Control de acceso      │
│ Índices → Optimización de queries           │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│      GENERACIÓN DE REPORTES                 │
├─────────────────────────────────────────────┤
│ jsPDF → Generación de PDF                   │
│ XLSX → Generación de Excel                  │
│ React Components → Contenido dinamico       │
└─────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│      DESPLIEGUE Y HOSTING                   │
├─────────────────────────────────────────────┤
│ Vercel → Hosting y CI/CD                    │
│ GitHub → Versionamiento                     │
└─────────────────────────────────────────────┘
```

---

## Componentes Reutilizables

```
/components
│
├─ /ui (shadcn/ui - Pre-diseñados)
│  ├─ button.tsx
│  ├─ card.tsx
│  ├─ dialog.tsx
│  ├─ input.tsx
│  ├─ form.tsx
│  └─ ...más
│
├─ /auth
│  └─ login-form.tsx
│
├─ /layout
│  ├─ sidebar.tsx
│  ├─ header.tsx
│  └─ ...más
│
├─ /clientes
│  ├─ clientes-table.tsx (Tabla)
│  ├─ cliente-form.tsx (Formulario)
│  ├─ create-cliente-dialog.tsx
│  ├─ edit-cliente-dialog.tsx
│  └─ delete-cliente-dialog.tsx
│
├─ /propiedades (Patrón similar)
│  ├─ propiedades-table.tsx
│  ├─ propiedad-form.tsx
│  ├─ create-propiedad-dialog.tsx
│  ├─ edit-propiedad-dialog.tsx
│  └─ delete-propiedad-dialog.tsx
│
├─ /ventas (Patrón similar)
│
├─ /caja-pagos (Patrón similar)
│
├─ /reportes
│  └─ reportes-content.tsx
│
└─ /configuracion (Patrón similar)
```

---

## Patrones de Diseño Utilizados

### 1. **Compound Components Pattern**
```tsx
<Dialog>
  <DialogTrigger>Crear</DialogTrigger>
  <DialogContent>
    <Form>...</Form>
  </DialogContent>
</Dialog>
```

### 2. **Form with Validation Pattern**
```tsx
useForm({
  resolver: zodResolver(schema),
})
```

### 3. **Table with Actions Pattern**
```tsx
<Table>
  {items.map(item => (
    <TableRow>
      <TableCell>{item.name}</TableCell>
      <TableCell>
        <EditDialog item={item} />
        <DeleteDialog item={item} />
      </TableCell>
    </TableRow>
  ))}
</Table>
```

### 4. **Dialog as Modal Pattern**
Para crear, editar y eliminar en modales reutilizables.

---

## Optimizaciones Implementadas

- ✅ **Índices en BD**: Para búsquedas rápidas
- ✅ **RLS en DB**: Reduce datos innecesarios
- ✅ **Next.js Image Optimization**: Si hay imágenes
- ✅ **Code Splitting**: Rutas lazy-loaded
- ✅ **TypeScript**: Errores detectados en build time
- ✅ **Component Memoization**: Previene re-renders innecesarios

---

## Seguridad Implementada

```
Cliente Browser
    │ (HTTPS)
    ▼
Next.js Server
    │
    ├─ Middleware valida JWT
    │
    ├─ Redirige a /login si no autenticado
    │
    └─ Permite acceso a ruta
        │
        ▼
    Supabase Client
        │
        ├─ Valida token JWT
        │
        ├─ Ejecuta query en BD
        │
        ▼
    PostgreSQL
        │
        ├─ Aplica RLS policy
        │
        ├─ Verifica si usuario puede acceder
        │
        └─ Retorna datos (o error si no autorizado)
```

---

## Flujo de Despliegue

```
Cambios en código
        │
        ▼
Push a GitHub
        │
        ▼
Vercel detecta cambio
        │
        ▼
Deploy automático
        │
├─ Instala dependencias
├─ Ejecuta build
├─ Corre tests (si existen)
└─ Publica a producción
        │
        ▼
URL en vivo: https://tu-app.vercel.app
```

---

## Escalabilidad

El proyecto está diseñado para crecer:

1. **Agregar nuevas tablas**: Modifica `/scripts/setup.sql`
2. **Agregar nuevos módulos**: Crea `/app/nuevo-modulo`
3. **Agregar validaciones**: Actualiza `/lib/types.ts`
4. **Agregar reportes**: Crea en `/lib/reports/`
5. **Agregar componentes**: Crea en `/components/`

Todos siguen el mismo patrón, facilitando el mantenimiento.

---

**Arquitectura completamente documentada y lista para escalar**
