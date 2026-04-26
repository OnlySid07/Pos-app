export type UserRole = 'admin' | 'asesor' | 'finanzas' | 'gerencia'
export type EstadoCivil = 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'conviviente'
export type TipoDocumento = 'dni' | 'ruc' | 'pasaporte' | 'otro'
export type StatusVivienda = 'disponible' | 'vendida' | 'reservada' | 'en_construccion'
export type TipoVenta = 'contado' | 'financiado' | 'mixto'

export interface User {
  id: string
  auth_id: string
  email: string
  full_name: string
  role: UserRole
  active: boolean
  created_at: string
  updated_at: string
}

export interface Cliente {
  id: string
  codigo_cliente: string
  apellidos: string
  nombres: string
  tipo_documento: TipoDocumento
  dni: string
  estado_civil?: EstadoCivil
  telefonos?: string
  correo?: string
  direccion?: string
  departamento?: string
  provincia?: string
  distrito?: string
  empresa_facturacion?: string
  mz?: string
  lote?: string
  sector?: string
  metros?: number
  ubicacion?: string
  asesor_id?: string
  grupo_inmobiliario?: string
  pago_comision_venta?: number
  tipo_venta?: TipoVenta
  estado?: string
  created_at: string
  updated_at: string
}

export interface Propiedad {
  id: string
  cliente_id: string
  mz?: string
  lote?: string
  sector?: string
  metros_terreno?: number
  ubicacion?: string
  status: StatusVivienda
  created_at: string
  updated_at: string
}

export interface CondicionesVenta {
  id: string
  cliente_id: string
  propiedades_id?: string
  metros_vivienda?: number
  status_vivienda?: StatusVivienda
  plazo_entrega?: string
  created_at: string
  updated_at: string
}

export interface Costo {
  id: string
  cliente_id: string
  tipo_venta: TipoVenta
  costo_venta: number
  aporte_cuota_inicial?: number
  monto_financiar?: number
  fecha_venta?: string
  numero_cuotas?: number
  monto_cuota?: number
  fecha_contrato?: string
  deuda_mora?: number
  sobrante?: number
  observacion?: string
  comision_venta?: number
  created_at: string
  updated_at: string
}

export interface CajaPago {
  id: string
  venta_id: string;
  cliente_id: string
  tipo_pago: string
  monto: number
  fecha_pago: string
  numero_recibo?: string
  metodo_pago?: string
  referencia?: string
  estado: string
  registrado_por?: string
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  total_clientes: number
  total_ventas: number
  monto_total_vendido: number
  monto_cobrado: number
  monto_pendiente: number
  clientes_activos: number
}
