-- Asegurar que todos los buses sin chofer estén disponibles
update buses
set is_available = true
where driver_id is null and (is_available is null or is_available = false);

-- Asegurar que los buses con chofer no estén disponibles
update buses
set is_available = false
where driver_id is not null and is_available = true;

-- Eliminar políticas conflictivas y recrearlas correctamente
drop policy if exists "Choferes pueden ver su bus asignado" on buses;
drop policy if exists "Choferes pueden ver buses disponibles" on buses;
drop policy if exists "Admins pueden ver todos los buses" on buses;
drop policy if exists "Lectura pública de buses" on buses;

-- Política para que los choferes puedan ver su propio bus asignado
create policy "Choferes pueden ver su bus asignado"
  on buses
  for select
  using (
    auth.uid() = driver_id
  );

-- Política para que los choferes puedan ver buses disponibles (sin chofer)
create policy "Choferes pueden ver buses disponibles"
  on buses
  for select
  using (
    is_available = true 
    and driver_id is null
  );

-- Política para que los admins puedan ver todos los buses
create policy "Admins pueden ver todos los buses"
  on buses
  for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Política para lectura pública de buses (para el mapa - solo buses con chofer asignado)
create policy "Lectura pública de buses activos"
  on buses
  for select
  using (
    driver_id is not null
    and is_available = false
  );

-- Habilitar Realtime para la tabla buses (para que los choferes vean nuevos buses en tiempo real)
alter publication supabase_realtime add table buses;

