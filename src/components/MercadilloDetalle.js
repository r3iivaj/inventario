import React, { useState, useEffect } from 'react'
import './MercadilloDetalle.css'
import { mercadillosService } from '../services/mercadillosService'
import { gastosService } from '../services/gastosService'
import { productosMercadilloService } from '../services/productosMercadilloService'
import { productosService } from '../services/productosService'
import { stockService } from '../services/stockService'

const MercadilloDetalle = ({ mercadillo, onVolver, onActualizar }) => {
  const [gastos, setGastos] = useState([])
  const [ingresos, setIngresos] = useState([])
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarFormGasto, setMostrarFormGasto] = useState(false)
  const [nuevoGasto, setNuevoGasto] = useState({
    descripcion: '',
    cantidad: ''
  })
  const [gastoEditando, setGastoEditando] = useState(null)
  const [mostrarFormEditarGasto, setMostrarFormEditarGasto] = useState(false)
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [productosEncontrados, setProductosEncontrados] = useState([])
  const [productosEnMercadillo, setProductosEnMercadillo] = useState({})
  const [mostrarModalStock, setMostrarModalStock] = useState(false)
  const [previewStock, setPreviewStock] = useState([])
  const [actualizandoStock, setActualizandoStock] = useState(false)
  const [mercadilloActual, setMercadilloActual] = useState(mercadillo)

  // Actualizar mercadilloActual cuando cambia el prop mercadillo
  useEffect(() => {
    setMercadilloActual(mercadillo)
  }, [mercadillo])

  useEffect(() => {
    cargarDatos()
  }, [mercadillo.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [gastosResult, ingresosResult, productosResult] = await Promise.all([
        gastosService.getByMercadillo(mercadillo.id),
        productosMercadilloService.getByMercadilloConDetalles(mercadillo.id),
        productosService.getAll()
      ])

      if (gastosResult.error) {
        // Sin datos de prueba - solo gastos reales de la base de datos
        setGastos([])
      } else {
        setGastos(gastosResult.data || [])
      }

      if (ingresosResult.error) {
        setIngresos([])
      } else {
        setIngresos(ingresosResult.data || [])
      }

      if (productosResult.error) {
        setProductos([])
      } else {
        setProductos(productosResult.data || [])
      }

      // Crear mapa de productos en mercadillo
      const productosMap = {}
      const ingresosData = ingresosResult.error ? [] : (ingresosResult.data || [])
      ingresosData.forEach(ingreso => {
        if (ingreso && ingreso.id_producto) {
          productosMap[ingreso.id_producto] = {
            cantidad: ingreso.cantidad || 0,
            precio_unitario: ingreso.precio_unitario || 0,
            total: ingreso.total_vendido || 0
          }
        }
      })
      setProductosEnMercadillo(productosMap)
      
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setCargando(false)
    }
  }

  const agregarGasto = async () => {
    try {
      const gasto = {
        id_mercadillo: mercadilloActual.id,
        descripcion: nuevoGasto.descripcion,
        cantidad: parseFloat(nuevoGasto.cantidad),
        fecha: new Date().toISOString().split('T')[0],
        activo: true
      }

      const { data, error } = await gastosService.create(gasto)
      
      if (error) {
        // Modo demo: agregar localmente
        const gastoDemo = {
          id: Date.now(),
          ...gasto
        }
        setGastos([...gastos, gastoDemo])
      } else {
        setGastos([...gastos, data])
      }

      setNuevoGasto({ descripcion: '', cantidad: '' })
      setMostrarFormGasto(false)
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al agregar gasto:', error)
      alert('Error al agregar gasto')
    }
  }

  const editarGasto = (gasto) => {
    setGastoEditando({
      id: gasto.id,
      descripcion: gasto.descripcion,
      cantidad: gasto.cantidad.toString()
    })
    setMostrarFormEditarGasto(true)
  }

  const guardarEdicionGasto = async () => {
    try {
      const gastoActualizado = {
        descripcion: gastoEditando.descripcion,
        cantidad: parseFloat(gastoEditando.cantidad)
      }

      const { data, error } = await gastosService.update(gastoEditando.id, gastoActualizado)
      
      if (error) {
        // Modo demo: actualizar localmente
        setGastos(gastos.map(g => 
          g.id === gastoEditando.id 
            ? { ...g, ...gastoActualizado }
            : g
        ))
      } else {
        setGastos(gastos.map(g => g.id === gastoEditando.id ? data : g))
      }

      setGastoEditando(null)
      setMostrarFormEditarGasto(false)
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al editar gasto:', error)
      alert('Error al editar gasto')
    }
  }

  const eliminarGasto = async (gastoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este gasto? Esta acción reducirá el total de gastos del mercadillo.')) {
      return
    }

    try {
      const { error } = await gastosService.deleteLogico(gastoId)
      
      if (error) {
        // Modo demo: marcar como inactivo localmente
        setGastos(gastos.map(g => 
          g.id === gastoId 
            ? { ...g, activo: false, fecha_eliminacion: new Date().toISOString() }
            : g
        ).filter(g => g.activo !== false)) // Filtrar gastos inactivos de la vista
      } else {
        // Remover de la lista local (ya que está marcado como inactivo)
        setGastos(gastos.filter(g => g.id !== gastoId))
      }

      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al eliminar gasto:', error)
      alert('Error al eliminar gasto')
    }
  }

  // Funciones para el nuevo sistema de ingresos
  const buscarProductos = (termino) => {
    if (!termino.trim()) {
      setProductosEncontrados([])
      return
    }
    
    const productosFiltrados = productos.filter(producto =>
      producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(termino.toLowerCase())
    )
    setProductosEncontrados(productosFiltrados)
  }

  const agregarProductoAMercadillo = async (producto) => {
    try {
      const ingreso = {
        id_mercadillo: mercadillo.id,
        id_producto: producto.id,
        cantidad: 1,
        precio_unitario: producto.precio_venta,
        total_vendido: producto.precio_venta
      }

      const { data, error } = await productosMercadilloService.create(ingreso)
      
      if (error) {
        // Modo demo: agregar localmente
        const ingresoDemo = {
          id: Date.now(),
          ...ingreso,
          producto: producto
        }
        setIngresos([...ingresos, ingresoDemo])
        setProductosEnMercadillo({
          ...productosEnMercadillo,
          [producto.id]: { cantidad: 1, precio_unitario: producto.precio_venta, total: producto.precio_venta }
        })
      } else {
        setIngresos([...ingresos, data])
        setProductosEnMercadillo({
          ...productosEnMercadillo,
          [producto.id]: { cantidad: 1, precio_unitario: producto.precio_venta, total: producto.precio_venta }
        })
      }

      // Limpiar búsqueda
      setBusquedaProducto('')
      setProductosEncontrados([])
      
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al agregar producto:', error)
      alert('Error al agregar producto')
    }
  }

  const actualizarCantidadProducto = async (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      eliminarProductoDelMercadillo(productoId)
      return
    }

    try {
      const ingresoExistente = ingresos.find(i => i.id_producto === productoId)
      const producto = productos.find(p => p.id === productoId)
      
      if (!ingresoExistente || !producto) return

      const ingresoActualizado = {
        cantidad: nuevaCantidad,
        total_vendido: nuevaCantidad * ingresoExistente.precio_unitario
      }

      const { data, error } = await productosMercadilloService.update(ingresoExistente.id, ingresoActualizado)
      
      if (error) {
        // Modo demo: actualizar localmente
        setIngresos(ingresos.map(i => 
          i.id === ingresoExistente.id 
            ? { ...i, ...ingresoActualizado }
            : i
        ))
        setProductosEnMercadillo({
          ...productosEnMercadillo,
          [productoId]: { 
            cantidad: nuevaCantidad, 
            precio_unitario: ingresoExistente.precio_unitario,
            total: nuevaCantidad * ingresoExistente.precio_unitario
          }
        })
      } else {
        setIngresos(ingresos.map(i => i.id === ingresoExistente.id ? data : i))
        setProductosEnMercadillo({
          ...productosEnMercadillo,
          [productoId]: { 
            cantidad: nuevaCantidad, 
            precio_unitario: ingresoExistente.precio_unitario,
            total: nuevaCantidad * ingresoExistente.precio_unitario
          }
        })
      }

      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al actualizar cantidad:', error)
      alert('Error al actualizar cantidad')
    }
  }

  const eliminarProductoDelMercadillo = async (productoId) => {
    try {
      const ingresoExistente = ingresos.find(i => i.id_producto === productoId)
      if (!ingresoExistente) return

      const { error } = await productosMercadilloService.delete(ingresoExistente.id)
      
      if (error) {
        // Modo demo: eliminar localmente
        setIngresos(ingresos.filter(i => i.id !== ingresoExistente.id))
        const nuevosProductos = { ...productosEnMercadillo }
        delete nuevosProductos[productoId]
        setProductosEnMercadillo(nuevosProductos)
      } else {
        setIngresos(ingresos.filter(i => i.id !== ingresoExistente.id))
        const nuevosProductos = { ...productosEnMercadillo }
        delete nuevosProductos[productoId]
        setProductosEnMercadillo(nuevosProductos)
      }

      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar producto')
    }
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES')
  }

  const formatearPrecio = (precio) => {
    return `${precio.toFixed(2)}€`
  }

  const obtenerEstadoInfo = (estado, stockActualizado) => {
    switch (estado) {
      case 'planificado':
        return { emoji: '📅', texto: 'Planificado', clase: 'planificado' }
      case 'activo':
        return { emoji: '🔴', texto: 'En Curso', clase: 'activo' }
      case 'finalizado':
        if (stockActualizado) {
          return { emoji: '✅', texto: 'Finalizado', clase: 'finalizado-completo' }
        } else {
          return { emoji: '⏳', texto: 'Finalizado', clase: 'finalizado-pendiente' }
        }
      default:
        return { emoji: '❓', texto: 'Desconocido', clase: 'desconocido' }
    }
  }

  const cambiarEstado = async (nuevoEstado) => {
    try {
      const { data, error } = await mercadillosService.cambiarEstado(mercadilloActual.id, nuevoEstado)
      
      if (error) {
        // Modo demo
        const mercadilloActualizado = { ...mercadilloActual, estado: nuevoEstado }
        setMercadilloActual(mercadilloActualizado)
        console.log(`Estado cambiado a ${nuevoEstado} (modo demo)`)
      } else {
        setMercadilloActual(data)
        console.log('Estado actualizado exitosamente')
      }
      
      if (onActualizar) onActualizar()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar el estado del mercadillo')
    }
  }

  const previsualizarStock = async () => {
    const { preview, error } = await stockService.previsualizarActualizacionStock(mercadilloActual.id)
    
    if (error) {
      alert(`Error al previsualizar: ${error}`)
      return
    }
    
    setPreviewStock(preview)
    setMostrarModalStock(true)
  }

  const confirmarActualizacionStock = async () => {
    setActualizandoStock(true)
    
    try {
      const resultado = await stockService.actualizarStockDesdeMercadillo(mercadilloActual.id)
      
      if (resultado.exito) {
        // Actualizar estado del mercadillo
        const mercadilloActualizado = { ...mercadilloActual, stock_actualizado: true }
        setMercadilloActual(mercadilloActualizado)
        
        // Mostrar resumen
        if (resultado.resultados && resultado.resultados.length > 0) {
          const mensaje = resultado.modoDemo 
            ? `✅ Stock actualizado (modo demo):\n\n${resultado.resultados.map(r => 
                `• ${r.producto}: ${r.stockAnterior} → ${r.nuevoStock} (-${r.vendido})`
              ).join('\n')}`
            : `✅ Stock actualizado exitosamente:\n\n${resultado.resultados.filter(r => r.exito).map(r => 
                `• ${r.producto}: ${r.stockAnterior} → ${r.nuevoStock} (-${r.vendido})`
              ).join('\n')}`
          
          alert(mensaje)
        } else {
          alert('✅ Stock actualizado exitosamente')
        }
        
        setMostrarModalStock(false)
        // Recargar datos para reflejar cambios en el stock
        await cargarDatos()
        if (onActualizar) onActualizar()
      } else {
        alert(`❌ Error al actualizar stock: ${resultado.error || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado al actualizar stock')
    } finally {
      setActualizandoStock(false)
    }
  }

  const puedeActualizarStock = () => {
    if (mercadilloActual.stock_actualizado) return false
    if (mercadilloActual.estado === 'planificado') return false
    
    // Verificar si es muy antiguo (más de 90 días)
    const fechaMercadillo = new Date(mercadilloActual.fecha)
    const hoy = new Date()
    const diasTranscurridos = Math.floor((hoy - fechaMercadillo) / (1000 * 60 * 60 * 24))
    
    return diasTranscurridos <= 90
  }

  const totalGastos = (gastos || []).filter(g => g.activo !== false).reduce((sum, gasto) => sum + (gasto.cantidad || 0), 0)
  const totalIngresos = (ingresos || []).reduce((sum, ingreso) => sum + (ingreso.total_vendido || 0), 0)
  const beneficio = totalIngresos - totalGastos

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Cargando detalles...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            onClick={onVolver}
          >
            ← Volver
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              {mercadilloActual.nombre}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
              📅 {formatearFecha(mercadilloActual.fecha)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).clase === 'planificado' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
            obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).clase === 'activo' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
            obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).clase === 'finalizado-completo' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
            obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).clase === 'finalizado-pendiente' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).emoji} {obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).texto}
          </span>
          
          {mercadilloActual.estado === 'planificado' && (
            <button 
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              onClick={() => cambiarEstado('activo')}
            >
              ▶️ Iniciar
            </button>
          )}
          
          {mercadilloActual.estado === 'activo' && (
            <button 
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              onClick={() => cambiarEstado('finalizado')}
            >
              ⏹️ Finalizar
            </button>
          )}
          
          {puedeActualizarStock() && (
            <button 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              onClick={previsualizarStock}
            >
              📦 Actualizar Stock
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            💰 Ingresos
          </h3>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatearPrecio(totalIngresos)}
          </span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            💸 Gastos
          </h3>
          <span className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatearPrecio(totalGastos)}
          </span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            📊 Beneficio
          </h3>
          <span className={`text-2xl font-bold ${beneficio >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatearPrecio(beneficio)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              💰 Ingresos
            </h3>
          </div>

          {/* Buscador de productos */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos para añadir..."
                value={busquedaProducto}
                onChange={(e) => {
                  setBusquedaProducto(e.target.value)
                  buscarProductos(e.target.value)
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg">
                🔍
              </span>
            </div>

            {/* Resultados de búsqueda */}
            {productosEncontrados.length > 0 && (
              <div className="mt-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg max-h-60 overflow-y-auto">
                {productosEncontrados.map(producto => (
                  <div key={producto.id} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {producto.nombre}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatearPrecio(producto.precio_venta)} • {producto.categoria}
                      </p>
                    </div>
                    <button 
                      className={`ml-3 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        productosEnMercadillo[producto.id] 
                          ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                      }`}
                      onClick={() => agregarProductoAMercadillo(producto)}
                      disabled={productosEnMercadillo[producto.id]}
                    >
                      {productosEnMercadillo[producto.id] ? '✓ Añadido' : '+ Añadir'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista de productos en el mercadillo */}
          <div className="space-y-3">
            {ingresos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-gray-600 dark:text-gray-400">No hay ingresos registrados</p>
              </div>
            ) : (
              ingresos.map(ingreso => (
                <div key={ingreso.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {ingreso.producto?.nombre || 'Producto desconocido'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {ingreso.producto?.categoria}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatearPrecio(ingreso.precio_unitario)} c/u
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                        <button 
                          className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-l-lg transition-colors"
                          onClick={() => actualizarCantidadProducto(ingreso.id_producto, ingreso.cantidad - 1)}
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-gray-900 dark:text-gray-100 border-x border-gray-200 dark:border-gray-500">
                          {ingreso.cantidad}
                        </span>
                        <button 
                          className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-r-lg transition-colors"
                          onClick={() => actualizarCantidadProducto(ingreso.id_producto, ingreso.cantidad + 1)}
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-green-600 dark:text-green-400 min-w-0">
                        {formatearPrecio(ingreso.total_vendido)}
                      </span>

                      <button 
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        onClick={() => eliminarProductoDelMercadillo(ingreso.id_producto)}
                        title="Eliminar producto"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              💸 Gastos
            </h3>
            <button 
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              onClick={() => setMostrarFormGasto(true)}
            >
              + Nuevo Gasto
            </button>
          </div>

          {mostrarFormGasto && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Nuevo Gasto</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción:
                      </label>
                      <input 
                        type="text"
                        value={nuevoGasto.descripcion}
                        onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                        placeholder="Ej: Gasolina, Mesa, Comida..."
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cantidad:
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={nuevoGasto.cantidad}
                        onChange={(e) => setNuevoGasto({...nuevoGasto, cantidad: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
                      onClick={() => setMostrarFormGasto(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={agregarGasto}
                      disabled={!nuevoGasto.descripcion || !nuevoGasto.cantidad}
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mostrarFormEditarGasto && gastoEditando && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Editar Gasto</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Descripción:
                      </label>
                      <input 
                        type="text"
                        value={gastoEditando.descripcion}
                        onChange={(e) => setGastoEditando({...gastoEditando, descripcion: e.target.value})}
                        placeholder="Ej: Gasolina, Mesa, Comida..."
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cantidad:
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        value={gastoEditando.cantidad}
                        onChange={(e) => setGastoEditando({...gastoEditando, cantidad: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
                      onClick={() => {
                        setMostrarFormEditarGasto(false)
                        setGastoEditando(null)
                      }}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={guardarEdicionGasto}
                      disabled={!gastoEditando.descripcion || !gastoEditando.cantidad}
                    >
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {gastos.filter(g => g.activo !== false).length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💸</div>
                <p className="text-gray-600 dark:text-gray-400">No hay gastos registrados</p>
              </div>
            ) : (
              gastos.filter(g => g.activo !== false).map(gasto => (
                <div key={gasto.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {gasto.descripcion}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {formatearFecha(gasto.fecha)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {formatearPrecio(gasto.cantidad)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          onClick={() => editarGasto(gasto)}
                          title="Editar gasto"
                        >
                          ✏️
                        </button>
                        <button 
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          onClick={() => eliminarGasto(gasto.id)}
                          title="Eliminar gasto"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Actualización de Stock */}
      {mostrarModalStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                📦 Actualizar Stock del Inventario
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Se actualizará el stock de los siguientes productos basado en las ventas registradas:
              </p>
              
              <div className="mb-6">
                {previewStock.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-gray-600 dark:text-gray-400">No hay ventas registradas para actualizar stock</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-100 dark:bg-gray-600 font-medium text-gray-800 dark:text-gray-200 text-sm">
                      <span>Producto</span>
                      <span>Stock Actual</span>
                      <span>Vendido</span>
                      <span>Nuevo Stock</span>
                    </div>
                    {previewStock.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-4 border-t border-gray-200 dark:border-gray-600">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.producto}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.stockActual}
                        </span>
                        <span className="text-red-600 dark:text-red-400">
                          -{item.vendido}
                        </span>
                        <span className={`font-medium ${
                          item.nuevoStock === 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {item.nuevoStock}
                          {item.nuevoStock === 0 && ' (Agotado)'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                    ⚠️ <strong>Atención:</strong> Esta acción no se puede deshacer. El stock se reducirá permanentemente.
                  </p>
                </div>
                {mercadilloActual.stock_actualizado && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-700 dark:text-red-400 text-sm">
                      ❌ <strong>Error:</strong> El stock de este mercadillo ya fue actualizado anteriormente.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-4 rounded-lg transition-colors"
                  onClick={() => setMostrarModalStock(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={confirmarActualizacionStock}
                  disabled={actualizandoStock || previewStock.length === 0 || mercadilloActual.stock_actualizado}
                >
                  {actualizandoStock ? 'Actualizando...' : 'Confirmar Actualización'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MercadilloDetalle 