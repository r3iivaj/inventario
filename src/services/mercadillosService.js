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
      // Filtrar solo los campos básicos que existen en la BD
      // Campos básicos: nombre, fecha, total_ventas
      const mercadilloBasico = {
        nombre: mercadillo.nombre,
        fecha: mercadillo.fecha,
        total_ventas: mercadillo.total_ventas || 0
      }
      
      // Intentar agregar campos opcionales si existen
      // Si la columna no existe, Supabase ignorará el campo o dará error
      // En ese caso, haremos un segundo intento sin esos campos
      
      let data, error
      
      // Primero intentar con todos los campos
      const resultado = await supabase
        .from('mercadillo')
        .insert([mercadillo])
        .select()
        .single()
      
      data = resultado.data
      error = resultado.error
      
      // Si hay error relacionado con columnas que no existen, intentar solo con campos básicos
      if (error && (error.message?.includes('column') || error.message?.includes('schema cache'))) {
        console.log('Error de columna no encontrada, intentando con campos básicos solamente')
        const resultadoBasico = await supabase
          .from('mercadillo')
          .insert([mercadilloBasico])
          .select()
          .single()
        
        data = resultadoBasico.data
        error = resultadoBasico.error
      }
      
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
  },

  // Cambiar estado del mercadillo
  async cambiarEstado(id, nuevoEstado) {
    try {
      const actualizacion = {
        estado: nuevoEstado
      }

      // Si se finaliza, marcar fecha de finalización
      if (nuevoEstado === 'finalizado') {
        actualizacion.fecha_finalizacion = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('mercadillo')
        .update(actualizacion)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      return { data: null, error }
    }
  },

  // Marcar stock como actualizado
  async marcarStockActualizado(id) {
    try {
      const { data, error } = await supabase
        .from('mercadillo')
        .update({ 
          stock_actualizado: true,
          fecha_actualizacion_stock: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error al marcar stock actualizado:', error)
      return { data: null, error }
    }
  },

  // Verificar si puede actualizar stock
  puedeActualizarStock(mercadillo) {
    // No puede actualizar si ya se actualizó
    if (mercadillo.stock_actualizado) {
      return { puede: false, razon: 'El stock ya fue actualizado anteriormente' }
    }

    // No puede actualizar si está en estado planificado
    if (mercadillo.estado === 'planificado') {
      return { puede: false, razon: 'El mercadillo debe estar finalizado para actualizar stock' }
    }

    // Verificar si es muy antiguo (más de 90 días)
    const fechaMercadillo = new Date(mercadillo.fecha)
    const hoy = new Date()
    const diasTranscurridos = Math.floor((hoy - fechaMercadillo) / (1000 * 60 * 60 * 24))
    
    if (diasTranscurridos > 90) {
      return { puede: false, razon: 'No se puede actualizar stock de mercadillos anteriores a 90 días' }
    }

    return { puede: true, razon: null }
  }
} 