// Tipos para la gestión de productos
export interface Producto {
  id: string
  comercioId: string
  nombre: string
  descripcion: string
  precio: number
  moneda: string
  categoria: string
  imagenes: string[]
  variantes: VarianteProducto[]
  etiquetasDietarias: string[]
  estaActivo: boolean
  estaPublicado: boolean
  estado: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado'
  stock?: number
  createdAt: string
  updatedAt: string
}

export interface VarianteProducto {
  id: string
  nombre: string
  precio: number
  stock?: number
  imagen?: string
  descripcion?: string
}

export interface EtiquetaDietaria {
  valor: string
  etiqueta: string
  color: string
}

// Tipos para crear/actualizar productos
export interface CrearProductoDto {
  comercioId: string
  nombre: string
  descripcion: string
  precio: number
  moneda: string
  categoria: string
  imagenes: string[]
  variantes?: VarianteProducto[]
  etiquetasDietarias?: string[]
  stock?: number
}

export interface ActualizarProductoDto extends Partial<CrearProductoDto> {
  estaActivo?: boolean
  estaPublicado?: boolean
  estado?: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado'
}

// Filtros para búsqueda de productos
export interface FiltrosProducto {
  comercioId?: string
  categoria?: string
  estado?: 'borrador' | 'pendiente' | 'aprobado' | 'rechazado'
  estaActivo?: boolean
  estaPublicado?: boolean
  tipoComercio?: 'restaurante' | 'tienda'
  ciudad?: string
}

// Tipos para aprobación de productos
export interface AprobarProductoDto {
  productoId: string
  aprobadoPor: string
  comentarios?: string
}

export interface RechazarProductoDto {
  productoId: string
  rechazadoPor: string
  razon: string
  comentarios?: string
}

// Constantes para categorías
export const CATEGORIAS_PRODUCTO = {
  RESTAURANTE: [
    'Entradas',
    'Platos Principales',
    'Postres',
    'Bebidas',
    'Snacks',
    'Especialidades'
  ],
  TIENDA: [
    'Accesorios',
    'Ropa',
    'Equipamiento',
    'Electrónicos',
    'Hogar',
    'Deportes'
  ]
} as const

// Constantes para etiquetas dietarias
export const ETIQUETAS_DIETARIAS: EtiquetaDietaria[] = [
  { valor: 'vegano', etiqueta: 'Vegano 🌱', color: '#10b981' },
  { valor: 'vegetariano', etiqueta: 'Vegetariano 🥗', color: '#059669' },
  { valor: 'pescatariano', etiqueta: 'Pescatariano 🐟', color: '#0ea5e9' },
  { valor: 'fit', etiqueta: 'Fit 💪', color: '#f59e0b' },
  { valor: 'sin-gluten', etiqueta: 'Sin Gluten 🌾', color: '#8b5cf6' },
  { valor: 'sin-lactosa', etiqueta: 'Sin Lactosa 🥛', color: '#ef4444' }
]
