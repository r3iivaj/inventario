import React, { useState } from 'react'
import './MercadilloForm.css'
import { mercadillosService } from '../services/mercadillosService'

const MercadilloForm = ({ onVolver, onMercadilloCreado }) => {
  const [formulario, setFormulario] = useState({
    nombre: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    estado: 'planificado',
    modo_actualizacion: 'manual'
  })
  const [guardando, setGuardando] = useState(false)

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormulario(prev => ({
        ...prev,
        modo_actualizacion: checked ? 'automatico' : 'manual'
      }))
    } else {
      setFormulario(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const determinarEstadoInicial = () => {
    const fechaMercadillo = new Date(formulario.fecha)
    const hoy = new Date()
    
    // Si la fecha es anterior a hoy, es un mercadillo histórico
    if (fechaMercadillo < hoy) {
      return 'finalizado'
    }
    
    // Si es hoy o futuro, empieza como planificado
    return 'planificado'
  }

  const esMercadilloHistorico = () => {
    const fechaMercadillo = new Date(formulario.fecha)
    const hoy = new Date()
    return fechaMercadillo < hoy
  }

  const manejarSubmit = async (e) => {
    e.preventDefault()
    
    if (!formulario.nombre.trim()) {
      alert('El nombre del mercadillo es obligatorio')
      return
    }

    setGuardando(true)
    
    try {
      // Construir objeto mercadillo solo con campos básicos que existen en la base de datos
      // Según el esquema: id, nombre, fecha, total_ventas, created_at
      const mercadillo = {
        nombre: formulario.nombre.trim(),
        fecha: formulario.fecha,
        total_ventas: 0
      }
      
      // Intentar agregar campos adicionales si existen en la BD
      // Estos campos pueden no existir en todas las versiones del esquema
      // Se envía null o se omite si no existe la columna
      
      // Descripción (opcional - puede no existir en la BD)
      if (formulario.descripcion && formulario.descripcion.trim()) {
        // Solo agregar si la columna existe (se manejará el error si no existe)
        mercadillo.descripcion = formulario.descripcion.trim()
      }
      
      // Estado y otros campos opcionales (pueden no existir)
      const estadoInicial = determinarEstadoInicial()
      // Intentar agregar estos campos, pero no fallar si no existen
      mercadillo.estado = estadoInicial
      mercadillo.modo_actualizacion = formulario.modo_actualizacion
      mercadillo.stock_actualizado = false

      const { data, error } = await mercadillosService.create(mercadillo)
      
      if (error) {
        console.error('Error al crear mercadillo:', error)
        alert('Error al crear el mercadillo: ' + (error.message || 'Error desconocido'))
        return
      }
      
      if (onMercadilloCreado) onMercadilloCreado(data)
    } catch (error) {
      console.error('Error al crear mercadillo:', error)
      alert('Error al crear el mercadillo')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          onClick={onVolver}
        >
          ← Volver
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>📍</span>
          <span>Nuevo Mercadillo</span>
        </h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={manejarSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre del Mercadillo *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Ej: Mercadillo Plaza Mayor"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formulario.fecha}
              onChange={manejarCambio}
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {esMercadilloHistorico() && (
              <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-orange-700 dark:text-orange-400 text-sm">
                  ℹ️ Este mercadillo se creará como <strong>finalizado</strong> (fecha anterior a hoy)
                </p>
              </div>
            )}
            {!esMercadilloHistorico() && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-blue-700 dark:text-blue-400 text-sm">
                  ℹ️ Este mercadillo se creará como <strong>planificado</strong>
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              placeholder="Descripción opcional del mercadillo..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            />
          </div>

          <div>
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="actualizacion_automatica"
                checked={formulario.modo_actualizacion === 'automatico'}
                onChange={manejarCambio}
                disabled={esMercadilloHistorico()}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
              />
              <label htmlFor="actualizacion_automatica" className="flex-1">
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actualizar stock automáticamente al finalizar
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {esMercadilloHistorico() 
                    ? 'No disponible para mercadillos históricos'
                    : 'El stock se actualizará automáticamente cuando finalices el mercadillo'
                  }
                </span>
              </label>
            </div>
          </div>

          {esMercadilloHistorico() && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                📚 Mercadillo Histórico
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Al crear un mercadillo con fecha anterior, podrás:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Registrar ventas y gastos del evento pasado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Mantener un historial completo de mercadillos</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Actualizar stock manualmente si es necesario</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>La actualización automática no está disponible</span>
                </li>
              </ul>
            </div>
          )}

          <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button 
              type="button" 
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
              onClick={onVolver}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={guardando || !formulario.nombre.trim()}
            >
              {guardando ? 'Creando...' : 'Crear Mercadillo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MercadilloForm 