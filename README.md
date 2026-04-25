# Fair - Sistema de Gestión Inmobiliaria

Una aplicación web completa de gestión de clientes, propiedades, ventas y cobros para empresas inmobiliarias.

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 18+
- Cuenta en Supabase (para la base de datos)
- Variables de entorno configuradas en Vercel

### Instalación

1. Clona el repositorio
2. Instala dependencias: `pnpm install`
3. Configura la base de datos (ver SETUP.md)
4. Inicia el dev server: `pnpm dev`
5. Accede a `http://localhost:3000`

## 📋 Módulos Principales

### 1. **Autenticación (Login)**
- Sistema de login seguro con Supabase Auth
- Roles de usuario diferenciados
- Recuperación de contraseña

### 2. **Gestión de Clientes** (`/clientes`)
- CRUD completo de clientes
- Campos: código, nombre, DNI, teléfono, correo, dirección, ubicación, etc.
- Búsqueda y filtrado
- Exportar a Excel/PDF

### 3. **Gestión de Propiedades** (`/propiedades`)
- Registro de propiedades asociadas a clientes
- Condiciones de la vivienda (medidas, status, plazo de entrega)
- Información de ubicación (departamento, provincia, distrito, manzana, lote)
- Detalles inmobiliarios (empresa, sector, metros, asesor, grupo inmobiliario)

### 4. **Gestión de Ventas** (`/ventas`)
- Registro de transacciones de venta
- **Costos de Venta**: Costo total, aporte inicial, monto a financiar
- **Condiciones**: Plazo de entrega, comisión por venta, tipo de venta
- **Detalles de Pago**: Número de cuotas, monto de cuota, fecha de contrato
- **Seguimiento**: Deuda por mora, sobrantes, observaciones

### 5. **Caja y Pagos** (`/caja-pagos`)
- Registro de pagos de cuotas
- Control de cobranza
- Historial de transacciones
- Visibilidad limitada según rol de usuario

### 6. **Reportes** (`/reportes`)
- Resumen de ventas por período
- Estado de cobranza
- Análisis de comisiones
- Exportación a PDF y Excel

### 7. **Configuración** (`/configuracion`)
- Panel de administración (solo Admin)
- Gestión de usuarios
- Asignación de roles
- Control de acceso

## 👥 Roles y Permisos

| Rol | Acceso | Limitaciones |
|-----|--------|--------------|
| **Admin** | Total | Acceso a todo el sistema |
| **Asesor** | CRUD Clientes/Propiedades | Solo clientes asignados |
| **Finanzas/Caja** | Lectura de Pagos | Solo módulo de caja |
| **Gerencia** | Lectura de Reportes | Visualización sin editar |

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: React 19 + Next.js 16
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Validación**: Zod + React Hook Form
- **Reportes**: jsPDF + XLSX

### Estructura de Directorios
```
/app
  /login          - Página de login
  /dashboard      - Dashboard principal
  /clientes       - Gestión de clientes
  /propiedades    - Gestión de propiedades
  /ventas         - Gestión de ventas
  /caja-pagos     - Módulo de caja
  /reportes       - Generación de reportes
  /configuracion  - Panel de administración
  /api            - Rutas API

/components
  /auth           - Componentes de autenticación
  /layout         - Componentes de diseño (sidebar, etc)
  /clientes       - Componentes de clientes
  /propiedades    - Componentes de propiedades
  /ventas         - Componentes de ventas
  /caja-pagos     - Componentes de caja
  /reportes       - Componentes de reportes
  /configuracion  - Componentes de admin

/lib
  /supabase       - Cliente y servidor de Supabase
  /reports        - Generadores de reportes
  /types.ts       - Tipos TypeScript compartidos
```

## 🔒 Seguridad

- **Row Level Security (RLS)**: Cada usuario solo ve sus datos
- **Autenticación JWT**: Tokens seguros
- **Validación de datos**: Zod en frontend y backend
- **Permisos por rol**: Restricciones a nivel de base de datos

## 📦 Dependencias Principales

```json
{
  "@supabase/supabase-js": "^2.43.0",
  "react": "^19.0.0",
  "next": "^16.0.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.22.0",
  "recharts": "^2.10.0",
  "jspdf": "^2.5.0",
  "xlsx": "^0.18.5"
}
```

## 🚀 Despliegue

El proyecto está configurado para desplegarse en Vercel:

1. Conecta tu repositorio GitHub
2. Las variables de entorno se configuran automáticamente desde Vercel
3. Cada push a main dispara un deployment automático

## 📚 Documentación Adicional

- **SETUP.md** - Instrucciones de configuración inicial
- **PROYECTO.md** - Descripción detallada del proyecto
- Ver comentarios en componentes para detalles específicos

## 🤝 Contribución

Las mejoras y reportes de bugs son bienvenidos. Por favor:

1. Revisa la arquitectura existente
2. Sigue el patrón de componentes establecido
3. Usa TypeScript para nuevos módulos
4. Mantén la consistencia de estilos

## 📞 Soporte

Para preguntas o issues, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: Abril 2026  
**Estado**: En desarrollo
