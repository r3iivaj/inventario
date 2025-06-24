import React from 'react'
import { CategoriaProducto, CategoriaProductoLabels } from '../types/categoria_producto.js'
import './Filtros.css'

const Filtros = ({ filtros, onFiltroChange }) => {
  const handleCategoriaChange = (categoria) => {
    // Si la categoría ya está seleccionada, quitar el filtro
    if (filtros.categoria === categoria) {
      onFiltroChange({ categoria: 'todos' })
    } else {
      onFiltroChange({ categoria })
    }
  }

  const handleOrdenChange = (orden) => {
    onFiltroChange({ orden })
  }

  const handleBusquedaChange = (busqueda) => {
    onFiltroChange({ busqueda })
  }

  return (
    <div className="filtros-container">
      <div className="filtros-row">
        <div className="filtros-left">
          <div className="filtro-group">
            <span className="filtro-label">FILTROS</span>
          </div>

          <div className="filtro-group">
          <button 
            className={`filtro-btn ${filtros.categoria !== 'todos' ? 'active' : ''}`}
            onClick={() => handleCategoriaChange(filtros.categoria)}
          >
            🔽 {filtros.categoria !== 'todos' 
              ? `${Object.keys(CategoriaProductoLabels).find(key => CategoriaProducto[key] === filtros.categoria) 
                  ? CategoriaProductoLabels[Object.keys(CategoriaProductoLabels).find(key => CategoriaProducto[key] === filtros.categoria)]
                  : 'CATEGORÍA'}`
              : 'CATEGORÍA'
            }
          </button>
          <div className="filtro-dropdown">
            {Object.keys(CategoriaProducto).map((key) => (
              <button 
                key={key}
                className={`dropdown-item ${filtros.categoria === CategoriaProducto[key] ? 'active' : ''}`}
                onClick={() => handleCategoriaChange(CategoriaProducto[key])}
              >
                {CategoriaProductoLabels[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="filtro-group">
          <button 
            className={`filtro-btn ${filtros.orden === 'nombre' ? 'active' : ''}`}
            onClick={() => handleOrdenChange('nombre')}
          >
            🔽 ORDEN
          </button>
          <div className="filtro-dropdown">
            <button 
              className={`dropdown-item ${filtros.orden === 'nombre' ? 'active' : ''}`}
              onClick={() => handleOrdenChange('nombre')}
            >
              Por Nombre
            </button>
            <button 
              className={`dropdown-item ${filtros.orden === 'precio_asc' ? 'active' : ''}`}
              onClick={() => handleOrdenChange('precio_asc')}
            >
              Precio Menor a Mayor
            </button>
            <button 
              className={`dropdown-item ${filtros.orden === 'precio_desc' ? 'active' : ''}`}
              onClick={() => handleOrdenChange('precio_desc')}
            >
              Precio Mayor a Menor
            </button>
            <button 
              className={`dropdown-item ${filtros.orden === 'fecha' ? 'active' : ''}`}
              onClick={() => handleOrdenChange('fecha')}
            >
              Más Recientes
            </button>
          </div>
        </div>

        <div className="filtro-group">
          <button className="filtro-btn">
            🔽 FECHA
          </button>
        </div>

        <div className="filtro-group">
          <button className="filtro-btn">
            🔽 PRECIO
          </button>
        </div>
        </div>

        <div className="filtro-group busqueda-group">
          <div className="busqueda-section">
            <input
              type="text"
              placeholder="BUSCAR..."
              value={filtros.busqueda}
              onChange={(e) => handleBusquedaChange(e.target.value)}
              className="busqueda-input"
            />
            <span className="busqueda-icon">🔍</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filtros 