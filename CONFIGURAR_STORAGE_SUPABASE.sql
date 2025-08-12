-- Script SQL para configurar Storage de Supabase para imágenes de productos

-- 1. Crear el bucket (esto se debe hacer desde el Dashboard de Supabase)
-- Ve a Storage > Create bucket
-- Nombre: productos-imagenes
-- Público: SÍ (marcar como público)

-- 2. Habilitar RLS en el storage
-- Las políticas se aplicarán al bucket 'productos-imagenes'

-- 3. Política para permitir lectura pública de imágenes
CREATE POLICY "Permitir lectura pública de imágenes" ON storage.objects
  FOR SELECT USING (bucket_id = 'productos-imagenes');

-- 4. Política para permitir subida de imágenes a usuarios autenticados
CREATE POLICY "Permitir subida de imágenes a usuarios autenticados" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'productos-imagenes' 
    AND auth.role() = 'authenticated'
  );

-- 5. Política para permitir actualización de imágenes a usuarios autenticados
CREATE POLICY "Permitir actualización de imágenes a usuarios autenticados" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'productos-imagenes' 
    AND auth.role() = 'authenticated'
  );

-- 6. Política para permitir eliminación de imágenes a usuarios autenticados
CREATE POLICY "Permitir eliminación de imágenes a usuarios autenticados" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'productos-imagenes' 
    AND auth.role() = 'authenticated'
  );

-- 7. Verificar que el bucket sea público
-- Ejecutar en el Dashboard de Supabase (Settings > Database):
UPDATE storage.buckets 
SET public = true 
WHERE id = 'productos-imagenes';

-- 8. Comentarios para documentación
COMMENT ON POLICY "Permitir lectura pública de imágenes" ON storage.objects 
IS 'Permite a cualquier usuario ver las imágenes de productos públicamente';

COMMENT ON POLICY "Permitir subida de imágenes a usuarios autenticados" ON storage.objects 
IS 'Solo usuarios autenticados pueden subir nuevas imágenes';

COMMENT ON POLICY "Permitir actualización de imágenes a usuarios autenticados" ON storage.objects 
IS 'Solo usuarios autenticados pueden modificar imágenes existentes';

COMMENT ON POLICY "Permitir eliminación de imágenes a usuarios autenticados" ON storage.objects 
IS 'Solo usuarios autenticados pueden eliminar imágenes';