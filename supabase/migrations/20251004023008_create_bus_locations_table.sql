create table bus_locations (
  id bigserial primary key,
  bus_id uuid references buses(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now())
);

-- Activar Supabase Realtime
alter table bus_locations enable row level security;

-- Política pública de lectura (solo si lo necesitas)
create policy "Public select" on bus_locations for select using (true);
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table bus_locations;
