import React, { useState, useEffect } from 'react'
import './MercadilloList.css'
import { mercadillosService } from '../services/mercadillosService'
import { gastosService } from '../services/gastosService'
import { productosMercadilloService } from '../services/productosMercadilloService'

const MercadilloList = ({ onSeleccionarMercadillo, onCrearMercadillo }) => {
  const [mercadillos, setMercadillos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [estadisticas, setEstadisticas] = useState({})

  useEffect(() => {
    cargarMercadillos()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cargarMercadillos = async () => {
    setCargando(true)
    try {
      const { data, error } = await mercadillosService.getAll()
      
      if (error) {
        console.error('Error al cargar mercadillos:', error)
        // Datos de prueba para modo demo
        const mercadillosPrueba = [
          {
            id: 1,
            nombre: 'Mercadillo Plaza Mayor',
            fecha: '2024-01-15',
            estado: 'finalizado',
            stock_actualizado: false,
            modo_actualizacion: 'manual',
            total_ventas: 0,
            descripcion: 'Mercadillo de fin de semana'
          },
          {
            id: 2,
            nombre: 'Feria del Carmen',
            fecha: '2024-01-08',
            estado: 'finalizado',
            stock_actualizado: true,
            modo_actualizacion: 'automatico',
            total_ventas: 0,
            descripcion: 'Feria anual del barrio'
          },
          {
            id: 3,
            nombre: 'Mercado Navideño',
            fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            estado: 'planificado',
            stock_actualizado: false,
            modo_actualizacion: 'automatico',
            total_ventas: 0,
            descripcion: 'Mercado especial de Navidad'
          }
        ]
        setMercadillos(mercadillosPrueba)
        // Cargar estadísticas de prueba
        await cargarEstadisticasPrueba(mercadillosPrueba)
      } else {
        setMercadillos(data || [])
        await cargarEstadisticas(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setMercadillos([])
    } finally {
      setCargando(false)
    }
  }

  const cargarEstadisticas = async (listaMercadillos) => {
    const stats = {}
    
    for (const mercadillo of listaMercadillos) {
      try {
        const [ingresos, gastos] = await Promise.all([
          productosMercadilloService.getTotalVendidoByMercadillo(mercadillo.id),
          gastosService.getTotalByMercadillo(mercadillo.id)
        ])
        
        stats[mercadillo.id] = {
          ingresos: ingresos.data || 0,
          gastos: gastos.data || 0,
          beneficio: (ingresos.data || 0) - (gastos.data || 0)
        }
      } catch (error) {
        console.error(`Error al cargar estadísticas del mercadillo ${mercadillo.id}:`, error)
        stats[mercadillo.id] = { ingresos: 0, gastos: 0, beneficio: 0 }
      }
    }
    
    setEstadisticas(stats)
  }

  const cargarEstadisticasPrueba = async (listaMercadillos) => {
    const stats = {}
    listaMercadillos.forEach(mercadillo => {
      // Sin datos simulados - solo estadísticas reales
      stats[mercadillo.id] = {
        ingresos: 0,
        gastos: 0,
        beneficio: 0
      }
    })
    setEstadisticas(stats)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearPrecio = (precio) => {
    return `${precio.toFixed(2)}€`
  }

  const obtenerEstadoInfo = (mercadillo) => {
    const { estado, stock_actualizado } = mercadillo
    
    switch (estado) {
      case 'planificado':
        return { emoji: '📅', texto: 'Planificado', clase: 'planificado' }
      case 'activo':
        return { emoji: '🔴', texto: 'En Curso', clase: 'activo' }
      case 'finalizado':
        if (stock_actualizado) {
          return { emoji: '✅', texto: 'Finalizado', clase: 'finalizado-completo' }
        } else {
          return { emoji: '⏳', texto: 'Finalizado', clase: 'finalizado-pendiente' }
        }
      default:
        return { emoji: '❓', texto: 'Desconocido', clase: 'desconocido' }
    }
  }

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Cargando mercadillos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <span>📍</span>
          <span>Mercadillos</span>
        </h2>
        <button 
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 justify-center sm:justify-start"
          onClick={onCrearMercadillo}
        >
          <span>➕</span>
          <span>Nuevo Mercadillo</span>
        </button>
      </div>

      {/* Grid de mercadillos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {mercadillos.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-4">No hay mercadillos registrados</p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
              onClick={onCrearMercadillo}
            >
              <span>➕</span>
              <span>Crear primer mercadillo</span>
            </button>
          </div>
        ) : (
          mercadillos.map(mercadillo => {
            const stats = estadisticas[mercadillo.id] || { ingresos: 0, gastos: 0, beneficio: 0 }
            const estadoInfo = obtenerEstadoInfo(mercadillo)
            
            return (
              <div 
                key={mercadillo.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 cursor-pointer overflow-hidden"
                onClick={() => onSeleccionarMercadillo(mercadillo)}
              >
                <div className="p-4 sm:p-6">
                  {/* Header del mercadillo */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
                        {mercadillo.nombre}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-2">
                        <span>📅</span>
                        <span>{formatearFecha(mercadillo.fecha)}</span>
                      </p>
                      {mercadillo.descripcion && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                          {mercadillo.descripcion}
                        </p>
                      )}
                    </div>
                    <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                      estadoInfo.clase === 'planificado' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                      estadoInfo.clase === 'activo' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                      estadoInfo.clase === 'finalizado-completo' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                      estadoInfo.clase === 'finalizado-pendiente' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {estadoInfo.emoji} {estadoInfo.texto}
                    </span>
                  </div>

                  {/* Advertencia de stock pendiente */}
                  {mercadillo.estado === 'finalizado' && !mercadillo.stock_actualizado && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-yellow-700 dark:text-yellow-400 text-sm font-medium flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Stock pendiente de actualizar</span>
                      </p>
                    </div>
                  )}
                  
                  {/* Estadísticas */}
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>💰</span>
                        <span>Ingresos:</span>
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatearPrecio(stats.ingresos)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>💸</span>
                        <span>Gastos:</span>
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatearPrecio(stats.gastos)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <span>📊</span>
                        <span>Beneficio:</span>
                      </span>
                      <span className={`font-bold text-lg ${
                        stats.beneficio >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatearPrecio(stats.beneficio)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MercadilloList 