import React, { useState, useEffect } from 'react'
import { productosService } from '../services/productosService'
import { CategoriaProducto, CategoriaProductoLabels } from '../types/categoria_producto.js'
import './ProductoForm.css'

const ProductoForm = ({ producto, onSubmit, onCancel, isEditing = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: 0,
    costo_real: 0,
    cantidad_stock: 0,
    categoria: 'Varios',
    imagen_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isEditing && producto) {
      setFormData({
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio_venta: producto.precio_venta || 0,
        costo_real: producto.costo_real || 0,
        cantidad_stock: producto.cantidad_stock || 0,
        categoria: producto.categoria || 'Varios',
        imagen_url: producto.imagen_url || ''
      })
    }
  }, [producto, isEditing])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (isEditing && producto?.id) {
        result = await productosService.update(producto.id, formData)
      } else {
        result = await productosService.create(formData)
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
            costo_real: 0,
            cantidad_stock: 0,
            categoria: 'Varios',
            imagen_url: ''
          })
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
    if (formData.costo_real > 0 && formData.precio_venta > 0) {
      const margen = ((formData.precio_venta - formData.costo_real) / formData.precio_venta) * 100
      return margen.toFixed(2)
    }
    return '0.00'
  }

  return (
    <div className="producto-form-container">
      <div className="producto-form-header">
        <h2>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <button 
          type="button" 
          onClick={onCancel}
          className="btn-cerrar"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="form-error">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="producto-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto*</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría*</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              {Object.keys(CategoriaProducto).map((key) => (
                <option key={key} value={CategoriaProducto[key]}>
                  {CategoriaProductoLabels[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción opcional del producto"
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precio_venta">Precio de Venta*</label>
            <input
              type="number"
              id="precio_venta"
              name="precio_venta"
              value={formData.precio_venta}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="costo_real">Costo Real*</label>
            <input
              type="number"
              id="costo_real"
              name="costo_real"
              value={formData.costo_real}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Margen de Ganancia</label>
            <div className="margen-display">
              {calcularMargen()}%
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cantidad_stock">Cantidad en Stock*</label>
            <input
              type="number"
              id="cantidad_stock"
              name="cantidad_stock"
              value={formData.cantidad_stock}
              onChange={handleChange}
              min="0"
              required
              placeholder="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imagen_url">URL de la Imagen</label>
            <input
              type="url"
              id="imagen_url"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
        </div>

        {formData.imagen_url && (
          <div className="form-group">
            <label>Vista previa de la imagen</label>
            <div className="imagen-preview">
              <img 
                src={formData.imagen_url} 
                alt="Vista previa"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'block'
                }}
              />
              <div className="imagen-error" style={{ display: 'none' }}>
                ❌ No se pudo cargar la imagen
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-cancelar"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="btn-guardar"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Producto')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductoForm 