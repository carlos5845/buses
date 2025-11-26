-- Resetear todas las asignaciones de buses
-- Esto libera todos los buses asignados y los marca como disponibles

update buses
set driver_id = null,
    is_available = true
where driver_id is not null;

-- Verificar que todos los buses estén disponibles
-- SELECT id, unit_number, driver_id, is_available FROM buses;



