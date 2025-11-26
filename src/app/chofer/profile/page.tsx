import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { UserProfile } from "@/components/user-profile";
import { ThemeTogglerDemo } from "@/components/theme-toggler";
export const metadata = {
  title: "Mi Perfil",
  description: "Ver información de perfil del chofer",
};

export default async function ChoferProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/Auth/login");
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Información de tu cuenta
          </p>
        </div>
        <div>
          <ThemeTogglerDemo direction="rtl" />
        </div>
      </div>

      <UserProfile user={user} />
    </div>
  );
}
