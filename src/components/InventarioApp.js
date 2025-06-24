import React, { useState, useEffect, useCallback } from 'react'
import { productosService } from '../services/productosService'
import ProductoCard from './ProductoCard'
import Filtros from './Filtros'
import './InventarioApp.css'

const InventarioApp = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filtros, setFiltros] = useState({
    categoria: 'todos',
    orden: 'fecha',
    busqueda: ''
  })

  const cargarProductos = useCallback(async () => {
    setLoading(true)
    try {
      const result = await productosService.getWithFilters(filtros)
      if (result.error) {
        setError(result.error.message)
      } else {
        setProductos(result.data || [])
        setError(null)
      }
    } catch (err) {
      setError('Error al cargar productos')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filtros])

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      ...nuevosFiltros
    }))
  }

  return (
    <div className="inventario-app">
      {/* Header */}
      <header className="inventario-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">📦</div>
            <h1>INVENTARIO ZRUNK3D</h1>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <div className="nav-item">
            <span className="nav-icon">📊</span>
            <span>MÉTRICAS</span>
          </div>
          <div className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">📦</span>
            <span>PRODUCTOS</span>
          </div>
          <div className="nav-item">
            <span className="nav-icon">🛒</span>
            <span>MERCADILLO</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">


        {/* Filtros */}
        <Filtros 
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
        />

        {/* Productos */}
        <section className="productos-section">
          {loading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Cargando productos...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>❌ {error}</p>
              <button onClick={cargarProductos} className="retry-btn">
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="productos-grid">
              {productos.length > 0 ? (
                productos.map((producto) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                  />
                ))
              ) : (
                <div className="no-productos">
                  <p>Producto no encontrado</p>
                  <p>Intenta ajustar los filtros de búsqueda o el término de búsqueda</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default InventarioApp 