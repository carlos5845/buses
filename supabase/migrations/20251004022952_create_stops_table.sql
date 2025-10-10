-- 4. Tabla de paradas
create table stops (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references routes(id) on delete cascade,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  order_index int not null, -- orden en la ruta
  created_at timestamp with time zone default timezone('utc'::text, now())
);
