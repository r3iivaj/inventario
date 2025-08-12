-- Script para diagnosticar el problema en la tabla productos
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar estructura de la tabla productos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
ORDER BY ordinal_position;

-- 2. Ver si existe alguna columna con nombre similar
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'productos' 
AND (column_name LIKE '%cost%' OR column_name LIKE '%precio%');

-- 3. Ver algunos registros de ejemplo para verificar datos
SELECT id, nombre, precio_venta, costo_real, cantidad_stock, categoria
FROM productos 
LIMIT 5;

-- 4. Verificar si hay algún constraint o trigger que pueda estar causando el problema
SELECT 
    constraint_name,
    constraint_type,
    table_name,
    column_name
FROM information_schema.key_column_usage 
WHERE table_name = 'productos';

-- 5. Si la columna se llama diferente, renombrarla
-- SOLO EJECUTAR SI ES NECESARIO:
-- ALTER TABLE productos RENAME COLUMN coste_real TO costo_real;

-- 6. O agregar la columna si no existe
-- SOLO EJECUTAR SI ES NECESARIO:
-- ALTER TABLE productos ADD COLUMN costo_real DECIMAL(10,2) DEFAULT 0;