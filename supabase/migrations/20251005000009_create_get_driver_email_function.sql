-- Función para obtener el email de un chofer desde auth.users
-- Esta función solo puede ser llamada por admins

create or replace function get_driver_email(driver_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  driver_email text;
begin
  -- Obtener email desde auth.users
  select email into driver_email
  from auth.users
  where id = driver_id;
  
  return driver_email;
end;
$$;

-- Dar permisos a los admins para usar esta función
grant execute on function get_driver_email(uuid) to authenticated;



