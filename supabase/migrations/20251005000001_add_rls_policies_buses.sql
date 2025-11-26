-- Habilitar RLS en la tabla buses si no está habilitado
alter table buses enable row level security;

-- Política para que los choferes puedan insertar sus propios buses
drop policy if exists "Choferes pueden insertar sus propios buses" on buses;
create policy "Choferes pueden insertar sus propios buses"
  on buses
  for insert
  with check (
    auth.uid() = driver_id
  );

-- Política para que los choferes puedan ver sus propios buses
drop policy if exists "Choferes pueden ver sus propios buses" on buses;
create policy "Choferes pueden ver sus propios buses"
  on buses
  for select
  using (
    auth.uid() = driver_id
  );

-- Política para que los choferes puedan actualizar sus propios buses
drop policy if exists "Choferes pueden actualizar sus propios buses" on buses;
create policy "Choferes pueden actualizar sus propios buses"
  on buses
  for update
  using (
    auth.uid() = driver_id
  )
  with check (
    auth.uid() = driver_id
  );

-- Política para que los choferes puedan eliminar sus propios buses
drop policy if exists "Choferes pueden eliminar sus propios buses" on buses;
create policy "Choferes pueden eliminar sus propios buses"
  on buses
  for delete
  using (
    auth.uid() = driver_id
  );

-- Política para que cualquiera pueda leer buses (para el mapa público)
drop policy if exists "Lectura pública de buses" on buses;
create policy "Lectura pública de buses"
  on buses
  for select
  using (true);

-- Política para que los choferes puedan insertar en bus_locations
drop policy if exists "Choferes pueden insertar ubicaciones de sus buses" on bus_locations;
create policy "Choferes pueden insertar ubicaciones de sus buses"
  on bus_locations
  for insert
  with check (
    exists (
      select 1 from buses
      where buses.id = bus_locations.bus_id
      and buses.driver_id = auth.uid()
    )
  );

