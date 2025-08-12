# 📁 Configuración de Supabase Storage para Imágenes

## 🎯 Objetivo
Configurar un bucket de almacenamiento en Supabase para guardar las imágenes de los productos.

## 📋 Pasos de configuración

### 1. **Acceder al Dashboard de Supabase**
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión y selecciona tu proyecto
3. En el menú lateral, haz clic en **"Storage"**

### 2. **Crear el Bucket**
1. Haz clic en **"Create bucket"**
2. Configura el bucket:
   - **Name**: `productos-imagenes`
   - **Public bucket**: ✅ **SÍ** (marcar como público)
   - **File size limit**: `5MB` (opcional)
   - **Allowed MIME types**: `image/*` (opcional)

### 3. **Configurar Políticas RLS (Row Level Security)**
1. Ve a la pestaña **"Policies"** dentro de Storage
2. Haz clic en **"New policy"** para el bucket `productos-imagenes`
3. Selecciona **"For full customization"**

#### **Política de Lectura (SELECT)**
```sql
-- Nombre: "Permitir lectura pública de imágenes"
-- Operation: SELECT
-- Policy definition:
true
```

#### **Política de Inserción (INSERT)**
```sql
-- Nombre: "Permitir subida de imágenes a usuarios autenticados"  
-- Operation: INSERT
-- Policy definition:
auth.role() = 'authenticated'
```

#### **Política de Actualización (UPDATE)**
```sql
-- Nombre: "Permitir actualización de imágenes a usuarios autenticados"
-- Operation: UPDATE  
-- Policy definition:
auth.role() = 'authenticated'
```

#### **Política de Eliminación (DELETE)**
```sql
-- Nombre: "Permitir eliminación de imágenes a usuarios autenticados"
-- Operation: DELETE
-- Policy definition:
auth.role() = 'authenticated'
```

### 4. **Verificar la configuración**
1. Ve a **Storage > productos-imagenes**
2. Intenta subir una imagen de prueba
3. Verifica que puedas ver la imagen en el navegador usando la URL pública

## 🔧 Estructura del Bucket
```
productos-imagenes/
├── 1234567890_imagen1.jpg
├── 1234567891_imagen2.png
└── 1234567892_imagen3.gif
```

## 📝 Notas importantes

### **Nombres de archivo**
- Se genera automáticamente con timestamp + nombre original
- Formato: `{timestamp}_{nombre_sanitizado}`
- Caracteres especiales se reemplazan por `_`

### **URLs públicas**
- Formato: `https://[proyecto].supabase.co/storage/v1/object/public/productos-imagenes/[archivo]`
- Las URLs son públicas y accesibles sin autenticación

### **Limpieza automática**
- Al eliminar un producto, su imagen también se elimina del Storage
- Al actualizar la imagen de un producto, la imagen anterior se elimina automáticamente

## ✅ Funcionalidades implementadas

- ✅ **Subida de imágenes**: Al crear/editar producto
- ✅ **Eliminación automática**: Al borrar producto o cambiar imagen  
- ✅ **URLs públicas**: Para mostrar imágenes en la interfaz
- ✅ **Validación de archivos**: Tipo y tamaño
- ✅ **Nombres únicos**: Evita conflictos de nombres
- ✅ **Compatibilidad**: Con URLs externas (no del storage)

## 🚨 Troubleshooting

### **Error: "Policy violation"**
- Verifica que las políticas RLS estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado

### **Error: "Bucket not found"**  
- Verifica que el bucket `productos-imagenes` exista
- Comprueba que esté marcado como público

### **Error: "File too large"**
- El límite por defecto es 5MB
- Ajusta en la configuración del bucket si necesitas más

### **Imágenes no se ven**
- Verifica que la política SELECT permita lectura pública
- Comprueba que la URL sea correcta en el navegador