-- 2. Tabla de buses
create table buses (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references profiles(id) on delete cascade, -- chofer
  unit_number text not null,
  capacity int not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);