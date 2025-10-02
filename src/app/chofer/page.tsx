import { createClient } from "@/utils/supabase/server";

export default async function Chofer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return <p>Acceso denegado. Debes iniciar sesión.</p>;
  }

  return (
    <div>
      🚍 Página del chofer, bienvenido {user.email}
      <div></div>
    </div>
  );
}
