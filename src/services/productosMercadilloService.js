import { supabase } from '../config/supabase'

export const productosMercadilloService = {
  // Obtener todos los productos_mercadillo
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener productos_mercadillo:', error)
      return { data: null, error }
    }
  },

  // Obtener un producto_mercadillo por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener producto_mercadillo:', error)
      return { data: null, error }
    }
  },

  // Obtener productos por mercadillo
  async getByMercadillo(idMercadillo) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select('*')
        .eq('id_mercadillo', idMercadillo)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener productos por mercadillo:', error)
      return { data: null, error }
    }
  },

  // Obtener productos por mercadillo con detalles del producto
  async getByMercadilloConDetalles(idMercadillo) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select(`
          *,
          producto:productos(
            id,
            nombre,
            descripcion,
            precio_venta,
            categoria,
            imagen_url
          )
        `)
        .eq('id_mercadillo', idMercadillo)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener productos por mercadillo:', error)
      return { data: null, error }
    }
  },

  // Obtener productos_mercadillo por producto
  async getByProducto(idProducto) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select(`
          *,
          mercadillo:mercadillo(
            id,
            nombre,
            fecha,
            total_ventas
          )
        `)
        .eq('id_producto', idProducto)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener mercadillos por producto:', error)
      return { data: null, error }
    }
  },

  // Crear nuevo producto_mercadillo
  async create(productoMercadillo) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .insert([productoMercadillo])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al crear producto_mercadillo:', error)
      return { data: null, error }
    }
  },

  // Actualizar producto_mercadillo
  async update(id, productoMercadillo) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .update(productoMercadillo)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al actualizar producto_mercadillo:', error)
      return { data: null, error }
    }
  },

  // Eliminar producto_mercadillo
  async delete(id) {
    try {
      const { error } = await supabase
        .from('productos_mercadillo')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error al eliminar producto_mercadillo:', error)
      return { error }
    }
  },

  // Obtener total vendido por mercadillo
  async getTotalVendidoByMercadillo(idMercadillo) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select('total_vendido')
        .eq('id_mercadillo', idMercadillo)
      
      if (error) throw error
      
      const total = data.reduce((sum, item) => sum + item.total_vendido, 0)
      return { data: total, error: null }
    } catch (error) {
      console.error('Error al obtener total vendido:', error)
      return { data: null, error }
    }
  },

  // Obtener estadísticas de ventas por producto
  async getEstadisticasProducto(idProducto) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select('cantidad, total_vendido')
        .eq('id_producto', idProducto)
      
      if (error) throw error
      
      const totalCantidad = data.reduce((sum, item) => sum + item.cantidad, 0)
      const totalVendido = data.reduce((sum, item) => sum + item.total_vendido, 0)
      const mercadillos = data.length
      
      return { 
        data: {
          totalCantidad,
          totalVendido,
          mercadillos,
          promedioVentasPorMercadillo: mercadillos > 0 ? totalVendido / mercadillos : 0
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error al obtener estadísticas del producto:', error)
      return { data: null, error }
    }
  },

  // Obtener estadísticas de un mercadillo
  async getStats(idMercadillo) {
    try {
      const { data, error } = await supabase
        .from('productos_mercadillo')
        .select('total_vendido')
        .eq('id_mercadillo', idMercadillo)
      
      if (error) throw error
      
      const totalIngresos = data.reduce((sum, item) => sum + item.total_vendido, 0)
      const totalProductos = data.length
      
      return { 
        data: {
          totalIngresos,
          totalProductos
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error al obtener estadísticas del mercadillo:', error)
      return { data: null, error }
    }
  }
} 