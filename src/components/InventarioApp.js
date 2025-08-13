import React, { useState, useEffect, useCallback } from 'react'
import { productosService } from '../services/productosService'
import ProductoCard from './ProductoCard'
import Filtros from './Filtros'
import MercadilloList from './MercadilloList'
import MercadilloDetalle from './MercadilloDetalle'
import MercadilloForm from './MercadilloForm'
import ProductoForm from './ProductoForm'
import ThemeToggle from './ThemeToggle'
import AdminPanel from './AdminPanel'
import { useAuth } from '../contexts/AuthContext'
import './InventarioApp.css'

const InventarioApp = () => {
  // AUTENTICACIÓN DESACTIVADA - No se requiere usuario
  // const { user, signOut } = useAuth()
  const [vistaActual, setVistaActual] = useState('productos') // 'productos', 'mercadillos', 'mercadillo-detalle', 'mercadillo-form'
  const [mercadilloSeleccionado, setMercadilloSeleccionado] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showProductoForm, setShowProductoForm] = useState(false)
  const [productoEditando, setProductoEditando] = useState(null)
  const [showProductoDetalle, setShowProductoDetalle] = useState(false)
  const [productoVisualizando, setProductoVisualizando] = useState(null)
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

  const handleCrearProducto = () => {
    setProductoEditando(null)
    setShowProductoForm(true)
  }

  const handleEditarProducto = (producto) => {
    setProductoEditando(producto)
    setShowProductoForm(true)
  }

  const handleProductoCreado = (nuevoProducto) => {
    setProductos(prevProductos => [nuevoProducto, ...prevProductos])
    setShowProductoForm(false)
    setProductoEditando(null)
  }

  const handleProductoEditado = (productoEditado) => {
    handleProductoActualizado(productoEditado)
    setShowProductoForm(false)
    setProductoEditando(null)
  }

  const handleCerrarFormulario = () => {
    setShowProductoForm(false)
    setProductoEditando(null)
  }

  const handleVerProducto = (producto) => {
    setProductoVisualizando(producto)
    setShowProductoDetalle(true)
  }

  const handleCerrarDetalle = () => {
    setShowProductoDetalle(false)
    setProductoVisualizando(null)
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
            {/* Header con botón Añadir Producto */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-0">
                Inventario de Productos
              </h2>
              <button
                onClick={handleCrearProducto}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="text-lg">+</span>
                <span>Añadir Producto</span>
              </button>
            </div>

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
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Cargando productos...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-4">❌</div>
                  <p className="text-red-700 dark:text-red-400 font-medium mb-4">{error}</p>
                  <button 
                    onClick={cargarProductos} 
                    className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
                        onEditarProducto={handleEditarProducto}
                        onVerProducto={handleVerProducto}
                      />
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Producto no encontrado</p>
                      <p className="text-gray-500 dark:text-gray-500">Intenta ajustar los filtros de búsqueda o el término de búsqueda</p>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:grid lg:grid-cols-[250px_1fr] lg:grid-rows-[auto_1fr]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:col-span-2 px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl lg:text-3xl">📦</div>
            <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">
              INVENTARIO ZRUNK3D
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* User info - Mobile */}
            <div className="lg:hidden flex items-center space-x-2">
              {user?.user_metadata?.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-24">
                {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
              </div>
            </div>
            
            {/* Theme toggle button */}
            <ThemeToggle />
            
            {/* AUTENTICACIÓN DESACTIVADA - Admin y logout deshabilitados */}
            {/* 
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Panel de administración"
            >
              <span className="text-sm">Admin</span>
            </button>

            <button 
              onClick={signOut}
              className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Cerrar sesión"
            >
              <span className="text-sm">Salir</span>
            </button>
            */}
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-800 dark:text-gray-100">Menú</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <span className="text-xl">📊</span>
                <span className="font-medium">MÉTRICAS</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  vistaActual === 'productos' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  handleNavegacion('productos')
                  setMobileMenuOpen(false)
                }}
              >
                <span className="text-xl">🏠</span>
                <span className="font-medium">Home</span>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <span className="text-xl">📦</span>
                <span className="font-medium">PRODUCTOS</span>
              </div>
              <div 
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  vistaActual.includes('mercadillo') 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => {
                  handleNavegacion('mercadillos')
                  setMobileMenuOpen(false)
                }}
              >
                <span className="text-xl">🛒</span>
                <span className="font-medium">MERCADILLO</span>
              </div>
              
              {/* Logout button - Mobile */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 px-3 pb-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <span className="text-xs">🔓</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    Acceso libre habilitado
                  </div>
                </div>
                {/* LOGOUT DESACTIVADO */}
                <div className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-400 dark:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Acceso libre habilitado</span>
                </div>
                
                {/* Admin button - Mobile */}
                {/* ADMIN PANEL DESACTIVADO */}
                <div className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-400 dark:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Panel Admin (Desactivado)</span>
                </div>
              </div>
            </nav>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 relative">
        <nav className="p-4 space-y-2 pb-20">
          <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <span className="text-xl">📊</span>
            <span className="font-medium">MÉTRICAS</span>
          </div>
          <div 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              vistaActual === 'productos' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleNavegacion('productos')}
          >
            <span className="text-xl">🏠</span>
            <span className="font-medium">Home</span>
          </div>
          <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
            <span className="text-xl">📦</span>
            <span className="font-medium">PRODUCTOS</span>
          </div>
          <div 
            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
              vistaActual.includes('mercadillo') 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleNavegacion('mercadillos')}
          >
            <span className="text-xl">🛒</span>
            <span className="font-medium">MERCADILLO</span>
          </div>
        </nav>
        
        {/* AUTENTICACIÓN DESACTIVADA - Sin información de usuario ni logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            💡 Acceso libre habilitado
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 lg:p-6">
        {renderContenido()}
      </main>

      {/* ADMIN PANEL DESACTIVADO */}
      {/* {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )} */}

      {/* Producto Form Modal */}
      {showProductoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProductoForm
              producto={productoEditando}
              isEditing={!!productoEditando}
              onSubmit={productoEditando ? handleProductoEditado : handleProductoCreado}
              onCancel={handleCerrarFormulario}
            />
          </div>
        </div>
      )}

      {/* Producto Detail Modal */}
      {showProductoDetalle && productoVisualizando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Detalles del Producto
                </h2>
                <button
                  onClick={handleCerrarDetalle}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Imagen */}
              <div className="text-center mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl flex items-center justify-center text-4xl shadow-sm mb-4">
                  {productoVisualizando.imagen_url ? (
                    <img 
                      src={productoVisualizando.imagen_url} 
                      alt={productoVisualizando.nombre}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <span className={`${productoVisualizando.imagen_url ? 'hidden' : 'block'}`}>
                    📦
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {productoVisualizando.nombre}
                  </h3>
                  {productoVisualizando.descripcion && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {productoVisualizando.descripcion}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Categoría</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {productoVisualizando.categoria}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Stock</p>
                    <p className={`font-semibold ${
                      productoVisualizando.cantidad_stock <= 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {productoVisualizando.cantidad_stock} unidades
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Precio de Venta</p>
                    <p className="font-semibold text-green-600 dark:text-green-400 text-lg">
                      {productoVisualizando.precio_venta?.toFixed(2)}€
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Coste Real</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {productoVisualizando.coste_real?.toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* Beneficio y Margen */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Beneficio</p>
                    <p className="font-bold text-green-700 dark:text-green-300 text-xl">
                      {productoVisualizando.precio_venta && productoVisualizando.coste_real
                        ? (productoVisualizando.precio_venta - productoVisualizando.coste_real).toFixed(2)
                        : '0.00'
                      }€
                    </p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Margen</p>
                    <p className="font-bold text-blue-700 dark:text-blue-300 text-xl">
                      {productoVisualizando.precio_venta && productoVisualizando.coste_real
                        ? (((productoVisualizando.precio_venta - productoVisualizando.coste_real) / productoVisualizando.coste_real) * 100).toFixed(1)
                        : '0.0'
                      }%
                    </p>
                  </div>
                </div>

                {/* Fecha de creación */}
                {productoVisualizando.created_at && (
                  <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Creado el {new Date(productoVisualizando.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    handleCerrarDetalle()
                    handleEditarProducto(productoVisualizando)
                  }}
                  className="flex-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={handleCerrarDetalle}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventarioApp 