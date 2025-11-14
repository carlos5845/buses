-- Habilitar RLS en la tabla profiles si no está habilitado
alter table profiles enable row level security;

-- Política para que los usuarios puedan leer su propio perfil
drop policy if exists "Usuarios pueden leer su propio perfil" on profiles;
create policy "Usuarios pueden leer su propio perfil"
  on profiles
  for select
  using (
    auth.uid() = id
  );

-- Política para que los usuarios puedan insertar su propio perfil
drop policy if exists "Usuarios pueden insertar su propio perfil" on profiles;
create policy "Usuarios pueden insertar su propio perfil"
  on profiles
  for insert
  with check (
    auth.uid() = id
  );

-- Política para que los usuarios puedan actualizar su propio perfil
drop policy if exists "Usuarios pueden actualizar su propio perfil" on profiles;
create policy "Usuarios pueden actualizar su propio perfil"
  on profiles
  for update
  using (
    auth.uid() = id
  )
  with check (
    auth.uid() = id
  );

-- Política para lectura pública de perfiles (opcional, para mostrar información básica)
drop policy if exists "Lectura pública de perfiles" on profiles;
create policy "Lectura pública de perfiles"
  on profiles
  for select
  using (true);




