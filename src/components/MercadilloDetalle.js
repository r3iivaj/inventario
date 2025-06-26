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

  useEffect(() => {
    cargarDatos()
  }, [mercadillo.id])

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
        productosMap[ingreso.id_producto] = {
          cantidad: ingreso.cantidad,
          precio_unitario: ingreso.precio_unitario,
          total: ingreso.total_vendido
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
        const mensaje = resultado.modoDemo 
          ? `✅ Stock actualizado (modo demo):\n\n${resultado.resultados.map(r => 
              `• ${r.producto}: ${r.stockAnterior} → ${r.nuevoStock} (-${r.vendido})`
            ).join('\n')}`
          : `✅ Stock actualizado exitosamente:\n\n${resultado.resultados.filter(r => r.exito).map(r => 
              `• ${r.producto}: ${r.stockAnterior} → ${r.nuevoStock} (-${r.vendido})`
            ).join('\n')}`
        
        alert(mensaje)
        setMostrarModalStock(false)
        if (onActualizar) onActualizar()
      } else {
        alert(`❌ Error al actualizar stock: ${resultado.error}`)
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

  const totalGastos = gastos.filter(g => g.activo !== false).reduce((sum, gasto) => sum + gasto.cantidad, 0)
  const totalIngresos = ingresos.reduce((sum, ingreso) => sum + ingreso.total_vendido, 0)
  const beneficio = totalIngresos - totalGastos

  if (cargando) {
    return <div className="mercadillo-detalle-loading">Cargando detalles...</div>
  }

  return (
    <div className="mercadillo-detalle">
      <div className="mercadillo-detalle-header">
        <button className="btn-volver" onClick={onVolver}>
          ← Volver
        </button>
        <div className="mercadillo-titulo">
          <div className="titulo-info">
            <h2>{mercadilloActual.nombre}</h2>
            <p className="mercadillo-fecha">📅 {formatearFecha(mercadilloActual.fecha)}</p>
          </div>
          <div className="controles-estado">
            <span className={`estado-badge ${obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).clase}`}>
              {obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).emoji} {obtenerEstadoInfo(mercadilloActual.estado, mercadilloActual.stock_actualizado).texto}
            </span>
            
            {mercadilloActual.estado === 'planificado' && (
              <button 
                className="btn-estado iniciar"
                onClick={() => cambiarEstado('activo')}
              >
                ▶️ Iniciar
              </button>
            )}
            
            {mercadilloActual.estado === 'activo' && (
              <button 
                className="btn-estado finalizar"
                onClick={() => cambiarEstado('finalizado')}
              >
                ⏹️ Finalizar
              </button>
            )}
            
            {puedeActualizarStock() && (
              <button 
                className="btn-estado actualizar-stock"
                onClick={previsualizarStock}
              >
                📦 Actualizar Stock
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="resumen-financiero">
        <div className="resumen-card ingresos">
          <h3>💰 Ingresos</h3>
          <span className="resumen-valor">{formatearPrecio(totalIngresos)}</span>
        </div>
        <div className="resumen-card gastos">
          <h3>💸 Gastos</h3>
          <span className="resumen-valor">{formatearPrecio(totalGastos)}</span>
        </div>
        <div className={`resumen-card beneficio ${beneficio >= 0 ? 'positivo' : 'negativo'}`}>
          <h3>📊 Beneficio</h3>
          <span className="resumen-valor">{formatearPrecio(beneficio)}</span>
        </div>
      </div>

      <div className="mercadillo-content">
        <div className="seccion-ingresos">
          <div className="seccion-header">
            <h3>💰 Ingresos</h3>
          </div>

          {/* Buscador de productos */}
          <div className="buscador-productos">
            <div className="input-busqueda">
              <input
                type="text"
                placeholder="Buscar productos para añadir..."
                value={busquedaProducto}
                onChange={(e) => {
                  setBusquedaProducto(e.target.value)
                  buscarProductos(e.target.value)
                }}
              />
              <span className="icono-busqueda">🔍</span>
            </div>

            {/* Resultados de búsqueda */}
            {productosEncontrados.length > 0 && (
              <div className="resultados-busqueda">
                {productosEncontrados.map(producto => (
                  <div key={producto.id} className="resultado-producto">
                    <div className="producto-info">
                      <span className="producto-nombre">{producto.nombre}</span>
                      <span className="producto-precio">{formatearPrecio(producto.precio_venta)}</span>
                      <span className="producto-categoria">{producto.categoria}</span>
                    </div>
                    <button 
                      className="btn-agregar-producto"
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
          <div className="lista-items">
            {ingresos.length === 0 ? (
              <p className="no-items">No hay ingresos registrados</p>
            ) : (
              ingresos.map(ingreso => (
                <div key={ingreso.id} className="item-card ingreso-producto">
                  <div className="producto-detalle">
                    <div className="producto-nombre-categoria">
                      <h4>{ingreso.producto?.nombre || 'Producto desconocido'}</h4>
                      <span className="categoria">{ingreso.producto?.categoria}</span>
                    </div>
                    <div className="precio-unitario">
                      {formatearPrecio(ingreso.precio_unitario)} c/u
                    </div>
                  </div>
                  
                  <div className="controles-cantidad">
                    <button 
                      className="btn-cantidad"
                      onClick={() => actualizarCantidadProducto(ingreso.id_producto, ingreso.cantidad - 1)}
                    >
                      -
                    </button>
                    <span className="cantidad-actual">{ingreso.cantidad}</span>
                    <button 
                      className="btn-cantidad"
                      onClick={() => actualizarCantidadProducto(ingreso.id_producto, ingreso.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="total-producto">
                    {formatearPrecio(ingreso.total_vendido)}
                  </div>

                  <button 
                    className="btn-eliminar-producto"
                    onClick={() => eliminarProductoDelMercadillo(ingreso.id_producto)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="seccion-gastos">
          <div className="seccion-header">
            <h3>💸 Gastos</h3>
            <button 
              className="btn-agregar"
              onClick={() => setMostrarFormGasto(true)}
            >
              + Nuevo Gasto
            </button>
          </div>

          {mostrarFormGasto && (
            <div className="form-overlay">
              <div className="form-modal">
                <h4>Nuevo Gasto</h4>
                <div className="form-group">
                  <label>Descripción:</label>
                  <input 
                    type="text"
                    value={nuevoGasto.descripcion}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, descripcion: e.target.value})}
                    placeholder="Ej: Gasolina, Mesa, Comida..."
                  />
                </div>
                <div className="form-group">
                  <label>Cantidad:</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={nuevoGasto.cantidad}
                    onChange={(e) => setNuevoGasto({...nuevoGasto, cantidad: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-cancelar"
                    onClick={() => setMostrarFormGasto(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-guardar"
                    onClick={agregarGasto}
                    disabled={!nuevoGasto.descripcion || !nuevoGasto.cantidad}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {mostrarFormEditarGasto && gastoEditando && (
            <div className="form-overlay">
              <div className="form-modal">
                <h4>Editar Gasto</h4>
                <div className="form-group">
                  <label>Descripción:</label>
                  <input 
                    type="text"
                    value={gastoEditando.descripcion}
                    onChange={(e) => setGastoEditando({...gastoEditando, descripcion: e.target.value})}
                    placeholder="Ej: Gasolina, Mesa, Comida..."
                  />
                </div>
                <div className="form-group">
                  <label>Cantidad:</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={gastoEditando.cantidad}
                    onChange={(e) => setGastoEditando({...gastoEditando, cantidad: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button 
                    className="btn-cancelar"
                    onClick={() => {
                      setMostrarFormEditarGasto(false)
                      setGastoEditando(null)
                    }}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-guardar"
                    onClick={guardarEdicionGasto}
                    disabled={!gastoEditando.descripcion || !gastoEditando.cantidad}
                  >
                    Actualizar
                  </button>
                </div>
              </div>
            </div>
          )}

                      <div className="lista-items">
            {gastos.filter(g => g.activo !== false).length === 0 ? (
              <p className="no-items">No hay gastos registrados</p>
            ) : (
              gastos.filter(g => g.activo !== false).map(gasto => (
                <div key={gasto.id} className="item-card gasto">
                  <div className="item-info">
                    <h4>{gasto.descripcion}</h4>
                    <p>{formatearFecha(gasto.fecha)}</p>
                  </div>
                  <div className="item-actions">
                    <div className="item-total">
                      {formatearPrecio(gasto.cantidad)}
                    </div>
                    <div className="gasto-botones">
                      <button 
                        className="btn-editar-gasto"
                        onClick={() => editarGasto(gasto)}
                        title="Editar gasto"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-eliminar-gasto"
                        onClick={() => eliminarGasto(gasto.id)}
                        title="Eliminar gasto"
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
      </div>

      {/* Modal de Actualización de Stock */}
      {mostrarModalStock && (
        <div className="form-overlay">
          <div className="modal-stock">
            <h3>📦 Actualizar Stock del Inventario</h3>
            <p>Se actualizará el stock de los siguientes productos basado en las ventas registradas:</p>
            
            <div className="preview-stock">
              {previewStock.length === 0 ? (
                <p className="no-ventas">No hay ventas registradas para actualizar stock</p>
              ) : (
                <div className="tabla-preview">
                  <div className="header-tabla">
                    <span>Producto</span>
                    <span>Stock Actual</span>
                    <span>Vendido</span>
                    <span>Nuevo Stock</span>
                  </div>
                  {previewStock.map((item, index) => (
                    <div key={index} className="fila-preview">
                      <span className="producto-nombre">{item.producto}</span>
                      <span className="stock-actual">{item.stockActual}</span>
                      <span className="vendido">-{item.vendido}</span>
                      <span className={`nuevo-stock ${item.nuevoStock === 0 ? 'agotado' : ''}`}>
                        {item.nuevoStock}
                        {item.nuevoStock === 0 && ' (Agotado)'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="advertencia-stock">
              <p>⚠️ <strong>Atención:</strong> Esta acción no se puede deshacer. El stock se reducirá permanentemente.</p>
              {mercadilloActual.stock_actualizado && (
                <p>❌ <strong>Error:</strong> El stock de este mercadillo ya fue actualizado anteriormente.</p>
              )}
            </div>

            <div className="form-actions">
              <button 
                className="btn-cancelar"
                onClick={() => setMostrarModalStock(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-stock"
                onClick={confirmarActualizacionStock}
                disabled={actualizandoStock || previewStock.length === 0 || mercadilloActual.stock_actualizado}
              >
                {actualizandoStock ? 'Actualizando...' : 'Confirmar Actualización'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MercadilloDetalle 