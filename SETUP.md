# Setup - Fair Sistema de Gestión Inmobiliaria

## Configuración Inicial

### 1. Variables de Entorno
El proyecto ya está configurado con Supabase. Las variables de entorno se cargan automáticamente desde Vercel.

Verifica que en tu proyecto Vercel tengas configuradas:
- `NEXT_PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio de Supabase

### 2. Inicializar la Base de Datos

#### Opción A: Ejecutar SQL manualmente en Supabase (RECOMENDADO)

1. Ve a tu dashboard de Supabase
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Crea una nueva query
5. Copia todo el contenido de `/scripts/setup.sql`
6. Ejecuta la query

Esto creará todas las tablas, índices, y políticas de Row Level Security necesarias.

#### Opción B: Usar la API de inicialización (En desarrollo)

```bash
curl -X POST http://localhost:3000/api/admin/init-db
```

### 3. Crear el Primer Usuario (Admin)

Una vez que la BD esté lista, crea un usuario admin directamente en Supabase:

1. Ve a **Authentication** → **Users** en tu dashboard de Supabase
2. Haz clic en **Create user**
3. Usa un email de test (ej: admin@fair.local)
4. Establece una contraseña

Luego, actualiza el rol del usuario en la tabla `users`:

```sql
UPDATE users 
SET role = 'admin', full_name = 'Administrador' 
WHERE email = 'admin@fair.local';
```

### 4. Ejecutar la Aplicación Localmente

```bash
pnpm install
pnpm dev
```

Abre http://localhost:3000 y verás la página de login.

## Estructura de Roles

| Rol | Permisos |
|-----|----------|
| **admin** | Acceso total a todo el sistema, gestión de usuarios |
| **asesor** | Crear/editar clientes asignados, ver propiedades y ventas relacionadas |
| **finanzas** | Ver y gestionar todos los pagos y caja, generar reportes |
| **gerencia** | Ver reportes y estadísticas (solo lectura) |

## Estructura de la Aplicación

```
/app
  /login              - Página de login
  /dashboard          - Dashboard principal
  /clientes           - Gestión de clientes
  /propiedades        - Gestión de propiedades
  /ventas             - Gestión de costos y ventas
  /caja-pagos         - Gestión de pagos y caja
  /reportes           - Reportes y exportación
  /configuracion      - Panel de administración
  /api/admin/init-db  - API para inicializar BD

/components
  /auth              - Componentes de autenticación
  /layout            - Componentes de layout (sidebar)
  /clientes          - Componentes de clientes
  /propiedades       - Componentes de propiedades
  /ventas            - Componentes de ventas
  /caja-pagos        - Componentes de pagos
  /reportes          - Componentes de reportes
  /configuracion     - Componentes de administración

/lib
  /supabase          - Cliente de Supabase
  /types             - Tipos TypeScript
  /reports           - Generadores de reportes (PDF, Excel)
```

## Campos Principales

### Clientes
- Código de cliente, lote entregado
- Apellidos y nombres
- Tipo de documento, DNI
- Estado civil, teléfono, correo
- Dirección, departamento, provincia, distrito
- Empresa de facturación
- MZ, lote, sector, metros, ubicación
- Asesor, grupo inmobiliario
- Pago de comisión por venta
- Tipo de venta

### Propiedades
- Medidas de la vivienda
- Status de la vivienda
- Plazo de entrega
- Adicionales

### Ventas / Costos
- Costo de venta
- Aporte cuota inicial
- Monto a financiar
- Fecha de venta
- Número de cuotas
- Monto de la cuota
- Fecha de contrato
- Deuda por mora
- Sobrante
- Observación

### Pagos / Caja
- Tipo de pago
- Monto
- Fecha de pago
- Método de pago
- Referencia
- Observación
- Usuario que registró

## Funcionalidades Implementadas

✅ Autenticación con Supabase Auth
✅ Dashboard con sidebar navegable
✅ CRUD completo de clientes
✅ CRUD de propiedades
✅ CRUD de ventas/costos
✅ CRUD de pagos/caja
✅ Reportes de ventas (PDF)
✅ Reportes de cobranza (Excel)
✅ Panel de administración de usuarios
✅ Row Level Security (RLS)
✅ Validación con Zod + React Hook Form
✅ Interfaz responsive con shadcn/ui

## Próximas Mejoras (Opcional)

- [ ] Exportar a Excel con múltiples hojas
- [ ] Gráficos de ventas y cobranza
- [ ] Búsqueda y filtros avanzados
- [ ] Historial de cambios (audit log)
- [ ] Notificaciones en tiempo real
- [ ] Sincronización de datos offline
- [ ] Integración con WhatsApp para notificaciones
- [ ] Sistema de comisiones automático

## Troubleshooting

### Error: "Missing Supabase configuration"
Verifica que las variables de entorno estén configuradas en Vercel.

### Error: "Role-based access denied"
Verifica que el usuario tenga el rol correcto en la tabla `users`.

### Las tablas no se crean
Ejecuta manualmente el SQL de `/scripts/setup.sql` en Supabase SQL Editor.

### Errores de RLS (Row Level Security)
Los errores de RLS son normales si:
- El usuario no tiene el rol adecuado
- Intentas acceder a datos que no te pertenecen
Revisa la tabla `users` y verifica el rol del usuario autenticado.
