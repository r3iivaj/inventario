-- PASO 1: Ejecutar en Supabase SQL Editor
-- Ve a tu proyecto > SQL Editor > Nueva consulta > Pega y ejecuta este código

-- 1. Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'productos-imagenes';

-- 2. Asegurar que el bucket sea público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'productos-imagenes';

-- 3. Crear políticas para el storage (productos-imagenes)

-- Política SELECT: Permite lectura pública de imágenes
CREATE POLICY "Permitir lectura pública de imágenes"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos-imagenes');

-- Política INSERT: Permite subida a usuarios autenticados
CREATE POLICY "Permitir subida de imágenes a usuarios autenticados"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'productos-imagenes' 
  AND auth.role() = 'authenticated'
);

-- Política UPDATE: Permite actualización a usuarios autenticados
CREATE POLICY "Permitir actualización de imágenes a usuarios autenticados"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'productos-imagenes' 
  AND auth.role() = 'authenticated'
);

-- Política DELETE: Permite eliminación a usuarios autenticados  
CREATE POLICY "Permitir eliminación de imágenes a usuarios autenticados"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'productos-imagenes' 
  AND auth.role() = 'authenticated'
);

-- 4. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;