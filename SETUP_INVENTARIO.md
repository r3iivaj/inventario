# Sistema de Inventario ZRUNK3D

## 📋 Descripción

Sistema completo de inventario desarrollado en React con Supabase como backend. Incluye gestión de productos, mercadillos, gastos y productos por mercadillo con una interfaz moderna y responsive.

## 🚀 Características

- ✅ **CRUD completo** para todas las tablas (Productos, Mercadillos, Gastos, Productos-Mercadillo)
- ✅ **Interfaz moderna** con diseño responsive
- ✅ **Filtros avanzados** por categoría, precio, fecha y búsqueda
- ✅ **Categorías de productos** predefinidas (Serpientes, Packs Multicolor, Logos, Luminoso, Imanes)
- ✅ **Gestión de imágenes** con vista previa
- ✅ **Cálculo automático** de márgenes de ganancia
- ✅ **Estados de stock** con alertas de stock bajo

## 🛠️ Instalación y Configuración

### 1. Configurar Supabase

1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a la sección **SQL Editor** y ejecuta el siguiente script para crear las tablas:

```sql
-- Crear tabla productos
CREATE TABLE productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_venta DECIMAL(10,2) NOT NULL,
  costo_real DECIMAL(10,2) NOT NULL,
  cantidad_stock INTEGER NOT NULL DEFAULT 0,
  categoria TEXT NOT NULL,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla mercadillo
CREATE TABLE mercadillo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  total_ventas DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla gastos
CREATE TABLE gastos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  concepto TEXT NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  id_mercadillo UUID REFERENCES mercadillo(id),
  id_grupo UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla productos_mercadillo
CREATE TABLE productos_mercadillo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  id_producto UUID REFERENCES productos(id) NOT NULL,
  id_mercadillo UUID REFERENCES mercadillo(id) NOT NULL,
  cantidad INTEGER NOT NULL,
  total_vendido DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadillo ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_mercadillo ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas (permitir todo por ahora)
CREATE POLICY "Enable all operations for all users" ON productos FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON mercadillo FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON gastos FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON productos_mercadillo FOR ALL USING (true);
```

### 2. Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega tus credenciales de Supabase:

```env
REACT_APP_SUPABASE_URL=tu_url_de_supabase_aqui
REACT_APP_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

**¿Dónde encontrar estas credenciales?**
- Ve a tu proyecto de Supabase
- Navega a **Settings** > **API**
- Copia la **Project URL** y **anon public key**

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar la Aplicación

```bash
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── InventarioApp.js          # Componente principal
│   ├── InventarioApp.css         # Estilos principales
│   ├── ProductoCard.js           # Tarjeta de producto
│   ├── ProductoCard.css          # Estilos de tarjeta
│   ├── ProductoForm.js           # Formulario de productos
│   ├── ProductoForm.css          # Estilos de formulario
│   ├── Filtros.js                # Componente de filtros
│   └── Filtros.css               # Estilos de filtros
├── services/
│   ├── productosService.js       # CRUD de productos
│   ├── mercadillosService.js     # CRUD de mercadillos
│   ├── gastosService.js          # CRUD de gastos
│   └── productosMercadilloService.js # CRUD productos-mercadillo
├── types/
│   ├── database.ts               # Tipos TypeScript
│   └── categoria_producto.tsx    # Categorías de productos
├── config/
│   └── supabase.js              # Configuración de Supabase
└── App.js                       # Componente raíz
```

## 🎯 Uso del Sistema

### Navegación Principal

1. **Home**: Vista principal con productos por categorías
2. **Productos**: Gestión completa de productos
3. **Mercadillo**: Gestión de mercadillos y eventos

### Gestión de Productos

#### Crear Producto
1. Haz clic en "Nuevo Producto"
2. Completa los campos obligatorios:
   - Nombre del producto
   - Categoría
   - Precio de venta
   - Costo real
   - Cantidad en stock
3. Opcionalmente agrega descripción e imagen
4. El sistema calculará automáticamente el margen de ganancia

#### Filtrar Productos
- **Por categoría**: Haz clic en las tarjetas de categoría
- **Por búsqueda**: Usa el campo de búsqueda en el header
- **Por orden**: Nombre, precio (asc/desc), fecha
- **Filtros combinados**: Todos los filtros funcionan juntos

### Categorías Disponibles

- 🐍 **SERPIENTES**: Productos relacionados con serpientes
- 🎨 **PACKS MULTICOLOR**: Paquetes con múltiples colores
- 🏷️ **LOGOS**: Productos con logos o marcas
- 💡 **LUMINOSO**: Productos con efectos luminosos
- 🧲 **IMANES**: Productos magnéticos
- 📦 **OTROS**: Productos no categorizados

## 🔧 Servicios CRUD Disponibles

### ProductosService
```javascript
import { productosService } from './services/productosService'

// Obtener todos los productos
const productos = await productosService.getAll()

// Obtener con filtros
const productosFiltrados = await productosService.getWithFilters({
  categoria: 'serpientes',
  orden: 'precio_asc',
  busqueda: 'texto'
})

// Crear producto
const nuevoProducto = await productosService.create(datosProducto)

// Actualizar producto
const productoActualizado = await productosService.update(id, datosProducto)

// Eliminar producto
await productosService.delete(id)
```

### MercadillosService
```javascript
import { mercadillosService } from './services/mercadillosService'

// Operaciones CRUD completas disponibles
```

### GastosService
```javascript
import { gastosService } from './services/gastosService'

// Operaciones CRUD completas disponibles
```

### ProductosMercadilloService
```javascript
import { productosMercadilloService } from './services/productosMercadilloService'

// Operaciones CRUD completas disponibles
```

## 🎨 Personalización

### Modificar Categorías

Edita el archivo `src/types/categoria_producto.tsx`:

```javascript
export const CategoriaProducto = {
  tu_categoria: 'tu_categoria',
  // ... más categorías
}

export const CategoriaProductoLabels = {
  tu_categoria: 'TU CATEGORÍA',
  // ... más labels
}
```

### Modificar Estilos

Los archivos CSS están organizados por componente. Los principales son:
- `InventarioApp.css`: Layout y estilos principales
- `ProductoCard.css`: Estilos de las tarjetas de producto
- `Filtros.css`: Estilos de los filtros

## 🚀 Próximos Pasos Sugeridos

1. **Autenticación**: Implementar login/registro con Supabase Auth
2. **Gestión de mercadillos**: Crear interfaces para las otras tablas
3. **Reportes**: Añadir gráficos y estadísticas
4. **Inventario avanzado**: Alertas de stock, reposición automática
5. **Imágenes**: Integrar subida de imágenes a Supabase Storage
6. **Móvil**: Mejorar la experiencia móvil

## 🐛 Resolución de Problemas

### Error de conexión a Supabase
- Verifica que las variables de entorno estén correctas
- Asegúrate de que las políticas RLS estén configuradas
- Revisa la consola del navegador para más detalles

### Productos no se muestran
- Verifica que existan productos en la base de datos
- Revisa los filtros aplicados
- Comprueba la consola para errores de red

### Formularios no funcionan
- Verifica que todos los campos obligatorios estén completos
- Revisa que los tipos de datos coincidan con la base de datos
- Comprueba los permisos en Supabase

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador para errores
2. Verifica la configuración de Supabase
3. Asegúrate de que todas las dependencias estén instaladas
4. Comprueba que las tablas tengan los nombres y campos correctos

---

¡Tu sistema de inventario ZRUNK3D está listo para usar! 🎉 