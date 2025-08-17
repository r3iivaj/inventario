import { supabase } from '../config/supabase'
import { imageService } from './imageService'

// Función para normalizar texto y eliminar tildes
const normalizarTexto = (texto) => {
  return texto.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

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

      // Filtro por búsqueda - si hay búsqueda, la aplicaremos en el cliente
      const searchTerm = filtros.busqueda ? normalizarTexto(filtros.busqueda) : null

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
        case 'stock_asc':
          query = query.order('cantidad_stock', { ascending: true })
          break
        case 'stock_desc':
          query = query.order('cantidad_stock', { ascending: false })
          break
        case 'fecha':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query
      
      if (error) throw error
      
      // Si hay término de búsqueda, filtrar en el lado del cliente para ignorar tildes
      let filteredData = data
      if (searchTerm && data) {
        filteredData = data.filter(producto => {
          const nombreNormalizado = normalizarTexto(producto.nombre || '')
          const descripcionNormalizada = normalizarTexto(producto.descripcion || '')
          return nombreNormalizado.includes(searchTerm) || descripcionNormalizada.includes(searchTerm)
        })
      }
      
      return { data: filteredData, error: null }
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
      // Primero obtener el producto para ver si tiene imagen
      const { data: producto, error: getError } = await supabase
        .from('productos')
        .select('imagen_url')
        .eq('id', id)
        .single()

      if (getError) throw getError

      // Si tiene imagen del storage, eliminarla
      if (producto?.imagen_url && imageService.isSupabaseStorageUrl(producto.imagen_url)) {
        const imagePath = imageService.extractPathFromUrl(producto.imagen_url)
        if (imagePath) {
          await imageService.deleteImage(imagePath)
        }
      }

      // Eliminar el producto
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