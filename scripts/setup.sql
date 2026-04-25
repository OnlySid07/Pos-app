-- Fair - Sistema de Gestión Inmobiliaria
-- Database Schema Setup
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'asesor',
  empresa_id UUID,
  estado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clientes table
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_cliente TEXT UNIQUE NOT NULL,
  lote_entregado TEXT,
  apellidos TEXT NOT NULL,
  nombres TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  dni TEXT UNIQUE NOT NULL,
  estado_civil TEXT,
  telefonos TEXT,
  correo TEXT,
  direccion TEXT,
  departamento TEXT,
  provincia TEXT,
  distrito TEXT,
  empresa_facturacion TEXT,
  mz TEXT,
  lote TEXT,
  sector TEXT,
  metros DECIMAL(10, 2),
  ubicacion TEXT,
  asesor_id UUID REFERENCES users(id),
  grupo_inmobiliario TEXT,
  pago_comision_venta DECIMAL(12, 2),
  tipo_venta TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Propiedades table
CREATE TABLE IF NOT EXISTS propiedades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  medidas_vivienda TEXT,
  status_vivienda TEXT,
  plazo_entrega TEXT,
  adicional TEXT,
  estado TEXT DEFAULT 'disponible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Costos/Ventas table
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  propiedad_id UUID REFERENCES propiedades(id),
  costo_venta DECIMAL(12, 2),
  aporte_cuota_inicial DECIMAL(12, 2),
  monto_financiar DECIMAL(12, 2),
  fecha_venta DATE,
  numero_cuotas INTEGER,
  monto_cuota DECIMAL(12, 2),
  fecha_contrato DATE,
  deuda_mora DECIMAL(12, 2),
  sobrante DECIMAL(12, 2),
  observacion TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Caja/Pagos table
CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_pago TEXT NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  fecha_pago DATE NOT NULL,
  metodo_pago TEXT,
  referencia TEXT,
  estado TEXT DEFAULT 'completado',
  observacion TEXT,
  usuario_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clientes_asesor ON clientes(asesor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo_cliente);
CREATE INDEX IF NOT EXISTS idx_propiedades_cliente ON propiedades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_propiedad ON ventas(propiedad_id);
CREATE INDEX IF NOT EXISTS idx_pagos_venta ON pagos(venta_id);
CREATE INDEX IF NOT EXISTS idx_pagos_cliente ON pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Permitir a todos los usuarios autenticados leer la tabla users
-- Esto evita el error de recursión infinita (infinite recursion)
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Authenticated users can read users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for clientes
DROP POLICY IF EXISTS "Users can view assigned or own clients" ON clientes;
CREATE POLICY "Users can view assigned or own clients" ON clientes
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      asesor_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Asesores can insert clients" ON clientes;
CREATE POLICY "Asesores can insert clients" ON clientes
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'asesor'))
  );

DROP POLICY IF EXISTS "Users can update own clients" ON clientes;
CREATE POLICY "Users can update own clients" ON clientes
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      asesor_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete own clients" ON clientes;
CREATE POLICY "Users can delete own clients" ON clientes
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      asesor_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- RLS Policies for propiedades
DROP POLICY IF EXISTS "Users can view related properties" ON propiedades;
CREATE POLICY "Users can view related properties" ON propiedades
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM clientes c
        WHERE c.id = propiedades.cliente_id AND (
          c.asesor_id = auth.uid() OR
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage related properties" ON propiedades;
CREATE POLICY "Users can manage related properties" ON propiedades
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM clientes c
        WHERE c.id = propiedades.cliente_id AND (
          c.asesor_id = auth.uid() OR
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
        )
      )
    )
  );

-- RLS Policies for ventas
DROP POLICY IF EXISTS "Users can view related sales" ON ventas;
CREATE POLICY "Users can view related sales" ON ventas
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM clientes c
        WHERE c.id = ventas.cliente_id AND (
          c.asesor_id = auth.uid() OR
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finanzas', 'gerencia'))
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can manage related sales" ON ventas;
CREATE POLICY "Users can manage related sales" ON ventas
  FOR ALL USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM clientes c
        WHERE c.id = ventas.cliente_id AND (
          c.asesor_id = auth.uid() OR
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin'))
        )
      )
    )
  );

-- RLS Policies for pagos (Finance team can view all)
DROP POLICY IF EXISTS "Finance can view all payments" ON pagos;
CREATE POLICY "Finance can view all payments" ON pagos
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'finanzas')
    )
  );

DROP POLICY IF EXISTS "Users can view own payment info" ON pagos;
CREATE POLICY "Users can view own payment info" ON pagos
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      EXISTS (
        SELECT 1 FROM clientes c
        WHERE c.id = pagos.cliente_id AND c.asesor_id = auth.uid()
      ) OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finanzas', 'gerencia'))
    )
  );

DROP POLICY IF EXISTS "Finance can manage all payments" ON pagos;
CREATE POLICY "Finance can manage all payments" ON pagos
  FOR ALL USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('admin', 'finanzas')
    )
  );

-- Create a trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_propiedades_updated_at ON propiedades;
CREATE TRIGGER update_propiedades_updated_at BEFORE UPDATE ON propiedades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ventas_updated_at ON ventas;
CREATE TRIGGER update_ventas_updated_at BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pagos_updated_at ON pagos;
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Trigger para crear usuario automáticamente en public.users al registrarse
-- ============================================================================

-- Función que se ejecuta tras crear un usuario en supabase (auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name', -- opcional: si mandas metadata al registrar
    COALESCE(new.raw_user_meta_data->>'role', 'asesor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparador en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Eliminar la política anterior defectuosa
DROP POLICY IF EXISTS "Admin can view all users" ON users;

-- Permitir a un usuario que ha iniciado sesión ver sus propios datos
DROP POLICY IF EXISTS "Users can view own data" ON users;
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Permitir a los admins ver los datos de los demás
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );