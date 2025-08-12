// Tipos para la base de datos

export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string;
  precio_venta: number;
  coste_real: number;
  cantidad_stock: number;
  categoria: string;
  imagen_url?: string;
  created_at?: string;
}

export interface Mercadillo {
  id: string;
  nombre: string;
  fecha: string;
  total_ventas: number;
  created_at?: string;
}

export interface Gasto {
  id: string;
  concepto: string;
  cantidad: number;
  fecha: string;
  id_mercadillo?: string;
  id_grupo?: string;
  created_at?: string;
}

export interface ProductoMercadillo {
  id: string;
  id_producto: string;
  id_mercadillo: string;
  cantidad: number;
  total_vendido: number;
  created_at?: string;
}

// Tipos para formularios (sin id y created_at)
export type ProductoInput = Omit<Producto, 'id' | 'created_at'>;
export type MercadilloInput = Omit<Mercadillo, 'id' | 'created_at'>;
export type GastoInput = Omit<Gasto, 'id' | 'created_at'>;
export type ProductoMercadilloInput = Omit<ProductoMercadillo, 'id' | 'created_at'>;

// Tipos para filtros
export interface ProductoFiltros {
  categoria?: string;
  orden?: 'nombre' | 'precio_asc' | 'precio_desc' | 'fecha';
  busqueda?: string;
} 