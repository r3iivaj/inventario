import { productosService } from './productosService'
import { productosMercadilloService } from './productosMercadilloService'
import { mercadillosService } from './mercadillosService'

export const stockService = {
  // Actualizar stock basado en ventas del mercadillo
  async actualizarStockDesdeMercadillo(idMercadillo) {
    try {
      console.log(`🔄 Iniciando actualización de stock para mercadillo ${idMercadillo}`)
      
      // 1. Obtener el mercadillo
      const { data: mercadillo, error: errorMercadillo } = await mercadillosService.getById(idMercadillo)
      if (errorMercadillo || !mercadillo) {
        throw new Error('No se pudo obtener el mercadillo')
      }

      // 2. Verificar si puede actualizar stock
      const verificacion = mercadillosService.puedeActualizarStock(mercadillo)
      if (!verificacion.puede) {
        throw new Error(verificacion.razon)
      }

      // 3. Obtener todas las ventas del mercadillo
      const { data: ventas, error: errorVentas } = await productosMercadilloService.getByMercadilloConDetalles(idMercadillo)
      if (errorVentas) {
        // En modo demo, usar datos de prueba
        console.log('⚠️ Modo demo: usando datos de prueba para actualización de stock')
        return await this.actualizarStockDemo(idMercadillo)
      }

      if (!ventas || ventas.length === 0) {
        throw new Error('No hay ventas registradas en este mercadillo')
      }

      // 4. Agrupar ventas por producto
      const ventasPorProducto = {}
      ventas.forEach(venta => {
        const idProducto = venta.id_producto
        if (!ventasPorProducto[idProducto]) {
          ventasPorProducto[idProducto] = {
            producto: venta.producto,
            totalVendido: 0
          }
        }
        ventasPorProducto[idProducto].totalVendido += venta.cantidad
      })

      // 5. Actualizar stock de cada producto
      const resultados = []
      for (const [idProducto, info] of Object.entries(ventasPorProducto)) {
        try {
          // Obtener stock actual
          const { data: producto, error: errorProducto } = await productosService.getById(idProducto)
          if (errorProducto || !producto) {
            console.error(`❌ No se pudo obtener producto ${idProducto}`)
            continue
          }

          const nuevoStock = Math.max(0, producto.cantidad_stock - info.totalVendido)
          
          // Actualizar stock
          const { data: productoActualizado, error: errorActualizacion } = await productosService.update(idProducto, {
            cantidad_stock: nuevoStock
          })

          if (errorActualizacion) {
            console.error(`❌ Error al actualizar stock del producto ${producto.nombre}:`, errorActualizacion)
            resultados.push({
              producto: producto.nombre,
              exito: false,
              error: errorActualizacion.message
            })
          } else {
            console.log(`✅ Stock actualizado: ${producto.nombre} - Vendido: ${info.totalVendido}, Nuevo stock: ${nuevoStock}`)
            resultados.push({
              producto: producto.nombre,
              exito: true,
              stockAnterior: producto.cantidad_stock,
              vendido: info.totalVendido,
              nuevoStock: nuevoStock
            })
          }
        } catch (error) {
          console.error(`❌ Error procesando producto ${idProducto}:`, error)
          resultados.push({
            producto: info.producto?.nombre || `ID: ${idProducto}`,
            exito: false,
            error: error.message
          })
        }
      }

      // 6. Marcar mercadillo como stock actualizado
      await mercadillosService.marcarStockActualizado(idMercadillo)

      console.log('🎉 Actualización de stock completada')
      return {
        exito: true,
        resultados,
        totalProductos: Object.keys(ventasPorProducto).length,
        productosActualizados: resultados.filter(r => r.exito).length
      }

    } catch (error) {
      console.error('❌ Error al actualizar stock:', error)
      return {
        exito: false,
        error: error.message
      }
    }
  },

  // Actualización de stock en modo demo
  async actualizarStockDemo(idMercadillo) {
    console.log('🎭 Simulando actualización de stock en modo demo')
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Sin datos de prueba - solo trabajar con datos reales
    return {
      exito: false,
      error: 'No hay ventas registradas para actualizar stock',
      modoDemo: true
    }
  },

  // Obtener resumen de lo que se actualizaría (preview)
  async previsualizarActualizacionStock(idMercadillo) {
    try {
      // Obtener ventas del mercadillo
      const { data: ventas, error: errorVentas } = await productosMercadilloService.getByMercadilloConDetalles(idMercadillo)
      
      if (errorVentas) {
        // Modo demo - sin datos de prueba
        return {
          preview: [],
          totalProductos: 0,
          modoDemo: true
        }
      }

      if (!ventas || ventas.length === 0) {
        return { preview: [], totalProductos: 0 }
      }

      // Agrupar por producto
      const ventasPorProducto = {}
      ventas.forEach(venta => {
        const idProducto = venta.id_producto
        if (!ventasPorProducto[idProducto]) {
          ventasPorProducto[idProducto] = {
            producto: venta.producto,
            totalVendido: 0
          }
        }
        ventasPorProducto[idProducto].totalVendido += venta.cantidad
      })

      // Obtener stock actual de cada producto
      const preview = []
      for (const [idProducto, info] of Object.entries(ventasPorProducto)) {
        const { data: producto } = await productosService.getById(idProducto)
        if (producto) {
          preview.push({
            producto: producto.nombre,
            stockActual: producto.cantidad_stock,
            vendido: info.totalVendido,
            nuevoStock: Math.max(0, producto.cantidad_stock - info.totalVendido)
          })
        }
      }

      return { preview, totalProductos: preview.length }
    } catch (error) {
      console.error('Error al previsualizar actualización:', error)
      return { preview: [], error: error.message }
    }
  }
} 