-- =============================================
-- CREACIÓN DE TIPOS Y ENUMS
-- =============================================

-- Enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'asesor', 'finanzas', 'gerencia');

-- Enum para estado civil
CREATE TYPE estado_civil_enum AS ENUM ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre');

-- Enum para tipo de documento
CREATE TYPE tipo_documento_enum AS ENUM ('dni', 'pasaporte', 'ce', 'otro');

-- Enum para estado de vivienda
CREATE TYPE estado_vivienda_enum AS ENUM ('disponible', 'vendida', 'en_construccion', 'lista_entrega', 'entregada');

-- Enum para tipo de venta
CREATE TYPE tipo_venta_enum AS ENUM ('contado', 'credito', 'mixto');

-- Enum para tipo de pago
CREATE TYPE tipo_pago_enum AS ENUM ('aporte', 'cuota', 'comision', 'otro');

-- Enum para estado de pago
CREATE TYPE estado_pago_enum AS ENUM ('pagado', 'pendiente', 'atrasado');

-- =============================================
-- TABLA DE PERFILES (extensión de auth.users)
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role user_role NOT NULL DEFAULT 'asesor',
  empresa_grupo_inmobiliario VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_activo ON public.profiles(activo);

-- =============================================
-- TABLA DE GRUPOS INMOBILIARIOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.grupos_inmobiliarios (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLA DE CLIENTES
-- =============================================

CREATE TABLE IF NOT EXISTS public.clientes (
  id BIGSERIAL PRIMARY KEY,
  codigo_cliente VARCHAR(50) NOT NULL UNIQUE,
  apellidos VARCHAR(255) NOT NULL,
  nombres VARCHAR(255) NOT NULL,
  tipo_documento tipo_documento_enum DEFAULT 'dni',
  dni VARCHAR(20) UNIQUE,
  estado_civil estado_civil_enum,
  telefonos TEXT[] DEFAULT '{}',
  correo VARCHAR(255),
  direccion TEXT,
  departamento VARCHAR(100),
  provincia VARCHAR(100),
  distrito VARCHAR(100),
  empresa_facturacion VARCHAR(255),
  asesor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  grupo_inmobiliario_id BIGINT REFERENCES public.grupos_inmobiliarios(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON public.clientes(codigo_cliente);
CREATE INDEX IF NOT EXISTS idx_clientes_dni ON public.clientes(dni);
CREATE INDEX IF NOT EXISTS idx_clientes_asesor_id ON public.clientes(asesor_id);
CREATE INDEX IF NOT EXISTS idx_clientes_grupo ON public.clientes(grupo_inmobiliario_id);
CREATE INDEX IF NOT EXISTS idx_clientes_apellidos_nombres ON public.clientes(apellidos, nombres);

-- =============================================
-- TABLA DE PROPIEDADES POR CLIENTE
-- =============================================

CREATE TABLE IF NOT EXISTS public.clientes_propiedades (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  mz VARCHAR(50),
  lote VARCHAR(50),
  sector VARCHAR(100),
  metros NUMERIC(10, 2),
  ubicacion TEXT,
  status_vivienda estado_vivienda_enum DEFAULT 'disponible',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_propiedades_cliente_id ON public.clientes_propiedades(cliente_id);

-- =============================================
-- TABLA DE CONDICIONES DE VENTA
-- =============================================

CREATE TABLE IF NOT EXISTS public.condiciones_venta (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  propiedad_id BIGINT REFERENCES public.clientes_propiedades(id) ON DELETE SET NULL,
  medidas_vivienda TEXT,
  plazo_entrega DATE,
  tipo_venta tipo_venta_enum DEFAULT 'credito',
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_condiciones_cliente_id ON public.condiciones_venta(cliente_id);
CREATE INDEX IF NOT EXISTS idx_condiciones_propiedad_id ON public.condiciones_venta(propiedad_id);

-- =============================================
-- TABLA DE COSTOS DE VENTA
-- =============================================

CREATE TABLE IF NOT EXISTS public.costos_venta (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  costo_venta NUMERIC(15, 2),
  aporte_cuota_inicial NUMERIC(15, 2),
  monto_financiar NUMERIC(15, 2),
  fecha_venta DATE,
  n_cuotas INTEGER,
  monto_cuota NUMERIC(15, 2),
  fecha_contrato DATE,
  deuda_mora NUMERIC(15, 2) DEFAULT 0,
  sobrante NUMERIC(15, 2) DEFAULT 0,
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_costos_cliente_id ON public.costos_venta(cliente_id);

-- =============================================
-- TABLA DE PAGOS DE COMISIONES
-- =============================================

CREATE TABLE IF NOT EXISTS public.pagos_comisiones (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  pago_comision_venta NUMERIC(15, 2),
  porcentaje NUMERIC(5, 2),
  observacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comisiones_cliente_id ON public.pagos_comisiones(cliente_id);

-- =============================================
-- TABLA DE CAJA/PAGOS
-- =============================================

CREATE TABLE IF NOT EXISTS public.caja_pagos (
  id BIGSERIAL PRIMARY KEY,
  cliente_id BIGINT NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_pago tipo_pago_enum DEFAULT 'cuota',
  monto NUMERIC(15, 2) NOT NULL,
  fecha_pago DATE NOT NULL,
  estado estado_pago_enum DEFAULT 'pagado',
  registrado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  observacion TEXT,
  numero_referencia VARCHAR(100),
  metodo_pago VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_caja_cliente_id ON public.caja_pagos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_caja_fecha_pago ON public.caja_pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_caja_estado ON public.caja_pagos(estado);
CREATE INDEX IF NOT EXISTS idx_caja_registrado_por ON public.caja_pagos(registrado_por);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_propiedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condiciones_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costos_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos_comisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caja_pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_inmobiliarios ENABLE ROW LEVEL SECURITY;

-- ---- POLICIES PARA PROFILES ----

-- Los usuarios pueden leer su propio perfil
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin puede ver todos los perfiles
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- POLICIES PARA CLIENTES ----

-- Asesor: ve solo sus clientes
-- Admin: ve todos
-- Gerencia: ve todos (read-only via Finanzas/Admin)
CREATE POLICY "Asesor can view assigned clients" ON public.clientes
  FOR SELECT USING (
    auth.uid() = asesor_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gerencia'))
  );

-- Admin: puede hacer cualquier cosa
CREATE POLICY "Admin full access to clients" ON public.clientes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Asesor: puede insertar y actualizar sus clientes
CREATE POLICY "Asesor can insert and update clients" ON public.clientes
  FOR INSERT WITH CHECK (
    auth.uid() = asesor_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Asesor can update assigned clients" ON public.clientes
  FOR UPDATE USING (
    auth.uid() = asesor_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ---- POLICIES PARA PROPIEDADES ----

CREATE POLICY "Can view properties of accessible clients" ON public.clientes_propiedades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = clientes_propiedades.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gerencia'))
        )
    )
  );

CREATE POLICY "Can manage properties of assigned clients" ON public.clientes_propiedades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = clientes_propiedades.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );

-- ---- POLICIES PARA CONDICIONES DE VENTA ----

CREATE POLICY "Can view sale conditions" ON public.condiciones_venta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = condiciones_venta.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gerencia'))
        )
    )
  );

CREATE POLICY "Can manage sale conditions" ON public.condiciones_venta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = condiciones_venta.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );

-- ---- POLICIES PARA COSTOS DE VENTA ----

CREATE POLICY "Can view sale costs" ON public.costos_venta
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = costos_venta.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'gerencia'))
        )
    )
  );

CREATE POLICY "Can manage sale costs" ON public.costos_venta
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = costos_venta.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );

-- ---- POLICIES PARA PAGOS DE COMISIONES ----

CREATE POLICY "Can view commissions" ON public.pagos_comisiones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = pagos_comisiones.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'finanzas', 'gerencia'))
        )
    )
  );

CREATE POLICY "Can manage commissions" ON public.pagos_comisiones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.clientes
      WHERE clientes.id = pagos_comisiones.cliente_id
        AND (
          auth.uid() = clientes.asesor_id
          OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
        )
    )
  );

-- ---- POLICIES PARA CAJA/PAGOS ----

-- Solo Finanzas y Admin pueden ver pagos
CREATE POLICY "Finance and Admin can view payments" ON public.caja_pagos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'finanzas', 'gerencia'))
  );

-- Solo Finanzas y Admin pueden registrar pagos
CREATE POLICY "Finance and Admin can manage payments" ON public.caja_pagos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'finanzas'))
  );

-- ---- POLICIES PARA GRUPOS ----

CREATE POLICY "Anyone can view active groups" ON public.grupos_inmobiliarios
  FOR SELECT USING (activo = true);

CREATE POLICY "Admin can manage groups" ON public.grupos_inmobiliarios
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- DATOS INICIALES
-- =============================================

-- Insertar grupos inmobiliarios de ejemplo
INSERT INTO public.grupos_inmobiliarios (nombre, descripcion) VALUES
  ('Grupo A', 'Grupo Inmobiliario A'),
  ('Grupo B', 'Grupo Inmobiliario B'),
  ('Grupo C', 'Grupo Inmobiliario C')
ON CONFLICT (nombre) DO NOTHING;

-- =============================================
-- FUNCIONES DE UTILIDAD
-- =============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_propiedades_updated_at BEFORE UPDATE ON public.clientes_propiedades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_condiciones_updated_at BEFORE UPDATE ON public.condiciones_venta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_costos_updated_at BEFORE UPDATE ON public.costos_venta
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comisiones_updated_at BEFORE UPDATE ON public.pagos_comisiones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_caja_updated_at BEFORE UPDATE ON public.caja_pagos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grupos_updated_at BEFORE UPDATE ON public.grupos_inmobiliarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
