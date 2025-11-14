-- Asegurar que Realtime esté habilitado para bus_locations
-- Esta migración es idempotente y puede ejecutarse múltiples veces sin problemas

-- Habilitar RLS si no está habilitado
alter table bus_locations enable row level security;

-- Crear política de lectura pública si no existe
drop policy if exists "Public select" on bus_locations;
create policy "Public select" on bus_locations for select using (true);

-- Asegurar que la publicación de Realtime exista y tenga la tabla
-- Nota: En Supabase, la publicación 'supabase_realtime' ya existe por defecto
-- Solo necesitamos agregar la tabla si no está ya agregada
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and tablename = 'bus_locations'
  ) then
    alter publication supabase_realtime add table bus_locations;
  end if;
end $$;

