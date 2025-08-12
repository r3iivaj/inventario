-- Script para verificar la estructura de la tabla productos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Verificar estructura de la tabla productos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si hay productos con imagen_url
SELECT 
    id,
    nombre,
    imagen_url,
    CASE 
        WHEN imagen_url IS NULL THEN 'Sin imagen'
        WHEN imagen_url = '' THEN 'URL vacía'
        ELSE 'Con imagen'
    END as estado_imagen
FROM productos 
ORDER BY created_at DESC
LIMIT 10;

-- 3. Contar productos por estado de imagen
SELECT 
    CASE 
        WHEN imagen_url IS NULL THEN 'Sin imagen (NULL)'
        WHEN imagen_url = '' THEN 'Sin imagen (vacío)'
        ELSE 'Con imagen'
    END as estado,
    COUNT(*) as cantidad
FROM productos 
GROUP BY 
    CASE 
        WHEN imagen_url IS NULL THEN 'Sin imagen (NULL)'
        WHEN imagen_url = '' THEN 'Sin imagen (vacío)'
        ELSE 'Con imagen'
    END;

-- 4. Ver las últimas 5 actualizaciones de productos
SELECT 
    id,
    nombre,
    imagen_url,
    created_at,
    updated_at
FROM productos 
WHERE updated_at IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;