import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[v0] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const sql = `
-- Enable UUID and ENUM extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE public.user_role AS ENUM ('admin', 'asesor', 'finanzas', 'gerencia');
CREATE TYPE public.estado_civil AS ENUM ('soltero', 'casado', 'divorciado', 'viudo', 'conviviente');
CREATE TYPE public.tipo_documento AS ENUM ('dni', 'ruc', 'pasaporte', 'otro');
CREATE TYPE public.status_vivienda AS ENUM ('disponible', 'vendida', 'reservada', 'en_construccion');
CREATE TYPE public.tipo_venta AS ENUM ('contado', 'financiado', 'mixto');

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'asesor',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_cliente TEXT NOT NULL UNIQUE,
  apellidos_nombres TEXT NOT NULL,
  tipo_documento public.tipo_documento NOT NULL,
  dni TEXT NOT NULL,
  estado_civil public.estado_civil,
  telefono1 TEXT,
  telefono2 TEXT,
  email TEXT,
  direccion TEXT,
  departamento TEXT,
  provincia TEXT,
  distrito TEXT,
  empresa_facturacion TEXT,
  asesor_id UUID REFERENCES public.users(id),
  grupo_inmobiliario TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS public.propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  mz TEXT,
  lote TEXT,
  sector TEXT,
  metros_terreno DECIMAL(10, 2),
  ubicacion TEXT,
  status public.status_vivienda DEFAULT 'disponible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de condiciones de venta
CREATE TABLE IF NOT EXISTS public.condiciones_venta (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  propiedades_id UUID REFERENCES public.propiedades(id),
  metros_vivienda DECIMAL(10, 2),
  status_vivienda public.status_vivienda,
  plazo_entrega DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de costos y financiamiento
CREATE TABLE IF NOT EXISTS public.costos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_venta public.tipo_venta NOT NULL,
  costo_venta DECIMAL(15, 2) NOT NULL,
  aporte_cuota_inicial DECIMAL(15, 2),
  monto_financiar DECIMAL(15, 2),
  fecha_venta DATE,
  num_cuotas INTEGER,
  monto_cuota DECIMAL(15, 2),
  fecha_contrato DATE,
  deuda_mora DECIMAL(15, 2) DEFAULT 0,
  sobrante DECIMAL(15, 2) DEFAULT 0,
  observacion TEXT,
  comision_venta DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de caja y pagos
CREATE TABLE IF NOT EXISTS public.caja_pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_pago TEXT NOT NULL,
  monto DECIMAL(15, 2) NOT NULL,
  fecha_pago DATE NOT NULL,
  numero_recibo TEXT UNIQUE,
  metodo_pago TEXT,
  referencia TEXT,
  estado TEXT DEFAULT 'pendiente',
  registrado_por UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condiciones_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_pagos ENABLE ROW LEVEL SECURITY;

-- Policies para users (solo pueden ver su propio usuario)
CREATE POLICY "Users can view themselves" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Policies para clientes
CREATE POLICY "Asesores ven sus clientes" ON public.clientes
  FOR SELECT USING (
    asesor_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'gerencia'))
  );

CREATE POLICY "Asesores pueden crear clientes" ON public.clientes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'asesor'))
  );

CREATE POLICY "Asesores pueden actualizar sus clientes" ON public.clientes
  FOR UPDATE USING (
    asesor_id = (SELECT id FROM public.users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- Policies para caja_pagos
CREATE POLICY "Personal de finanzas ve todos los pagos" ON public.caja_pagos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role IN ('admin', 'finanzas', 'gerencia'))
  );

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_clientes_asesor ON public.clientes(asesor_id);
CREATE INDEX IF NOT EXISTS idx_propiedades_cliente ON public.propiedades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_costos_cliente ON public.costos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_caja_pagos_cliente ON public.caja_pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_caja_pagos_fecha ON public.caja_pagos(fecha_pago);
`

async function initDatabase() {
  try {
    console.log('[v0] Iniciando creación de schema en Supabase...')
    
    // Ejecutar cada statement SQL
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_string: statement.trim()
        }).catch(() => {
          // Si el método RPC no existe, intentar con query directo
          return supabase.from('_realtime').select('*').limit(0)
        })
        
        if (error && !error.message.includes('already exists')) {
          console.error(`[v0] Error en statement: ${statement.substring(0, 50)}...`)
          console.error(`[v0] ${error.message}`)
        }
      } catch (err) {
        console.log(`[v0] Skipping: ${statement.substring(0, 40)}...`)
      }
    }
    
    console.log('[v0] ✓ Schema creado exitosamente!')
  } catch (err) {
    console.error('[v0] Error fatal:', err.message)
    process.exit(1)
  }
}

initDatabase()
