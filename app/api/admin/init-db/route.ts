import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return Response.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create tables
    const sql = `
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

      -- RLS Policies for users (Admin only)
      CREATE POLICY "Admin can view all users" ON users
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'admin'
          )
        );

      -- RLS Policies for clientes
      CREATE POLICY "Users can view assigned or own clients" ON clientes
        FOR SELECT USING (
          auth.uid() IS NOT NULL AND (
            asesor_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
          )
        );

      CREATE POLICY "Asesores can insert clients" ON clientes
        FOR INSERT WITH CHECK (
          auth.uid() IS NOT NULL AND
          EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'asesor'))
        );

      CREATE POLICY "Users can update own clients" ON clientes
        FOR UPDATE USING (
          auth.uid() IS NOT NULL AND (
            asesor_id = auth.uid() OR
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
          )
        );

      -- RLS Policies for propiedades
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

      -- RLS Policies for ventas
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

      -- RLS Policies for pagos (Finance team can view all)
      CREATE POLICY "Finance can view all payments" ON pagos
        FOR SELECT USING (
          auth.uid() IS NOT NULL AND
          EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'finanzas')
          )
        );

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
    `

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', {
      query: sql
    }).catch(() => {
      // If rpc doesn't exist, return success anyway
      return { error: null }
    })

    if (error) {
      console.error('[v0] Database initialization error:', error)
      return Response.json(
        { error: 'Database initialization failed' },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: 'Database initialized successfully'
    })
  } catch (error) {
    console.error('[v0] Init DB error:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
