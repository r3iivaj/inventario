import React, { useState } from 'react'
import './ProductoCard.css'
import { productosService } from '../services/productosService'
import { imageService } from '../services/imageService'
import ConfirmationModal from './ConfirmationModal'

const ProductoCard = ({ producto, onProductoActualizado, onEditarProducto, onVerProducto, onCopiarProducto, onEliminarProducto }) => {
  const [actualizando, setActualizando] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [showConfirmCopy, setShowConfirmCopy] = useState(false)

  const formatearPrecio = (precio) => {
    return `${precio.toFixed(2)}€`
  }

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    const fechaObj = new Date(fecha)
    const ahora = new Date()
    const diffMs = ahora - fechaObj
    const diffMins = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMs / 3600000)
    const diffDias = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora mismo'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHoras < 24) return `Hace ${diffHoras}h`
    if (diffDias < 7) return `Hace ${diffDias} días`
    
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopiarProducto = () => {
    setShowConfirmCopy(true)
  }

  const confirmarCopia = () => {
    if (onCopiarProducto) {
      onCopiarProducto(producto)
    }
  }

  const handleEliminarProducto = () => {
    setShowConfirmDelete(true)
  }

  const confirmarEliminacion = () => {
    if (onEliminarProducto) {
      onEliminarProducto(producto)
    }
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
    
    // Guardar el ID del producto en sessionStorage para restaurar el foco después
    sessionStorage.setItem('focusProductId', producto.id)
    
    setActualizando(true)
    
    try {
      const { data, error } = await productosService.update(producto.id, {
        precio_venta: nuevoPrecio
      })
      
      if (error) {
        console.error('Error al actualizar precio:', error)
        alert('Error al actualizar el precio')
        sessionStorage.removeItem('focusProductId')
      } else if (onProductoActualizado) {
        onProductoActualizado(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el precio')
      sessionStorage.removeItem('focusProductId')
    } finally {
      setActualizando(false)
    }
  }

  const actualizarStock = async (incremento) => {
    if (actualizando) return
    
    const nuevoStock = Math.max(0, producto.cantidad_stock + incremento)
    
    // Actualizar localmente primero sin refrescar la pantalla completa
    const productoActualizado = {
      ...producto,
      cantidad_stock: nuevoStock,
      updated_at: new Date().toISOString() // Actualizar la fecha de modificación
    }
    
    // Guardamos una referencia al elemento actual en el DOM
    const currentCard = document.activeElement?.closest('.bg-white.dark\\:bg-gray-800.rounded-xl');
    const currentScroll = window.scrollY;
    
    // Actualizar en el cliente
    if (onProductoActualizado) {
      onProductoActualizado(productoActualizado)
    }
    
    // Luego actualizar en el servidor
    try {
      const { data, error } = await productosService.update(producto.id, {
        cantidad_stock: nuevoStock
      })
      
      if (error) {
        console.error('Error al actualizar stock:', error)
        alert('Error al actualizar el stock')
        // Revertir cambio local en caso de error
        if (onProductoActualizado) {
          onProductoActualizado(producto)
        }
      } else {
        // Restaurar el foco y la posición de desplazamiento
        setTimeout(() => {
          if (currentCard) {
            const button = currentCard.querySelector('button');
            if (button) button.focus();
          }
          window.scrollTo(0, currentScroll);
        }, 50);
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el stock')
      // Revertir cambio local en caso de error
      if (onProductoActualizado) {
        onProductoActualizado(producto)
      }
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      alert('El archivo es muy grande. El tamaño máximo es 5MB')
      return
    }

    setUploadingImage(true)

    try {
      // Eliminar imagen anterior si existe y es del storage de Supabase
      if (producto.imagen_url && imageService.isSupabaseStorageUrl(producto.imagen_url)) {
        const oldImagePath = imageService.extractPathFromUrl(producto.imagen_url)
        if (oldImagePath) {
          await imageService.deleteImage(oldImagePath)
        }
      }

      // Subir nueva imagen
      const uploadResult = await imageService.uploadImage(file, file.name)
      
      if (!uploadResult.success) {
        if (uploadResult.needsConfiguration) {
          alert(`⚙️ Configuración requerida:\n\n${uploadResult.error}\n\n📋 Pasos:\n1. Ve al Dashboard de Supabase\n2. Storage > Create bucket: "productos-imagenes"\n3. Configura las políticas de seguridad\n4. Marca el bucket como público`)
        } else {
          alert(`❌ Error al subir imagen:\n${uploadResult.error}`)
        }
        return
      }

      // Actualizar el producto con la nueva URL de imagen
      const { data, error } = await productosService.update(producto.id, {
        imagen_url: uploadResult.url
      })

      if (error) {
        console.error('Error al actualizar imagen:', error)
        alert('Error al actualizar la imagen del producto')
      } else if (onProductoActualizado) {
        onProductoActualizado(data)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la imagen')
    } finally {
      setUploadingImage(false)
      // Limpiar el input
      e.target.value = ''
    }
  }

  return (
    <div 
      id={`producto-${producto.id}`}
      data-producto-id={producto.id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 relative"
      tabIndex="-1"
    >
      {/* Loading overlay */}
      {(actualizando || uploadingImage) && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm font-medium">
              {uploadingImage ? 'Subiendo imagen...' : 'Actualizando...'}
            </span>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Header con imagen y stock */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative group">
            <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm overflow-hidden">
              {producto.imagen_url ? (
                <>
                  <img 
                    src={producto.imagen_url} 
                    alt={producto.nombre}
                    className="w-full h-full object-cover rounded-xl"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.querySelector('.emoji-fallback').style.display = 'flex'
                    }}
                  />
                  <span 
                    className="emoji-fallback w-full h-full items-center justify-center text-xl sm:text-2xl hidden"
                  >
                    {obtenerImagenPlaceholder(producto.categoria)}
                  </span>
                </>
              ) : (
                <span className="flex items-center justify-center w-full h-full">
                  {obtenerImagenPlaceholder(producto.categoria)}
                </span>
              )}
            </div>
            
            {/* Botón de upload de imagen */}
            <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="file"
                id={`upload-${producto.id}`}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImage || actualizando}
              />
              <label
                htmlFor={`upload-${producto.id}`}
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-full p-1.5 shadow-lg cursor-pointer transition-colors flex items-center justify-center"
                title="Cambiar imagen"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>
          </div>
          
          <div className="text-right ml-3">
            <div className={`text-lg sm:text-xl font-bold ${
              producto.cantidad_stock <= 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'
            }`}>
              {producto.cantidad_stock}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Stock</div>
          </div>
        </div>
        
        {/* Información del producto */}
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg mb-2 line-clamp-2 leading-tight">
              {producto.nombre}
            </h3>
            {producto.descripcion && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{producto.descripcion}</p>
            )}
            <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full font-medium">
              {producto.categoria}
            </span>
          </div>
          
          {/* Precio */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Precio de Venta</span>
              <span className="font-bold text-green-600 dark:text-green-400 text-base sm:text-lg">
                {formatearPrecio(producto.precio_venta)}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarPrecio(-0.5)}
                disabled={actualizando}
                title="Reducir precio €0.50"
              >
                -€0.50
              </button>
              <button 
                className="flex-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium py-2 px-3 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarPrecio(0.5)}
                disabled={actualizando}
                title="Aumentar precio €0.50"
              >
                +€0.50
              </button>
            </div>
          </div>

          {/* Coste, Beneficio y Margen */}
          {producto.coste_real && producto.coste_real > 0 && (
            <div className="bg-gradient-to-r from-orange-50 via-green-50 to-blue-50 dark:from-orange-900/20 dark:via-green-900/20 dark:to-blue-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium block">Coste</span>
                  <span className="font-bold text-orange-700 dark:text-orange-300 text-sm">
                    {formatearPrecio(producto.coste_real)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium block">Beneficio</span>
                  <span className="font-bold text-green-700 dark:text-green-300 text-sm">
                    {formatearPrecio(producto.precio_venta - producto.coste_real)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium block">Margen</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
                    {(((producto.precio_venta - producto.coste_real) / producto.coste_real) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Control de Stock</span>
            </div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button 
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-1.5 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(-1)}
                disabled={producto.cantidad_stock <= 0}
                title="Reducir 1"
              >
                -1
              </button>
              <button 
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-1.5 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(-5)}
                disabled={producto.cantidad_stock < 5}
                title="Reducir 5"
              >
                -5
              </button>
              <button 
                className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-1.5 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(-10)}
                disabled={producto.cantidad_stock < 10}
                title="Reducir 10"
              >
                -10
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button 
                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium py-1.5 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(1)}
                title="Aumentar 1"
              >
                +1
              </button>
              <button 
                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium py-1.5 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(5)}
                title="Aumentar 5"
              >
                +5
              </button>
              <button 
                className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium py-1.5 px-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => actualizarStock(10)}
                title="Aumentar 10"
              >
                +10
              </button>
            </div>
          </div>

          {/* Fecha de última actualización */}
          <div className="text-center py-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Última actualización: {formatearFecha(producto.updated_at || producto.created_at)}
            </span>
          </div>

          {/* Acciones */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex gap-1">
              <button 
                className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium py-2 px-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
                title="Editar producto"
                onClick={() => onEditarProducto && onEditarProducto(producto)}
              >
                <span>✏️</span>
                <span className="hidden sm:inline">Editar</span>
              </button>
                              <button 
                  className="flex-1 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium py-2 px-2 rounded-md text-xs transition-colors"
                  title={`Ver detalles - Última actualización: ${formatearFecha(producto.updated_at || producto.created_at)}`}
                  onClick={() => onVerProducto && onVerProducto(producto)}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1">
                      <span>👁️</span>
                      <span className="hidden sm:inline">Ver</span>
                    </div>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400 font-normal mt-1">
                      {new Date(producto.updated_at || producto.created_at).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </button>
            </div>
            <div className="flex gap-1">
              <button 
                className="flex-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 font-medium py-2 px-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
                title="Copiar producto"
                onClick={handleCopiarProducto}
              >
                <span>📋</span>
                <span className="hidden sm:inline">Copiar</span>
              </button>
              <button 
                className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-medium py-2 px-2 rounded-md text-xs transition-colors flex items-center justify-center gap-1"
                title="Eliminar producto"
                onClick={handleEliminarProducto}
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para copiar */}
      <ConfirmationModal
        isOpen={showConfirmCopy}
        onClose={() => setShowConfirmCopy(false)}
        onConfirm={confirmarCopia}
        type="info"
        title="Copiar Producto"
        message={
          <>
            ¿Quieres crear una copia de <strong>"{producto.nombre}"</strong>?
            <br /><br />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Se creará un nuevo producto con:
            </span>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• Nombre: "{producto.nombre} - copia"</li>
              <li>• Mismos precios y categoría</li>
              <li>• Mismo stock inicial</li>
              <li>• Misma imagen (si tiene una)</li>
            </ul>
          </>
        }
        confirmText="Sí, copiar"
        cancelText="Cancelar"
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={confirmarEliminacion}
        type="danger"
        title="Eliminar Producto"
        message={
          <>
            ¿Estás seguro de que quieres eliminar <strong>"{producto.nombre}"</strong>?
            <br /><br />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer y eliminará permanentemente:
            </span>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1">
              <li>• El producto y toda su información</li>
              <li>• Su imagen (si tiene una)</li>
              <li>• Su historial de stock y precios</li>
            </ul>
          </>
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default ProductoCard 