-- Función para crear automáticamente un perfil cuando se registra un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, nombre)
  values (
    new.id,
    'estudiante', -- Por defecto es estudiante, se puede cambiar después
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger que se ejecuta después de insertar un usuario en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();




