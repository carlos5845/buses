
-- 3. Tabla de rutas
create table routes (
  id uuid primary key default gen_random_uuid(),
  bus_id uuid references buses(id) on delete cascade,
  name text not null,
  schedule text, -- Ej: "07:00 - 08:30"
  created_at timestamp with time zone default timezone('utc'::text, now())
);