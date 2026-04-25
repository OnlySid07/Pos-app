# Fair - Sistema de Gestión Inmobiliaria

## 📋 Descripción General

**Fair** es un sistema integral de gestión de clientes, propiedades y ventas para empresas inmobiliarias. Permite gestionar toda la información de clientes, propiedades, condiciones de venta, costos y cobranza en un único lugar.

---

## 🎯 Características Principales

### 1. **Gestión de Clientes**
- Registro completo de información del cliente
- Campos: código, nombres, tipo documento, DNI, estado civil, teléfonos, email, dirección, departamento, provincia, distrito, empresa de facturación, grupo inmobiliario
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Filtrado por asesor asignado

### 2. **Gestión de Propiedades**
- Registro de propiedades asociadas a clientes
- Información: MZ, lote, sector, metros de terreno, ubicación, status
- Estados: Disponible, Vendida, Reservada, En Construcción
- CRUD completo

### 3. **Gestión de Ventas**
- Registro de condiciones de venta
- Información de costos y financiamiento:
  - Tipo de venta: Contado, Financiado, Mixto
  - Costo de venta
  - Aporte / Cuota inicial
  - Monto a financiar
  - Número de cuotas y monto de cuota
  - Fechas (venta, contrato, plazo entrega)
  - Deuda por mora, sobrante, observaciones
  - Comisión por venta

### 4. **Caja y Pagos**
- Registro de pagos y cobranza
- Información: tipo de pago, monto, fecha, método, número de recibo
- Estados: Pendiente, Confirmado, Cancelado
- Estadísticas de cobranza en tiempo real

### 5. **Reportes**
- Reporte de Ventas (con PDF exportable)
- Reporte de Cobranza (con PDF exportable)
- Estadísticas de transacciones

### 6. **Configuración (Admin)**
- Administración de usuarios
- Gestión de roles y permisos
- CRUD de usuarios

---

## 🔐 Sistema de Autenticación y Roles

### Roles Disponibles

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total al sistema, gestión de usuarios, todas las secciones |
| **Asesor** | CRUD clientes y propiedades propios, ver ventas y pagos asignados |
| **Finanzas** | Ver y editar caja/pagos, acceso a reportes de cobranza |
| **Gerencia** | Vista resumida con reportes, no puede modificar datos |

### Row Level Security (RLS)
- Los asesores solo ven clientes asignados a ellos
- Personal de finanzas ve todos los pagos
- Gerencia tiene acceso de solo lectura

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

```sql
-- usuarios (users)
id, auth_id, email, full_name, role, active, created_at

-- clientes
id, codigo_cliente, apellidos_nombres, tipo_documento, dni, 
estado_civil, telefono1, telefono2, email, direccion, 
departamento, provincia, distrito, empresa_facturacion, 
asesor_id, grupo_inmobiliario, created_by, created_at

-- propiedades
id, cliente_id, mz, lote, sector, metros_terreno, 
ubicacion, status, created_at

-- costos (ventas)
id, cliente_id, tipo_venta, costo_venta, aporte_cuota_inicial,
monto_financiar, fecha_venta, num_cuotas, monto_cuota,
fecha_contrato, deuda_mora, sobrante, observacion,
comision_venta, created_at

-- caja_pagos
id, cliente_id, tipo_pago, monto, fecha_pago, numero_recibo,
metodo_pago, referencia, estado, registrado_por, created_at

-- condiciones_venta (complementaria)
id, cliente_id, propiedades_id, metros_vivienda,
status_vivienda, plazo_entrega, created_at
```

---

## 📁 Estructura de Carpetas

```
/app
  /login                    # Página de login
  /dashboard               # Dashboard principal
  /clientes               # Gestión de clientes
  /propiedades            # Gestión de propiedades
  /ventas                 # Gestión de ventas/costos
  /caja-pagos             # Caja y pagos
  /reportes               # Reportes
  /configuracion          # Administración

/components
  /auth                   # Componentes de autenticación
  /layout                 # Componentes de layout (sidebar)
  /clientes               # Componentes de clientes
  /propiedades            # Componentes de propiedades
  /ventas                 # Componentes de ventas
  /caja-pagos             # Componentes de caja/pagos
  /reportes               # Componentes de reportes
  /configuracion          # Componentes de administración
  /ui                     # Componentes shadcn/ui

/lib
  /supabase               # Cliente de Supabase
  /types.ts               # Tipos TypeScript
  /utils.ts               # Utilidades
  /reports                # Generadores de reportes
```

---

## 🚀 Requisitos de Instalación

### Prerequisites
- Node.js 18+
- pnpm (o npm/yarn)
- Cuenta Supabase
- Variables de entorno Supabase

### Instalación

```bash
# 1. Clonar el proyecto
git clone <repo-url>
cd proyecto

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
# Crear .env.local con:
NEXT_PUBLIC_SUPABASE_URL=<tu-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-key>

# 4. Inicializar base de datos (opcional)
# Ejecutar scripts SQL en Supabase console o:
pnpm run setup:db

# 5. Iniciar desarrollo
pnpm dev
```

---

## 🔑 Variables de Entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxx...

# Opcional
NODE_ENV=development
```

---

## 📱 Interfaz de Usuario

### Componentes Utilizados
- **UI Framework**: shadcn/ui con Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Tablas**: Tabla responsiva con scroll horizontal
- **Diálogos**: Dialogs modales para CRUD
- **Gráficos**: Recharts para visualización de datos
- **Reportes**: jsPDF para generación de PDFs

### Responsive Design
- Mobile First
- Sidebar colapsable en mobile
- Tablas con scroll horizontal en dispositivos pequeños

---

## 🔄 Flujos Principales

### Flujo de Creación de Cliente
1. Acceder a "Clientes"
2. Clic en "Nuevo Cliente"
3. Completar formulario
4. Guardar → Aparece en la tabla

### Flujo de Registro de Venta
1. Acceder a "Ventas"
2. Clic en "Nueva Venta"
3. Seleccionar cliente
4. Completar información de costos y financiamiento
5. Guardar

### Flujo de Registro de Pago
1. Acceder a "Caja y Pagos"
2. Clic en "Registrar Pago"
3. Seleccionar cliente
4. Ingresar monto, fecha, método
5. Guardar

### Flujo de Generación de Reportes
1. Acceder a "Reportes"
2. Seleccionar tipo de reporte (Ventas o Cobranza)
3. Ver estadísticas
4. Clic en "Descargar PDF"

---

## 👤 Credenciales de Prueba

```
Email: admin@example.com
Contraseña: password123
Rol: Administrador
```

---

## 🛠️ Tecnologías Utilizadas

| Aspecto | Tecnología |
|--------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS v4 |
| BD | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Forms | React Hook Form + Zod |
| Reportes | jsPDF |
| Gráficos | Recharts |
| Estado | React SWR (client) |

---

## 📊 Estadísticas del Proyecto

- **Páginas Principales**: 7 (Login, Dashboard, Clientes, Propiedades, Ventas, Caja-Pagos, Reportes, Configuración)
- **Componentes Reutilizables**: 30+
- **Tablas de BD**: 6 principales
- **Roles**: 4 tipos
- **Funcionalidades**: CRUD completo, Reportes, Autenticación, RLS

---

## 🔒 Seguridad

✅ **Implementado:**
- Autenticación con Supabase Auth
- Row Level Security (RLS) a nivel de BD
- Validación Zod en formularios
- Usuarios solo ven sus datos (según rol)
- Contrasñas hasheadas en BD
- Session management seguro

---

## 📝 Notas de Desarrollo

### Mejoras Futuras Posibles
- Importar clientes desde CSV
- Exportar a Excel
- Búsqueda y filtros avanzados
- Historial de cambios
- Notificaciones de pagos vencidos
- Dashboard de análisis
- Asignación de asesores
- Historial de actividad

### Conocimientos Previos Requeridos
- React y Next.js
- TypeScript básico
- Tailwind CSS
- Supabase (PostgreSQL)
- React Hook Form

---

## 📞 Soporte

Para preguntas o errores:
1. Revisar la consola del navegador
2. Revisar logs en Supabase
3. Verificar variables de entorno
4. Contactar al equipo de desarrollo

---

## 📄 Licencia

Proyecto propietario. Todos los derechos reservados.

---

**Última actualización:** Abril 2026  
**Versión:** 1.0.0
