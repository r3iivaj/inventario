import { supabase } from '../config/supabase'

export const gastosService = {
  // Obtener todos los gastos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener gastos:', error)
      return { data: null, error }
    }
  },

  // Obtener un gasto por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener gasto:', error)
      return { data: null, error }
    }
  },

  // Obtener gastos por mercadillo (solo activos)
  async getByMercadillo(idMercadillo, incluirInactivos = false) {
    try {
      let query = supabase
        .from('gastos')
        .select('*')
        .eq('id_mercadillo', idMercadillo)
      
      // Por defecto solo traer gastos activos
      if (!incluirInactivos) {
        query = query.neq('activo', false)
      }
      
      query = query.order('fecha', { ascending: false })
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener gastos por mercadillo:', error)
      return { data: null, error }
    }
  },

  // Crear nuevo gasto
  async create(gasto) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .insert([gasto])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al crear gasto:', error)
      return { data: null, error }
    }
  },

  // Actualizar gasto
  async update(id, gasto) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .update(gasto)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al actualizar gasto:', error)
      return { data: null, error }
    }
  },

  // Eliminar gasto (físico)
  async delete(id) {
    try {
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error al eliminar gasto:', error)
      return { error }
    }
  },

  // Eliminar gasto (lógico)
  async deleteLogico(id) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .update({ 
          activo: false,
          fecha_eliminacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al eliminar gasto lógicamente:', error)
      return { data: null, error }
    }
  },

  // Restaurar gasto eliminado lógicamente
  async restaurar(id) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .update({ 
          activo: true,
          fecha_eliminacion: null
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al restaurar gasto:', error)
      return { data: null, error }
    }
  },

  // Obtener gastos por rango de fechas
  async getByFechas(fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener gastos por fecha:', error)
      return { data: null, error }
    }
  },

  // Obtener total de gastos por mercadillo (solo activos)
  async getTotalByMercadillo(idMercadillo) {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('cantidad')
        .eq('id_mercadillo', idMercadillo)
        .neq('activo', false) // Solo gastos activos
      
      if (error) throw error
      
      const total = data.reduce((sum, gasto) => sum + gasto.cantidad, 0)
      return { data: total, error: null }
    } catch (error) {
      console.error('Error al obtener total de gastos:', error)
      return { data: null, error }
    }
  }
} 