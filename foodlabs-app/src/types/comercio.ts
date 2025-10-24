// Tipos para la gestión de comercios
export interface Comercio {
  id: string
  nombre: string
  tipo: 'restaurante' | 'tienda'
  categoria: string
  tier: 'local' | 'premium' | 'enterprise'
  estado: 'activo' | 'inactivo' | 'pendiente'
  ownerId: string
  direccion: Direccion
  contacto: Contacto
  horarios: HorariosComercio
  configuracion: ConfiguracionComercio
  createdAt: string
  updatedAt: string
}

export interface Direccion {
  calle: string
  ciudad: string
  codigoPostal?: string
  coordenadas: {
    lat: number
    lng: number
  }
  zona?: string
}

export interface Contacto {
  telefono: string
  whatsapp?: string
  email: string
  sitioWeb?: string
}

export interface HorariosComercio {
  lunes: HorarioDia
  martes: HorarioDia
  miercoles: HorarioDia
  jueves: HorarioDia
  viernes: HorarioDia
  sabado: HorarioDia
  domingo: HorarioDia
}

export interface HorarioDia {
  abierto: string
  cerrado: string
  estaAbierto: boolean
}

export interface ConfiguracionComercio {
  radioEntrega: number // km
  pedidoMinimo: number
  costoEntrega: number
  tiempoEstimado: number // minutos
  metodosPago: string[]
  comision: number // porcentaje
  logo?: string
  imagen?: string
  descripcion?: string
}

// Tipos para crear/actualizar comercios
export interface CrearComercioDto {
  nombre: string
  tipo: 'restaurante' | 'tienda'
  categoria: string
  tier: 'local' | 'premium' | 'enterprise'
  direccion: Direccion
  contacto: Contacto
  horarios: HorariosComercio
  configuracion: ConfiguracionComercio
  ownerId: string
}

export interface ActualizarComercioDto extends Partial<CrearComercioDto> {
  estado?: 'activo' | 'inactivo' | 'pendiente'
}

// Filtros para búsqueda de comercios
export interface FiltrosComercio {
  tipo?: 'restaurante' | 'tienda'
  estado?: 'activo' | 'inactivo' | 'pendiente'
  ciudad?: string
  categoria?: string
  tier?: 'local' | 'premium' | 'enterprise'
}
