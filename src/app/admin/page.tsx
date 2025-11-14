"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Bus, Settings, Users, Radio } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/Auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
      setLoading(false);
    };

    checkAdmin();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted p-4 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-muted p-4 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-destructive mb-2">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground">
                Solo los administradores pueden acceder a esta página.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona buses, choferes y asignaciones
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/buses">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gestión de Buses</h3>
                  <p className="text-sm text-muted-foreground">
                    Ver y gestionar todos los buses
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/chofer/bus/new">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Registrar Bus</h3>
                  <p className="text-sm text-muted-foreground">
                    Agregar un nuevo bus al sistema
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/chofer">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Panel Chofer</h3>
                  <p className="text-sm text-muted-foreground">
                    Ver panel de choferes
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/admin/verify-realtime">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Radio className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Verificar Realtime</h3>
                  <p className="text-sm text-muted-foreground">
                    Verificar estado de Realtime
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}

