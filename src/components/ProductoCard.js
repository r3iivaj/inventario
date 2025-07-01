import React, { useState } from 'react'
import './ProductoCard.css'
import { productosService } from '../services/productosService'

const ProductoCard = ({ producto, onProductoActualizado }) => {
  const [actualizando, setActualizando] = useState(false)

  const formatearPrecio = (precio) => {
    return `${precio.toFixed(2)}€`
  }

  const obtenerImagenPlaceholder = (categoria) => {
    const placeholders = {
      Huevos: '🥚',
      Figuras: '🎭',
      Fidgets: '🔄',
      Esqueletos: '💀',
      Dados: '🎲',
      Animales: '🐾',
      Imanes: '🧲',
      Llaveros: '🗝️',
      Logos: '🏷️',
      Ouchies: '🩹',
      Placas: '📋',
      Tinys: '🔸',
      Varios: '📦',
      Pack_Especial: '🎁'
    }
    return placeholders[categoria] || '📦'
  }

  const actualizarPrecio = async (incremento) => {
    if (actualizando) return
    
    const nuevoPrecio = Math.max(0, producto.precio_venta + incremento)
    setActualizando(true)
    
    try {
      const { data, error } = await productosService.update(producto.id, {
        precio_venta: nuevoPrecio
      })
      
      if (error) {
        console.error('Error al actualizar precio:', error)
        alert('Error al actualizar el precio')
      } else if (onProductoActualizado) {
        onProductoActualizado(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el precio')
    } finally {
      setActualizando(false)
    }
  }

  const actualizarStock = async (incremento) => {
    if (actualizando) return
    
    const nuevoStock = Math.max(0, producto.cantidad_stock + incremento)
    setActualizando(true)
    
    try {
      const { data, error } = await productosService.update(producto.id, {
        cantidad_stock: nuevoStock
      })
      
      if (error) {
        console.error('Error al actualizar stock:', error)
        alert('Error al actualizar el stock')
      } else if (onProductoActualizado) {
        onProductoActualizado(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el stock')
    } finally {
      setActualizando(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 relative">
      {/* Loading overlay */}
      {actualizando && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm font-medium">Actualizando...</span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header con imagen y stock */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm">
            {producto.imagen_url ? (
              <img 
                src={producto.imagen_url} 
                alt={producto.nombre}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
            ) : null}
            <span 
              className={`${producto.imagen_url ? 'hidden' : 'block'}`}
            >
              {obtenerImagenPlaceholder(producto.categoria)}
            </span>
          </div>
          
          <div className="text-right ml-3">
            <div className={`text-lg sm:text-xl font-bold ${
              producto.cantidad_stock <= 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'
            }`}>
              {producto.cantidad_stock}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stock</div>
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-2 line-clamp-2 leading-tight">
              {producto.nombre}
            </h3>
            {producto.descripcion && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{producto.descripcion}</p>
            )}
            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
              {producto.categoria}
            </span>
          </div>
          
          {/* Precio */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Precio de Venta</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">
                {formatearPrecio(producto.precio_venta)}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-2 px-3 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarPrecio(-0.5)}
                disabled={actualizando}
                title="Reducir precio €0.50"
              >
                -€0.50
              </button>
              <button 
                className="flex-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium py-2 px-3 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarPrecio(0.5)}
                disabled={actualizando}
                title="Aumentar precio €0.50"
              >
                +€0.50
              </button>
            </div>
          </div>

          {/* Stock */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Control de Stock</span>
            </div>
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-medium py-2 px-3 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(-1)}
                disabled={actualizando}
                title="Reducir stock"
              >
                -1
              </button>
              <button 
                className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium py-2 px-3 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(1)}
                disabled={actualizando}
                title="Aumentar stock"
              >
                +1
              </button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button 
              className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium py-2 px-3 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
              title="Editar producto"
            >
              <span>✏️</span>
              <span className="hidden sm:inline">Editar</span>
            </button>
            <button 
              className="flex-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium py-2 px-3 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
              title="Ver detalles"
            >
              <span>👁️</span>
              <span className="hidden sm:inline">Ver</span>
            </button>
            <button 
              className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-2 px-3 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
              title="Eliminar producto"
            >
              <span>🗑️</span>
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductoCard 