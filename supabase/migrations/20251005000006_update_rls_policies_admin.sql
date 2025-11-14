-- Actualizar políticas RLS para permitir que admins creen buses sin driver_id

-- Eliminar políticas existentes de buses
drop policy if exists "Choferes pueden insertar sus propios buses" on buses;
drop policy if exists "Choferes pueden ver sus propios buses" on buses;
drop policy if exists "Choferes pueden actualizar sus propios buses" on buses;
drop policy if exists "Choferes pueden eliminar sus propios buses" on buses;
drop policy if exists "Lectura pública de buses" on buses;

-- Política para que los admins puedan insertar buses (sin driver_id)
create policy "Admins pueden insertar buses"
  on buses
  for insert
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Política para que los choferes puedan ver su propio bus asignado
create policy "Choferes pueden ver su bus asignado"
  on buses
  for select
  using (
    auth.uid() = driver_id
  );

-- Política para que los choferes puedan ver buses disponibles (para seleccionar)
create policy "Choferes pueden ver buses disponibles"
  on buses
  for select
  using (
    (is_available = true and driver_id is null)
    or
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'chofer'
    )
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

-- Política para que los choferes puedan actualizar su propio bus (seleccionarlo)
create policy "Choferes pueden seleccionar buses disponibles"
  on buses
  for update
  using (
    is_available = true
    and driver_id is null
  )
  with check (
    driver_id = auth.uid()
    and is_available = false
  );

-- Política para que los admins puedan actualizar cualquier bus
create policy "Admins pueden actualizar buses"
  on buses
  for update
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Política para que los admins puedan eliminar buses
create policy "Admins pueden eliminar buses"
  on buses
  for delete
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Política para lectura pública de buses (para el mapa)
create policy "Lectura pública de buses"
  on buses
  for select
  using (true);

