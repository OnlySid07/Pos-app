# 🎯 INSTRUCCIONES - Fair Sistema de Gestión Inmobiliaria

## ¡Tu aplicación está lista! 🚀

El sistema de gestión inmobiliaria **Fair** ha sido completamente construido con los siguientes módulos:

---

## 📋 Próximos Pasos

### 1️⃣ **Configurar la Base de Datos en Supabase**

Es el paso MÁS IMPORTANTE. Sin esto, la aplicación no funcionará.

**Pasos:**
1. Abre tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a la sección **SQL Editor** (esquina izquierda)
4. Haz clic en **New Query**
5. Abre el archivo `/scripts/setup.sql` en tu proyecto
6. Copia TODO el contenido del archivo
7. Pégalo en el SQL Editor de Supabase
8. Haz clic en **Run** (botón azul abajo a la derecha)
9. Espera a que se complete (verás un checkmark verde)

✅ Si ves un checkmark verde, ¡la base de datos está lista!

**¿Qué hace este script?**
- Crea todas las tablas necesarias (clientes, propiedades, ventas, pagos, etc.)
- Configura las relaciones entre tablas
- Establece Row Level Security (RLS) para proteger datos por usuario
- Configura índices para optimizar búsquedas

---

### 2️⃣ **Crear el Primer Usuario (Admin)**

Después de ejecutar el SQL, necesitas crear un usuario administrador:

**Opción A: Desde Supabase Dashboard**
1. Ve a tu proyecto Supabase
2. Ve a **Authentication** → **Users**
3. Haz clic en **Add user**
4. Escribe email y contraseña
5. Haz clic en **Create user**

**Opción B: Desde la aplicación (cuando esté en preview)**
1. Abre el preview de la aplicación
2. Ve a la página de **Login** (`/login`)
3. Haz clic en **"Crear una cuenta"** (si está disponible)
4. Completa el formulario de registro

---

### 3️⃣ **Acceder a la Aplicación**

1. **Inicia sesión** con el email y contraseña que creaste
2. **Verás el Dashboard** con un menú lateral (sidebar)
3. **Navega** por las diferentes secciones:
   - 📋 **Clientes** - Gestionar clientes
   - 🏠 **Propiedades** - Registrar propiedades
   - 💰 **Ventas** - Registrar ventas y costos
   - 💳 **Caja y Pagos** - Ver y registrar pagos
   - 📊 **Reportes** - Generar reportes PDF/Excel
   - ⚙️ **Configuración** - Gestionar usuarios (solo Admin)

---

## 🏗️ Estructura de la Aplicación

### Módulos Principales

#### 1. **Clientes** (`/clientes`)
Gestiona toda la información de tus clientes:
- ✅ CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Campos: Código, Apellidos, Nombres, DNI, Estado civil, Teléfonos, Correo, Dirección, Departamento, Provincia, Distrito, Asesor, Grupo inmobiliario, etc.
- ✅ Búsqueda por nombre o DNI
- ✅ Vista de tabla ordenable
- ✅ Exportar a Excel/PDF

#### 2. **Propiedades** (`/propiedades`)
Registra las propiedades asociadas a clientes:
- ✅ Información de ubicación (Mz, Lote, Sector, Departamento, Provincia, Distrito)
- ✅ Detalles: Metros construidos, Ubicación exacta
- ✅ Datos inmobiliarios: Empresa de facturación, Grupo inmobiliario
- ✅ Estado de la propiedad
- ✅ Relación con cliente

#### 3. **Ventas** (`/ventas`)
Registro completo de transacciones de venta:
- ✅ **Condiciones de la Venta:**
  - Medidas de la vivienda
  - Status de la vivienda
  - Plazo de entrega
  - Tipo de venta
  - Comisión por venta

- ✅ **Costos:**
  - Costo de venta
  - Aporte/Cuota inicial
  - Monto a financiar
  - Fecha de venta

- ✅ **Detalles de Pago:**
  - Número de cuotas
  - Monto de la cuota
  - Fecha de contrato

- ✅ **Seguimiento:**
  - Deuda por mora
  - Sobrante
  - Observaciones

#### 4. **Caja y Pagos** (`/caja-pagos`)
Control de cobranza:
- ✅ Registro de pagos de cuotas
- ✅ Seguimiento de cobros
- ✅ Historial de transacciones
- ✅ Acceso limitado según rol (Finanzas puede ver todo, Asesor solo sus clientes)

#### 5. **Reportes** (`/reportes`)
Generación de reportes analíticos:
- ✅ **Reporte de Ventas**: Resumen de ventas por período, total de comisiones
- ✅ **Reporte de Cobranza**: Estado de pagos, deuda pendiente, cuotas vencidas
- ✅ **Exportación**: Descargar en PDF o Excel
- ✅ **Filtros**: Por fecha, cliente, asesor, estado

#### 6. **Configuración** (`/configuracion`)
Panel de administración:
- ✅ Gestión de usuarios (solo para Admin)
- ✅ Asignación de roles
- ✅ Control de permisos
- ✅ Edición y eliminación de usuarios

---

## 👥 Roles y Permisos

Tu sistema tiene 4 roles con permisos diferenciados:

| Rol | Acceso | Limitaciones | Para quién |
|-----|--------|--------------|-----------|
| **Admin** | ✅ Total | Ninguna | Gerente general, Director |
| **Asesor** | ✅ CRUD Clientes/Propiedades/Ventas | Solo sus clientes asignados | Vendedores, Asesores |
| **Finanzas/Caja** | ✅ Lectura Caja y Pagos | Solo módulo de caja | Personal de cobranza, Tesorería |
| **Gerencia** | ✅ Lectura Reportes | Solo visualización, sin editar | Gerentes, Supervisores |

---

## 🔐 Seguridad Implementada

- **✅ Row Level Security (RLS)**: Cada usuario solo ve sus datos en la BD
- **✅ Autenticación JWT**: Tokens seguros con Supabase Auth
- **✅ Validación de datos**: Zod en frontend + backend
- **✅ Protección de rutas**: Middleware protege rutas autenticadas
- **✅ Permisos por rol**: Restricciones a nivel de base de datos

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19 + Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth (JWT)
- **Validación**: Zod + React Hook Form
- **Reportes**: jsPDF + XLSX
- **Gráficos**: Recharts (para futuras dashboards)

---

## 📁 Estructura de Carpetas

```
/app
  /login              → Página de login
  /dashboard          → Dashboard principal
  /clientes           → Gestión de clientes
  /propiedades        → Gestión de propiedades
  /ventas             → Gestión de ventas
  /caja-pagos         → Módulo de caja
  /reportes           → Reportes
  /configuracion      → Admin panel
  /api                → Rutas API

/components
  /auth               → Login form
  /layout             → Sidebar, header
  /clientes           → Tablas, dialogs de cliente
  /propiedades        → Tablas, dialogs de propiedad
  /ventas             → Tablas, dialogs de venta
  /caja-pagos         → Tablas, dialogs de pago
  /reportes           → Componentes de reportes
  /configuracion      → Componentes de admin

/lib
  /supabase           → Cliente Supabase (client/server)
  /reports            → Generadores de PDF/Excel
  /types.ts           → Tipos TypeScript compartidos
```

---

## 🚀 Uso Básico

### Crear un Cliente

1. Ve a **Clientes** en el menú
2. Haz clic en **"Agregar Cliente"**
3. Completa el formulario:
   - Código de cliente (automático o manual)
   - Nombres y apellidos
   - DNI
   - Contacto (teléfono, email)
   - Dirección
   - Ubicación (departamento, provincia, distrito)
   - Información inmobiliaria (asesor, grupo, etc.)
4. Haz clic en **Guardar**

### Registrar una Venta

1. Ve a **Ventas**
2. Selecciona el cliente
3. Selecciona la propiedad
4. Completa los detalles:
   - Costo de venta
   - Aporte inicial
   - Plazo de entrega
   - Plan de pagos (cuotas)
5. Guarda y listo

### Registrar un Pago

1. Ve a **Caja y Pagos**
2. Haz clic en **"Registrar Pago"**
3. Busca la venta
4. Ingresa el monto pagado
5. Especifica la forma de pago
6. Guarda

### Generar Reporte

1. Ve a **Reportes**
2. Selecciona el tipo (Ventas o Cobranza)
3. Elige el período
4. Haz clic en **"Descargar PDF"** o **"Descargar Excel"**

---

## ⚙️ Configuración Avanzada

### Cambiar permisos de un usuario

1. Ve a **Configuración** (solo si eres Admin)
2. Busca el usuario
3. Haz clic en **Editar**
4. Cambia el rol
5. Guarda

### Ver datos de un cliente específico

Si eres Asesor:
- Solo ves clientes que te hayan asignado
- Puedes ver todas las propiedades y ventas de tus clientes
- En Caja, ves los pagos de tus clientes

Si eres Finanzas:
- Ves todos los pagos
- No ves información de clientes o propiedades

Si eres Admin:
- Ves TODO

---

## 🐛 Solución de Problemas

### "No puedo iniciar sesión"
- Verifica que creaste un usuario en Supabase
- Revisa que el email y contraseña son correctos
- Comprueba que la base de datos está configurada (ejecutaste el SQL)

### "No veo opciones para crear clientes"
- Verifica tu rol. Los Asesores pueden crear clientes
- Los Finanzas solo ven caja
- Contacta al Admin para cambiar tu rol

### "Los datos no se guardan"
- Comprueba que ejecutaste el SQL en Supabase (paso 1️⃣)
- Verifica que las variables de entorno están configuradas correctamente
- Abre la consola (F12) para ver errores

### "¿Cómo exporto a Excel?"
- Ve a **Reportes**
- Selecciona el tipo de reporte
- Haz clic en **"Descargar Excel"**

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs** (F12 en el navegador → Console)
2. **Verifica Supabase**: Asegúrate que la BD está configurada
3. **Contacta al Admin**: Para problemas de permisos o usuarios
4. **Lee la documentación**: Archivos SETUP.md y README.md

---

## ✨ Características Futuras (Próximas versiones)

- 📱 Versión móvil
- 📲 Notificaciones de pagos vencidos
- 💬 Chat integrado
- 📧 Envío automático de facturas
- 📈 Dashboard con gráficos avanzados
- 🔔 Sistema de alertas
- 📋 Validación de documentos

---

## 📝 Notas Importantes

1. **No olvides hacer backup** de tu base de datos regularmente
2. **Distribuye las contraseñas** con seguridad
3. **Capacita a tu equipo** en el uso del sistema
4. **Revisa los reportes** regularmente para llevar control

---

**¡Listo para empezar!** 🎉

Si tienes dudas, revisa los archivos:
- `README.md` - Visión general
- `SETUP.md` - Instrucciones técnicas
- `PROYECTO.md` - Descripción detallada
