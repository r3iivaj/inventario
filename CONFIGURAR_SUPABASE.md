# 🔧 Configuración de Supabase

## ⚠️ Problema Actual
La aplicación está ejecutándose en **modo demo** porque las variables de entorno de Supabase no están configuradas.

## 📋 Pasos para Configurar Supabase

### 1. Crear un proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se complete la configuración

### 2. Obtener las credenciales
1. En tu proyecto de Supabase, ve a **Settings** → **API**
2. Copia la **URL** del proyecto
3. Copia la **anon/public** key

### 3. Crear el archivo .env
Crea un archivo llamado `.env` en la raíz del proyecto (mismo nivel que package.json) con el siguiente contenido:

```env
VITE_SUPABASE_URL=https://tu-proyecto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Importante:** Reemplaza los valores con tus credenciales reales de Supabase.

### 4. Crear las tablas en Supabase
Ejecuta este SQL en el **SQL Editor** de Supabase:

```sql
-- Tabla de productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_venta DECIMAL(10,2) NOT NULL,
  costo_real DECIMAL(10,2),
  cantidad_stock INTEGER DEFAULT 0,
  categoria VARCHAR(100),
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mercadillos
CREATE TABLE mercadillos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  total_ventas DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de gastos
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  concepto VARCHAR(255) NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  id_mercadillo INTEGER REFERENCES mercadillos(id),
  id_grupo VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos en mercadillos
CREATE TABLE productos_mercadillo (
  id SERIAL PRIMARY KEY,
  id_producto INTEGER REFERENCES productos(id),
  id_mercadillo INTEGER REFERENCES mercadillos(id),
  cantidad INTEGER NOT NULL,
  total_vendido DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio_venta, costo_real, cantidad_stock, categoria) VALUES
('Imán murciélago', 'Imán decorativo en forma de murciélago', 1.00, 0.50, 0, 'Imanes'),
('D20', 'Dado de 20 caras para juegos de rol', 1.00, 0.40, 0, 'Dados'),
('Llavero reliquias de la muerte', 'Llavero inspirado en Harry Potter', 2.00, 0.80, 0, 'Llaveros');
```

### 5. Configurar Row Level Security (RLS)
Para desarrollo, puedes deshabilitar RLS temporalmente:

```sql
-- Deshabilitar RLS para desarrollo (¡NO usar en producción!)
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE mercadillos DISABLE ROW LEVEL SECURITY;
ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos_mercadillo DISABLE ROW LEVEL SECURITY;
```

### 6. Reiniciar la aplicación
1. Detén el servidor de desarrollo (Ctrl+C)
2. Ejecuta `npm start` nuevamente
3. Verifica que ya no aparezcan los mensajes de "modo demo" en la consola

## 🎯 Verificar que funciona
- La consola del navegador no debería mostrar mensajes de "modo demo"
- Los productos deberían cargarse desde Supabase
- Los filtros y búsqueda deberían funcionar correctamente

## 🔒 Seguridad
- **NUNCA** subas el archivo `.env` a Git
- El archivo `.env` ya está en `.gitignore`
- En producción, configura las variables de entorno en tu plataforma de hosting

## 📞 Soporte
Si tienes problemas, revisa:
1. Que las credenciales sean correctas
2. Que las tablas estén creadas
3. Que RLS esté deshabilitado para desarrollo
4. La consola del navegador para errores específicos 