-- Agregar rol 'admin' a la tabla profiles
alter table profiles 
drop constraint if exists profiles_role_check;

alter table profiles
add constraint profiles_role_check 
check (role in ('chofer', 'estudiante', 'admin'));



