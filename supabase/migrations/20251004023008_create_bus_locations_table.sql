-- 6. Tabla de ubicaciones en tiempo real (opcional, se puede limpiar)
create table bus_locations (
  id bigserial primary key,
  bus_id uuid references buses(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  recorded_at timestamp with time zone default timezone('utc'::text, now())
);