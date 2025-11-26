import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@/components/user-profile";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/Auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visualiza tu información personal y datos de administrador
        </p>
      </div>

      <UserProfile user={user} />
    </div>
  );
}
