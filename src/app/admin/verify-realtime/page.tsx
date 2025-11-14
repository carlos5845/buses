"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type RealtimeStatus = {
  table: string;
  enabled: boolean;
  rlsEnabled: boolean;
};

export default function VerifyRealtimePage() {
  const [status, setStatus] = useState<RealtimeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAndVerify = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/Auth/login");
        return;
      }

      // Verificar si es admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await verifyRealtime();
    };

    checkAndVerify();
  }, [router]);

  const verifyRealtime = async () => {
    setLoading(true);
    const tables = ["buses", "bus_locations"];
    const results: RealtimeStatus[] = [];

    for (const table of tables) {
      try {
        // Verificar si la tabla está en Realtime
        // Nota: No podemos ejecutar SQL directo desde el cliente
        // Pero podemos intentar suscribirnos para verificar
        const channel = supabase.channel(`verify-${table}`);
        
        let realtimeEnabled = false;
        let subscriptionActive = false;

        channel
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
            },
            () => {
              realtimeEnabled = true;
            }
          )
          .subscribe((status) => {
            subscriptionActive = status === "SUBSCRIBED";
            if (subscriptionActive) {
              realtimeEnabled = true;
            }
          });

        // Esperar un momento para que la suscripción se establezca
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verificar RLS
        const { data: rlsData, error: rlsError } = await supabase
          .from(table)
          .select("*")
          .limit(1);

        const rlsEnabled = !rlsError || rlsError.code !== "42501";

        results.push({
          table,
          enabled: subscriptionActive && realtimeEnabled,
          rlsEnabled,
        });

        // Limpiar suscripción
        supabase.removeChannel(channel);
      } catch (error) {
        console.error(`Error verificando ${table}:`, error);
        results.push({
          table,
          enabled: false,
          rlsEnabled: false,
        });
      }
    }

    setStatus(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <p>Verificando estado de Realtime...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-destructive mb-2">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground">
                Solo los administradores pueden verificar el estado de Realtime.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Verificación de Realtime</h1>
            <p className="text-muted-foreground">
              Verifica el estado de Realtime para las tablas del sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={verifyRealtime} variant="outline">
              🔄 Actualizar
            </Button>
            <Link href="/admin">
              <Button variant="outline">← Volver</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {status.map((item) => (
          <Card key={item.table}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{item.table}</CardTitle>
                <div className="flex gap-2">
                  <Badge
                    variant={item.enabled ? "default" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {item.enabled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Realtime Activo
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Realtime Inactivo
                      </>
                    )}
                  </Badge>
                  <Badge
                    variant={item.rlsEnabled ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {item.rlsEnabled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        RLS Activo
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        RLS Desconocido
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Estado de Realtime:
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      item.enabled ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.enabled
                      ? "✅ Habilitado - Los cambios se transmiten en tiempo real"
                      : "❌ Deshabilitado - Los cambios NO se transmiten en tiempo real"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Row Level Security (RLS):
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      item.rlsEnabled ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {item.rlsEnabled
                      ? "✅ Habilitado"
                      : "⚠️ No se pudo verificar"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-4 bg-muted">
        <div className="space-y-2">
          <h3 className="font-semibold">📝 Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>
              Si Realtime está inactivo, ejecuta la migración{" "}
              <code className="bg-background px-1 rounded">
                20251005000009_ensure_realtime_buses.sql
              </code>{" "}
              en Supabase SQL Editor
            </li>
            <li>
              También puedes ejecutar manualmente el script{" "}
              <code className="bg-background px-1 rounded">
                supabase/verify_realtime.sql
              </code>{" "}
              para verificar y habilitar Realtime
            </li>
            <li>
              Verifica en el Dashboard de Supabase → Database → Realtime que las
              tablas estén habilitadas
            </li>
          </ol>
        </div>
      </Card>
    </div>
  );
}



