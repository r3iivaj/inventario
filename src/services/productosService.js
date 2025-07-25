import { supabase } from '../config/supabase'

export const productosService = {
  // Obtener todos los productos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener productos:', error)
      return { data: null, error }
    }
  },

  // Obtener productos por categoría
  async getByCategoria(categoria) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('categoria', categoria)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener productos por categoría:', error)
      return { data: null, error }
    }
  },

  // Obtener productos con filtros
  async getWithFilters(filtros = {}) {
    try {
      let query = supabase.from('productos').select('*')

      // Filtro por categoría
      if (filtros.categoria && filtros.categoria !== 'todos') {
        query = query.eq('categoria', filtros.categoria)
      }

      // Filtro por búsqueda
      if (filtros.busqueda) {
        query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
      }

      // Ordenamiento
      switch (filtros.orden) {
        case 'nombre':
          query = query.order('nombre', { ascending: true })
          break
        case 'precio_asc':
          query = query.order('precio_venta', { ascending: true })
          break
        case 'precio_desc':
          query = query.order('precio_venta', { ascending: false })
          break
        case 'fecha':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('❌ Error al obtener productos con filtros:', error)
      console.error('Detalles del error:', error.message)
      console.error('Código de error:', error.code)
      return { data: null, error }
    }
  },

  // Obtener un producto por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener producto:', error)
      return { data: null, error }
    }
  },

  // Crear nuevo producto
  async create(producto) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([producto])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al crear producto:', error)
      return { data: null, error }
    }
  },

  // Actualizar producto
  async update(id, producto) {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(producto)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      return { data: null, error }
    }
  },

  // Eliminar producto
  async delete(id) {
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      return { error }
    }
  },

  // Obtener conteo de productos por categoría
  async getCountByCategoria() {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('categoria')
      
      if (error) throw error
      
      const conteos = data.reduce((acc, producto) => {
        acc[producto.categoria] = (acc[producto.categoria] || 0) + 1
        return acc
      }, {})
      
      return { data: conteos, error: null }
    } catch (error) {
      console.error('Error al obtener conteo por categoría:', error)
      return { data: null, error }
    }
  }
} 