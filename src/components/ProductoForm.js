import React, { useState, useEffect } from 'react'
import { productosService } from '../services/productosService'
import { imageService } from '../services/imageService'
import { CategoriaProducto, CategoriaProductoLabels } from '../types/categoria_producto.js'

const ProductoForm = ({ producto, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: 0,
    coste_real: 0,
    cantidad_stock: 0,
    categoria: 'varios',
    imagen_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false)
  const [nuevaCategoria, setNuevaCategoria] = useState('')

  useEffect(() => {
    if (isEditing && producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta || 0,
        coste_real: producto.coste_real || 0,
        cantidad_stock: producto.cantidad_stock || 0,
        categoria: producto.categoria || 'varios',
        imagen_url: producto.imagen_url || ''
      })
      if (producto.imagen_url) {
        setImagePreview(producto.imagen_url)
      }
    }
  }, [producto, isEditing])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    
    // Si cambia la categoría y selecciona "nueva", mostrar el input
    if (name === 'categoria' && value === 'nueva_categoria') {
      setMostrarNuevaCategoria(true)
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }))
      return
    } else if (name === 'categoria') {
      setMostrarNuevaCategoria(false)
      setNuevaCategoria('')
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleNuevaCategoriaChange = (e) => {
    const value = e.target.value.trim()
    setNuevaCategoria(value)
    
    // Validar que la nueva categoría sea válida
    if (value) {
      setFormData(prev => ({
        ...prev,
        categoria: value
      }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)')
        return
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB en bytes
      if (file.size > maxSize) {
        setError('El archivo es muy grande. El tamaño máximo es 5MB')
        return
      }

      setImageFile(file)
      setError(null)
      
      console.log('Nueva imagen seleccionada:', file.name)
      
      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, imagen_url: '' }))
    const fileInput = document.getElementById('imagen_file')
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let dataToSubmit = { ...formData }
      
      // Ya no necesitamos compatibilidad - usamos coste_real directamente
      
      console.log('Datos a enviar antes de imagen:', dataToSubmit)
      console.log('Modo edición:', isEditing, 'ID producto:', producto?.id)
      console.log('Hay imagen nueva:', !!imageFile)
      console.log('Imagen URL actual en formData:', formData.imagen_url)
      
      // Si hay una imagen nueva, subirla al Storage de Supabase
      if (imageFile) {
        setError(null)
        
        // Si estamos editando y había una imagen anterior del storage, eliminarla
        if (isEditing && producto?.imagen_url && imageService.isSupabaseStorageUrl(producto.imagen_url)) {
          const oldImagePath = imageService.extractPathFromUrl(producto.imagen_url)
          if (oldImagePath) {
            await imageService.deleteImage(oldImagePath)
          }
        }
        
        // Subir la nueva imagen
        console.log('Subiendo nueva imagen...')
        const uploadResult = await imageService.uploadImage(imageFile, imageFile.name)
        
        if (!uploadResult.success) {
          if (uploadResult.needsConfiguration) {
            setError(`⚙️ Configuración de Storage requerida: ${uploadResult.error}`)
          } else {
            setError(`Error al subir imagen: ${uploadResult.error}`)
          }
          return
        }
        
        console.log('Imagen subida exitosamente:', uploadResult.url)
        dataToSubmit.imagen_url = uploadResult.url
      } else {
        // Si no hay imagen nueva pero hay una URL en formData, mantenerla
        // Si formData.imagen_url está vacío, significa que se eliminó la imagen
        console.log('No hay imagen nueva, manteniendo imagen_url actual:', dataToSubmit.imagen_url)
      }
      
      console.log('Datos finales a enviar:', dataToSubmit)

      let result
      if (isEditing && producto?.id) {
        result = await productosService.update(producto.id, dataToSubmit)
      } else {
        result = await productosService.create(dataToSubmit)
      }

      if (result.error) {
        setError(result.error.message)
      } else {
        onSubmit(result.data)
        // Limpiar formulario si es creación
        if (!isEditing) {
          setFormData({
            nombre: '',
            descripcion: '',
            precio_venta: 0,
            coste_real: 0,
            cantidad_stock: 0,
            categoria: 'varios',
            imagen_url: ''
          })
          setImageFile(null)
          setImagePreview(null)
        }
      }
    } catch (err) {
      setError('Error al guardar el producto')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const calcularMargen = () => {
    if (formData.coste_real > 0 && formData.precio_venta > 0) {
      // Margen de ganancia = ((Precio Venta - Coste) / Coste) * 100
      const margen = ((formData.precio_venta - formData.coste_real) / formData.coste_real) * 100
      return margen.toFixed(1)
    }
    return 0
  }

  const obtenerImagenPlaceholder = (categoria) => {
    const placeholders = {
      huevos: '🥚',
      figuras: '🎭',
      fidgets: '🔄',
      esqueletos: '💀',
      dados: '🎲',
      animales: '🐾',
      imanes: '🧲',
      llaveros: '🗝️',
      logos: '🏷️',
      ouchies: '🩹',
      placas: '📋',
      tinys: '🔸',
      varios: '📦',
      pack_especial: '🎁'
    }
    return placeholders[categoria] || '📦'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {isEditing ? '✏️' : '➕'}
            </div>
                      <h2 className="text-2xl font-bold text-white">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-white hover:text-gray-200 transition-colors text-2xl"
            disabled={loading}
          >
            ✕
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <p className="text-red-700 dark:text-red-400 text-base font-medium">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Información básica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="lg:col-span-2">
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Ej: Figura de dragón pequeña"
            />
          </div>

          {/* Descripción */}
          <div className="lg:col-span-2">
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              placeholder="Descripción opcional del producto..."
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </label>
            
            {!mostrarNuevaCategoria ? (
              <div className="relative">
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  {Object.keys(CategoriaProducto)
                    .sort((a, b) => CategoriaProductoLabels[a].localeCompare(CategoriaProductoLabels[b]))
                    .map((key) => (
                      <option key={key} value={CategoriaProducto[key]}>
                        {CategoriaProductoLabels[key]}
                      </option>
                    ))}
                  <option value="nueva_categoria" className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium">
                    ➕ Crear nueva categoría...
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevaCategoria}
                    onChange={handleNuevaCategoriaChange}
                    placeholder="Nombre de la nueva categoría..."
                    required
                    pattern="[A-Za-z0-9_]+"
                    title="Solo letras, números y guiones bajos sin espacios"
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarNuevaCategoria(false)
                      setNuevaCategoria('')
                      setFormData(prev => ({ ...prev, categoria: 'varios' }))
                    }}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    title="Cancelar nueva categoría"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💡 Escribe el nombre de la nueva categoría (solo letras, números y guiones bajos)
                </p>
              </div>
            )}
          </div>

          {/* Stock */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Cantidad en stock *
            </label>
            <input
              type="number"
              name="cantidad_stock"
              value={formData.cantidad_stock}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Precios y margen */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
            <span>💰</span>
            <span>Información de Precios</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coste real */}
            <div>
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Coste real (€)
              </label>
              <input
                type="number"
                name="coste_real"
                value={formData.coste_real}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            {/* Precio de venta */}
            <div>
              <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Precio de venta (€) *
              </label>
              <input
                type="number"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Margen de beneficio */}
          {formData.coste_real > 0 && formData.precio_venta > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-blue-700 dark:text-blue-300">
                  Margen de beneficio:
                </span>
                <span className={`text-lg font-bold ${
                  calcularMargen() > 30 ? 'text-green-600 dark:text-green-400' :
                  calcularMargen() > 15 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {calcularMargen()}%
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Beneficio: {(formData.precio_venta - formData.coste_real).toFixed(2)}€
              </div>
            </div>
          )}
        </div>

        {/* Imagen del producto */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
            <span>🖼️</span>
            <span>Imagen del Producto</span>
          </h3>

          {/* Preview actual */}
          {(imagePreview || formData.imagen_url) && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-700 rounded-lg overflow-hidden shadow-sm">
                    {imagePreview || formData.imagen_url ? (
                      <img 
                        src={imagePreview || formData.imagen_url} 
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-full flex items-center justify-center text-2xl hidden"
                      style={{ display: (imagePreview || formData.imagen_url) ? 'none' : 'flex' }}
                    >
                      {obtenerImagenPlaceholder(formData.categoria)}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                    {imageFile ? 'Nueva imagen seleccionada' : 'Imagen actual'}
                  </p>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    🗑️ Eliminar imagen
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload nuevo */}
          <div>
            <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {imagePreview || formData.imagen_url ? 'Cambiar imagen' : 'Subir imagen'}
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="imagen_file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="imagen_file"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="text-4xl text-gray-400 dark:text-gray-500">📸</div>
                <div className="text-base text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    Haz clic para subir
                  </span>
                  <span> o arrastra y suelta</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  PNG, JPG, GIF hasta 5MB
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.nombre || !formData.precio_venta}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span>{isEditing ? '💾' : '➕'}</span>
                <span>{isEditing ? 'Actualizar Producto' : 'Crear Producto'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm