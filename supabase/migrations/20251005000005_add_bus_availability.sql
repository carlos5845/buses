-- Agregar campo para indicar si el bus está disponible
alter table buses
add column is_available boolean default true not null;

-- Hacer que driver_id sea nullable (un bus disponible no tiene chofer asignado)
alter table buses
alter column driver_id drop not null;

-- Crear índice para búsquedas rápidas de buses disponibles
create index idx_buses_available on buses(is_available) where is_available = true;

-- Actualizar buses existentes para que estén disponibles si no tienen chofer
-- También marcar como disponibles los buses que tienen driver_id pero queremos resetear
update buses
set is_available = true
where driver_id is null;

-- Asegurar que todos los buses sin chofer estén marcados como disponibles
update buses
set is_available = true, driver_id = null
where driver_id is not null and is_available = false;

