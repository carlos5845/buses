-- Script de verificación de Realtime para Supabase
-- Ejecuta este script en el SQL Editor de Supabase para verificar el estado

-- 1. Verificar qué tablas están en la publicación de Realtime
SELECT 
    schemaname,
    tablename,
    pubname as publication_name
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 2. Verificar específicamente si 'buses' está habilitada
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = 'buses'
        ) THEN '✅ Tabla buses está en Realtime'
        ELSE '❌ Tabla buses NO está en Realtime'
    END as buses_status;

-- 3. Verificar específicamente si 'bus_locations' está habilitada
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = 'bus_locations'
        ) THEN '✅ Tabla bus_locations está en Realtime'
        ELSE '❌ Tabla bus_locations NO está en Realtime'
    END as bus_locations_status;

-- 4. Verificar si RLS está habilitado en las tablas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('buses', 'bus_locations')
ORDER BY tablename;

-- 5. Habilitar Realtime para buses si no está habilitado (ejecutar solo si es necesario)
-- Descomenta las siguientes líneas si necesitas habilitar Realtime manualmente:
/*
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'buses'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE buses;
        RAISE NOTICE '✅ Tabla buses agregada a Realtime';
    ELSE
        RAISE NOTICE 'ℹ️ Tabla buses ya está en Realtime';
    END IF;
END $$;
*/



