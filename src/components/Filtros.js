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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <div className="p-4 sm:p-6">
        {/* Búsqueda */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={filtros.busqueda}
            onChange={(e) => handleBusquedaChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm sm:text-base placeholder-gray-400 dark:placeholder-gray-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg">
            🔍
          </span>
        </div>

        {/* Filtros en dos secciones */}
        <div className="space-y-6">
          {/* Filtros de categoría */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Categorías</h3>
            <div className="flex flex-wrap gap-2">
              <button 
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filtros.categoria === 'todos'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
                onClick={() => handleCategoriaChange('todos')}
              >
                📦 Todos
              </button>

              {Object.keys(CategoriaProducto).map((key) => (
                <button 
                  key={key}
                  className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    filtros.categoria === CategoriaProducto[key]
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                  }`}
                  onClick={() => handleCategoriaChange(CategoriaProducto[key])}
                >
                  {CategoriaProductoLabels[key]}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de ordenación */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Ordenar por</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button 
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filtros.orden === 'nombre'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
                onClick={() => handleOrdenChange('nombre')}
              >
                🔤 Nombre
              </button>
              
              <button 
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filtros.orden === 'precio_asc'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
                onClick={() => handleOrdenChange('precio_asc')}
              >
                💰 Precio ↑
              </button>
              
              <button 
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filtros.orden === 'precio_desc'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
                onClick={() => handleOrdenChange('precio_desc')}
              >
                💰 Precio ↓
              </button>
              
              <button 
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  filtros.orden === 'fecha'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-200 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                }`}
                onClick={() => handleOrdenChange('fecha')}
              >
                📅 Recientes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Filtros 