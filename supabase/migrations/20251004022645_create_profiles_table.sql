create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  role text check (role in ('chofer', 'estudiante')) not null,
  nombre text,
  created_at timestamp default now()
);
