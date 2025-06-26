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
      const estadoInicial = determinarEstadoInicial()
      
      const mercadillo = {
        nombre: formulario.nombre.trim(),
        fecha: formulario.fecha,
        descripcion: formulario.descripcion.trim(),
        estado: estadoInicial,
        modo_actualizacion: formulario.modo_actualizacion,
        stock_actualizado: false,
        total_ventas: 0
      }

      const { data, error } = await mercadillosService.create(mercadillo)
      
      if (error) {
        // Modo demo: crear mercadillo local
        const mercadilloDemo = {
          id: Date.now(),
          ...mercadillo
        }
        console.log('Mercadillo creado en modo demo:', mercadilloDemo)
        if (onMercadilloCreado) onMercadilloCreado(mercadilloDemo)
      } else {
        console.log('Mercadillo creado exitosamente:', data)
        if (onMercadilloCreado) onMercadilloCreado(data)
      }
    } catch (error) {
      console.error('Error al crear mercadillo:', error)
      alert('Error al crear el mercadillo')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="mercadillo-form">
      <div className="mercadillo-form-header">
        <button className="btn-volver" onClick={onVolver}>
          ← Volver
        </button>
        <h2>📍 Nuevo Mercadillo</h2>
      </div>

      <div className="form-container">
        <form onSubmit={manejarSubmit} className="mercadillo-form-content">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Mercadillo *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Ej: Mercadillo Plaza Mayor"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formulario.fecha}
              onChange={manejarCambio}
              required
            />
            {esMercadilloHistorico() && (
              <div className="fecha-info historico">
                ℹ️ Este mercadillo se creará como <strong>finalizado</strong> (fecha anterior a hoy)
              </div>
            )}
            {!esMercadilloHistorico() && (
              <div className="fecha-info">
                ℹ️ Este mercadillo se creará como <strong>planificado</strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              placeholder="Descripción opcional del mercadillo..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="actualizacion_automatica"
                checked={formulario.modo_actualizacion === 'automatico'}
                onChange={manejarCambio}
                disabled={esMercadilloHistorico()}
              />
              <label htmlFor="actualizacion_automatica" className="checkbox-label">
                <span className="checkbox-text">
                  Actualizar stock automáticamente al finalizar
                </span>
                <span className="checkbox-description">
                  {esMercadilloHistorico() 
                    ? 'No disponible para mercadillos históricos'
                    : 'El stock se actualizará automáticamente cuando finalices el mercadillo'
                  }
                </span>
              </label>
            </div>
          </div>

          {esMercadilloHistorico() && (
            <div className="mercadillo-historico-info">
              <div className="info-card">
                <h4>📚 Mercadillo Histórico</h4>
                <p>
                  Al crear un mercadillo con fecha anterior, podrás:
                </p>
                <ul>
                  <li>✅ Registrar ventas y gastos del evento pasado</li>
                  <li>✅ Mantener un historial completo de mercadillos</li>
                  <li>✅ Actualizar stock manualmente si es necesario</li>
                  <li>⚠️ La actualización automática no está disponible</li>
                </ul>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancelar"
              onClick={onVolver}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-crear"
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