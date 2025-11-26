"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-muted-foreground hover:text-foreground flex"
    >
      Cerrar sesión
    </button>
  );
}
