-- Prevenir que un chofer tenga múltiples buses asignados simultáneamente
-- Este trigger garantiza que cuando se asigna un bus a un chofer,
-- automáticamente se liberan todos sus otros buses

-- Asegurar que la columna updated_at existe
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' 
    and table_name = 'buses' 
    and column_name = 'updated_at'
  ) then
    alter table buses add column updated_at timestamp with time zone default timezone('utc'::text, now());
  end if;
end $$;

-- Crear trigger para actualizar updated_at automáticamente
create or replace function update_buses_updated_at()
returns trigger as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_buses_updated_at_trigger on buses;
create trigger update_buses_updated_at_trigger
  before update on buses
  for each row
  execute function update_buses_updated_at();

-- Función que se ejecuta antes de actualizar un bus
create or replace function ensure_single_bus_assignment()
returns trigger as $$
begin
  -- Si se está asignando un bus a un chofer (driver_id no es null)
  if new.driver_id is not null and new.driver_id != old.driver_id then
    -- Liberar todos los otros buses que tenga asignados ese chofer
    -- (excepto el que se está asignando actualmente)
    update buses
    set 
      driver_id = null,
      is_available = true
    where 
      driver_id = new.driver_id 
      and id != new.id
      and is_available = false;
    
    -- Asegurar que el bus asignado esté marcado como no disponible
    new.is_available := false;
  end if;
  
  -- Si se está liberando un bus (driver_id cambia a null)
  if new.driver_id is null and old.driver_id is not null then
    -- Asegurar que el bus liberado esté marcado como disponible
    new.is_available := true;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Crear el trigger antes de actualizar
drop trigger if exists prevent_multiple_bus_assignments on buses;
create trigger prevent_multiple_bus_assignments
  before update on buses
  for each row
  when (new.driver_id is distinct from old.driver_id)
  execute function ensure_single_bus_assignment();

-- También crear un trigger para INSERT por si acaso
create or replace function ensure_single_bus_assignment_on_insert()
returns trigger as $$
begin
  -- Si se está insertando un bus con un chofer asignado
  if new.driver_id is not null then
    -- Liberar todos los otros buses que tenga asignados ese chofer
    update buses
    set 
      driver_id = null,
      is_available = true
    where 
      driver_id = new.driver_id 
      and id != new.id
      and is_available = false;
    
    -- Asegurar que el bus insertado esté marcado como no disponible
    new.is_available := false;
  end if;
  
  return new;
end;
$$ language plpgsql;

drop trigger if exists prevent_multiple_bus_assignments_on_insert on buses;
create trigger prevent_multiple_bus_assignments_on_insert
  before insert on buses
  for each row
  when (new.driver_id is not null)
  execute function ensure_single_bus_assignment_on_insert();

-- Función SQL para asignar un bus a un chofer de forma atómica
-- Esta función garantiza que solo un bus esté asignado al chofer
create or replace function assign_bus_to_driver(
  p_bus_id uuid,
  p_driver_id uuid
)
returns void as $$
begin
  -- Verificar que el usuario autenticado es el mismo que p_driver_id
  if auth.uid() != p_driver_id then
    raise exception 'No puedes asignar buses a otros choferes';
  end if;
  
  -- Verificar que el usuario es un chofer
  if not exists (
    select 1 from profiles
    where id = p_driver_id
    and role = 'chofer'
  ) then
    raise exception 'Solo los choferes pueden asignar buses';
  end if;
  
  -- Verificar que el bus existe y está disponible
  if not exists (
    select 1 from buses
    where id = p_bus_id
    and (driver_id is null or driver_id = p_driver_id)
  ) then
    raise exception 'El bus no está disponible o no existe';
  end if;
  
  -- Primero, liberar todos los buses que tenga asignados ese chofer
  update buses
  set 
    driver_id = null,
    is_available = true
  where 
    driver_id = p_driver_id
    and is_available = false;
  
  -- Luego, asignar el nuevo bus
  update buses
  set 
    driver_id = p_driver_id,
    is_available = false
  where 
    id = p_bus_id;
end;
$$ language plpgsql security definer;

-- Otorgar permisos para ejecutar la función a los choferes
grant execute on function assign_bus_to_driver(uuid, uuid) to authenticated;

-- Limpiar cualquier asignación múltiple existente
-- Esto asegura que cada chofer tenga máximo un bus asignado
do $$
declare
  driver_record record;
begin
  -- Para cada chofer que tenga múltiples buses asignados
  for driver_record in 
    select driver_id, count(*) as bus_count
    from buses
    where driver_id is not null
    group by driver_id
    having count(*) > 1
  loop
    -- Mantener solo el más reciente (el último actualizado o creado)
    -- y liberar los demás
    update buses
    set 
      driver_id = null,
      is_available = true
    where 
      driver_id = driver_record.driver_id
      and id not in (
        select id
        from buses
        where driver_id = driver_record.driver_id
        order by coalesce(updated_at, created_at) desc
        limit 1
      );
  end loop;
end $$;

