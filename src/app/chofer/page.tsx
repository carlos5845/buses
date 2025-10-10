import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SignOutButton from "@/secciones/components/SignOutButton";
import ChoferPage from "@/secciones/seccionchofer";
export default async function Chofer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/Auth/login");
  }

  return (
    <div>
      <div>
        <ChoferPage />
      </div>
    </div>
  );
}
