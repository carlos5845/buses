alter table buses
add column route text,
add column schedule text,
add column location_lat double precision,
add column location_lng double precision,
add column updated_at timestamp with time zone default timezone('utc'::text, now());
