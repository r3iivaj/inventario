import React from 'react'
import './ProductoCard.css'

const ProductoCard = ({ producto }) => {
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

  return (
    <div className="producto-card">
      <div className="producto-imagen">
        {producto.imagen_url ? (
          <img 
            src={producto.imagen_url} 
            alt={producto.nombre}
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className="imagen-placeholder"
          style={{ display: producto.imagen_url ? 'none' : 'flex' }}
        >
          <span className="placeholder-icon">
            {obtenerImagenPlaceholder(producto.categoria)}
          </span>
        </div>
      </div>
      
      <div className="producto-info">
        <h3 className="producto-nombre">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="producto-descripcion">{producto.descripcion}</p>
        )}
        
        <div className="producto-detalles">
          <div className="producto-precio">
            <span className="precio-label">Precio:</span>
            <span className="precio-valor">{formatearPrecio(producto.precio_venta)}</span>
          </div>
          
          <div className="producto-stock">
            <span className="stock-label">Stock:</span>
            <span className={`stock-valor ${producto.cantidad_stock <= 5 ? 'stock-bajo' : ''}`}>
              {producto.cantidad_stock}
            </span>
          </div>
          
          <div className="producto-categoria">
            <span className="categoria-badge">
              {producto.categoria?.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="producto-acciones">
          <button className="btn-editar" title="Editar producto">
            ✏️
          </button>
          <button className="btn-eliminar" title="Eliminar producto">
            🗑️
          </button>
          <button className="btn-ver" title="Ver detalles">
            👁️
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductoCard 