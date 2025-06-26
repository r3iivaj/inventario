import React, { useState, useEffect, useCallback } from 'react'
import { productosService } from '../services/productosService'
import ProductoCard from './ProductoCard'
import Filtros from './Filtros'
import MercadilloList from './MercadilloList'
import MercadilloDetalle from './MercadilloDetalle'
import MercadilloForm from './MercadilloForm'
import './InventarioApp.css'

const InventarioApp = () => {
  const [vistaActual, setVistaActual] = useState('productos') // 'productos', 'mercadillos', 'mercadillo-detalle', 'mercadillo-form'
  const [mercadilloSeleccionado, setMercadilloSeleccionado] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
    if (vistaActual === 'productos') {
      cargarProductos()
    }
  }, [cargarProductos, vistaActual])

  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      ...nuevosFiltros
    }))
  }

  const handleProductoActualizado = (productoActualizado) => {
    setProductos(prevProductos =>
      prevProductos.map(producto =>
        producto.id === productoActualizado.id ? productoActualizado : producto
      )
    )
  }

  const handleNavegacion = (vista) => {
    setVistaActual(vista)
    if (vista !== 'mercadillo-detalle') {
      setMercadilloSeleccionado(null)
    }
  }

  const handleSeleccionarMercadillo = (mercadillo) => {
    setMercadilloSeleccionado(mercadillo)
    setVistaActual('mercadillo-detalle')
  }

  const handleCrearMercadillo = () => {
    setVistaActual('mercadillo-form')
  }

  const handleMercadilloCreado = (mercadillo) => {
    setMercadilloSeleccionado(mercadillo)
    setVistaActual('mercadillo-detalle')
  }

  const handleVolverMercadillos = () => {
    setVistaActual('mercadillos')
    setMercadilloSeleccionado(null)
  }

  const renderContenido = () => {
    switch (vistaActual) {
      case 'mercadillos':
        return (
          <MercadilloList
            onSeleccionarMercadillo={handleSeleccionarMercadillo}
            onCrearMercadillo={handleCrearMercadillo}
          />
        )
      
      case 'mercadillo-detalle':
        return mercadilloSeleccionado ? (
          <MercadilloDetalle
            mercadillo={mercadilloSeleccionado}
            onVolver={handleVolverMercadillos}
            onActualizar={() => {
              // Recargar datos si es necesario
            }}
          />
        ) : null
      
      case 'mercadillo-form':
        return (
          <MercadilloForm
            onVolver={handleVolverMercadillos}
            onMercadilloCreado={handleMercadilloCreado}
          />
        )
      
      case 'productos':
      default:
        return (
          <>
            {/* Filtros */}
            <Filtros 
              filtros={filtros}
              onFiltroChange={handleFiltroChange}
            />

            {/* Productos */}
            <section>
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                  <p className="text-lg font-medium text-gray-600">Cargando productos...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-4">❌</div>
                  <p className="text-red-700 font-medium mb-4">{error}</p>
                  <button 
                    onClick={cargarProductos} 
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {productos.length > 0 ? (
                    productos.map((producto) => (
                      <ProductoCard
                        key={producto.id}
                        producto={producto}
                        onProductoActualizado={handleProductoActualizado}
                      />
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-lg font-medium text-gray-600 mb-2">Producto no encontrado</p>
                      <p className="text-gray-500">Intenta ajustar los filtros de búsqueda o el término de búsqueda</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:grid lg:grid-cols-[250px_1fr] lg:grid-rows-[auto_1fr]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 lg:col-span-2 px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between lg:justify-start">
          <div className="flex items-center space-x-3">
            <div className="text-2xl lg:text-3xl">📦</div>
            <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 truncate">
              INVENTARIO ZRUNK3D
            </h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800">Menú</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer">
                <span className="text-xl">📊</span>
                <span className="font-medium">MÉTRICAS</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  vistaActual === 'productos' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => {
                  handleNavegacion('productos')
                  setMobileMenuOpen(false)
                }}
              >
                <span className="text-xl">🏠</span>
                <span className="font-medium">Home</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer">
                <span className="text-xl">📦</span>
                <span className="font-medium">PRODUCTOS</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  vistaActual.includes('mercadillo') 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => {
                  handleNavegacion('mercadillos')
                  setMobileMenuOpen(false)
                }}
              >
                <span className="text-xl">🛒</span>
                <span className="font-medium">MERCADILLO</span>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block bg-white border-r border-gray-200">
        <nav className="p-4 space-y-2">
          <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
            <span className="text-xl">📊</span>
            <span className="font-medium">MÉTRICAS</span>
          </div>
          <div 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              vistaActual === 'productos' 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleNavegacion('productos')}
          >
            <span className="text-xl">🏠</span>
            <span className="font-medium">Home</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">
            <span className="text-xl">📦</span>
            <span className="font-medium">PRODUCTOS</span>
          </div>
          <div 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              vistaActual.includes('mercadillo') 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => handleNavegacion('mercadillos')}
          >
            <span className="text-xl">🛒</span>
            <span className="font-medium">MERCADILLO</span>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {renderContenido()}
      </main>
    </div>
  )
}

export default InventarioApp 