import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@/components/user-profile";
import { ThemeTogglerDemo } from "@/components/theme-toggler";
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
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        {/* Texto */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mi Perfil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Visualiza tu información personal y datos de administrador
          </p>
        </div>

        {/* Toggle */}
        <div className="self-start md:self-auto">
          <ThemeTogglerDemo direction="ltr" />
        </div>
      </div>

      <UserProfile user={user} />
    </div>
  );
}
