# 🔧 Solución al Error de Storage en Supabase

## ❌ Error Actual
```
Error al subir imagen: {statuscode: '403', error: 'Unauthorized', message: 'new row violates row-level security policy'}
```

## 🎯 Causa del Problema
El bucket de Storage **"productos-imagenes"** no existe o no tiene las políticas de seguridad (RLS) configuradas correctamente.

## 📋 Solución Paso a Paso

### **Paso 1: Acceder al Dashboard de Supabase**
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto **"inventario"**

### **Paso 2: Crear el Bucket de Storage**
1. En el menú lateral izquierdo, haz clic en **"Storage"**
2. Haz clic en **"Create bucket"** (botón verde)
3. Configura el bucket:
   - **Name**: `productos-imagenes` ⚠️ **EXACTO** (sin espacios ni guiones)
   - **Public bucket**: ✅ **MARCAR COMO PÚBLICO**
   - **File size limit**: `5MB` (opcional)
   - **Allowed MIME types**: `image/*` (opcional)
4. Haz clic en **"Create bucket"**

### **Paso 3: Configurar Políticas de Seguridad (RLS)**
1. Una vez creado el bucket, haz clic en él para abrirlo
2. Ve a la pestaña **"Policies"** (en la parte superior)
3. Haz clic en **"New policy"**

#### **Política 1: Lectura Pública** 🔓
- **Policy name**: `Permitir lectura pública de imágenes`
- **Operation**: SELECT ✅
- **Policy definition**:
```sql
true
```

#### **Política 2: Subida de Imágenes** 📤
- Haz clic en **"New policy"** otra vez
- **Policy name**: `Permitir subida de imágenes a usuarios autenticados`
- **Operation**: INSERT ✅
- **Policy definition**:
```sql
auth.role() = 'authenticated'
```

#### **Política 3: Actualización de Imágenes** ✏️
- Haz clic en **"New policy"** otra vez
- **Policy name**: `Permitir actualización de imágenes a usuarios autenticados`
- **Operation**: UPDATE ✅
- **Policy definition**:
```sql
auth.role() = 'authenticated'
```

#### **Política 4: Eliminación de Imágenes** 🗑️
- Haz clic en **"New policy"** otra vez
- **Policy name**: `Permitir eliminación de imágenes a usuarios autenticados`
- **Operation**: DELETE ✅
- **Policy definition**:
```sql
auth.role() = 'authenticated'
```

### **Paso 4: Verificar Configuración**
1. Ve a **Storage > productos-imagenes**
2. Deberías ver el bucket vacío
3. Intenta subir una imagen desde la aplicación

## 🎯 Alternativa: Ejecutar Script SQL

Si prefieres usar SQL, ve a **SQL Editor** en Supabase y ejecuta:

```sql
-- Crear las políticas para el bucket productos-imagenes
CREATE POLICY "Permitir lectura pública de imágenes" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos-imagenes');

CREATE POLICY "Permitir subida de imágenes a usuarios autenticados" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'productos-imagenes' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Permitir actualización de imágenes a usuarios autenticados" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'productos-imagenes' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Permitir eliminación de imágenes a usuarios autenticados" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'productos-imagenes' 
    AND auth.role() = 'authenticated'
  );

-- Asegurar que el bucket sea público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'productos-imagenes';
```

## ✅ Verificación Final

Después de configurar:

1. **Reinicia la aplicación** (npm start)
2. **Inicia sesión** con Google OAuth
3. **Intenta subir una imagen** desde:
   - ✅ Botón de cámara en ProductoCard
   - ✅ Formulario de edición de producto
4. **Verifica que la imagen se vea** en la interfaz

## 🚨 Troubleshooting

### **Si aún no funciona:**

1. **Verifica autenticación**: Asegúrate de estar logueado
2. **Comprueba el nombre del bucket**: Debe ser exactamente `productos-imagenes`
3. **Revisa las políticas**: Todas las 4 políticas deben estar activas
4. **Bucket público**: Debe estar marcado como público

### **Para verificar políticas:**
```sql
-- Ver políticas del storage
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### **Para verificar buckets:**
```sql
-- Ver buckets
SELECT * FROM storage.buckets;
```

## 📱 Resultado Esperado

Una vez configurado correctamente:
- ✅ Podrás subir imágenes desde ProductoCard (botón de cámara)
- ✅ Podrás subir imágenes desde el formulario de edición
- ✅ Las imágenes se verán inmediatamente en la interfaz
- ✅ Las imágenes anteriores se eliminarán automáticamente al subir nuevas

¡El sistema de imágenes estará completamente funcional! 🎉