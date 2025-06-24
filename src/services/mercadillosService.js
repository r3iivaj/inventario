import { supabase } from '../config/supabase'

export const mercadillosService = {
  // Obtener todos los mercadillos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('mercadillo')
        .select('*')
        .order('fecha', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener mercadillos:', error)
      return { data: null, error }
    }
  },

  // Obtener un mercadillo por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('mercadillo')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener mercadillo:', error)
      return { data: null, error }
    }
  },

  // Crear nuevo mercadillo
  async create(mercadillo) {
    try {
      const { data, error } = await supabase
        .from('mercadillo')
        .insert([mercadillo])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al crear mercadillo:', error)
      return { data: null, error }
    }
  },

  // Actualizar mercadillo
  async update(id, mercadillo) {
    try {
      const { data, error } = await supabase
        .from('mercadillo')
        .update(mercadillo)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al actualizar mercadillo:', error)
      return { data: null, error }
    }
  },

  // Eliminar mercadillo
  async delete(id) {
    try {
      const { error } = await supabase
        .from('mercadillo')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Error al eliminar mercadillo:', error)
      return { error }
    }
  },

  // Obtener mercadillos por rango de fechas
  async getByFechas(fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from('mercadillo')
        .select('*')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: false })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al obtener mercadillos por fecha:', error)
      return { data: null, error }
    }
  }
} 