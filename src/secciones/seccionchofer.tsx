"use client";

import { Navigation, User, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import SignOutButton from "./components/SignOutButton";
import DriverTracker from "./components/DriverTracker";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BusInfo = {
  id: string;
  unit_number: string;
  route: string | null;
} | null;

type User = {
  id: string;
  email?: string;
} | null;

export default function ChoferPage() {
  const [user, setUser] = useState<User>(null);
  const [busInfo, setBusInfo] = useState<BusInfo>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/Auth/login");
        return;
      }

      if (!mounted) return;

      setUser(currentUser);

      // Verificar si es admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (mounted) {
        setIsAdmin(profile?.role === "admin");
      }

      // Función para recargar el bus asignado
      const reloadBusInfo = async () => {
        if (!mounted || !currentUser) return;

        const { data: bus } = await supabase
          .from("buses")
          .select("id, unit_number, route")
          .eq("driver_id", currentUser.id)
          .limit(1)
          .maybeSingle();

        if (mounted) {
          console.log("Bus actualizado:", bus);
          setBusInfo(bus || null);
        }
      };

      // Cargar bus inicial
      await reloadBusInfo();

      if (mounted) {
        setLoading(false);

        // Suscribirse a cambios en tiempo real de buses
        channel = supabase
          .channel(`chofer-bus-updates-${currentUser.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "buses",
            },
            async (payload) => {
              console.log("Cambio en buses detectado:", payload);
              console.log("Evento:", payload.eventType);
              console.log("Nuevo:", payload.new);
              console.log("Anterior:", payload.old);

              if (!mounted || !currentUser) return;

              const newBus = payload.new as {
                id?: string;
                driver_id: string | null;
              } | null;
              const oldBus = payload.old as {
                id?: string;
                driver_id: string | null;
              } | null;

              // Verificar si el cambio afecta al chofer actual
              const newDriverId = newBus?.driver_id;
              const oldDriverId = oldBus?.driver_id;
              const affectsCurrentDriver =
                newDriverId === currentUser.id ||
                oldDriverId === currentUser.id;

              console.log("¿Afecta al chofer actual?", affectsCurrentDriver);
              console.log("driver_id nuevo:", newDriverId);
              console.log("driver_id anterior:", oldDriverId);
              console.log("chofer actual:", currentUser.id);

              if (affectsCurrentDriver) {
                console.log("Recargando información del bus...");
                await reloadBusInfo();
              }
            }
          )
          .subscribe((status) => {
            console.log("Estado de suscripción:", status);
          });
      }
    };

    fetchData();

    return () => {
      mounted = false;
      if (channel) {
        console.log("Limpiando suscripción...");
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  if (loading) {
    return (
      <div className=" p-4 flex items-center justify-center">
        <p className="font-bold ">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const busId = busInfo?.id || null;

  return (
    <div className="  p-4">
      <div className="max-w-2xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Navigation className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel del Conductor
          </h1>
          <p className="text-muted-foreground">
            Comparte tu ubicación en tiempo real con los estudiantes
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
          {busInfo && (
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-sm">
                🚌 Bus: {busInfo.unit_number}
                {busInfo.route && ` - Ruta: ${busInfo.route}`}
              </Badge>
              <Link href="/chofer/bus/select">
                <Button variant="outline" size="sm">
                  Cambiar Bus
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Status Card */}
        <Card className="p-6 bg-card border-border shadow-lg">
          {!busId ? (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-primary mb-1">
                    No tienes un bus asignado
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Selecciona un bus disponible para comenzar a compartir tu
                    ubicación en tiempo real.
                  </p>
                  <Link href="/chofer/bus/select">
                    <Button className="w-full sm:w-auto">
                      Seleccionar Bus Disponible
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <DriverTracker busId={busId} />
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-5 bg-primary/5 border-primary/20">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                Información importante:
              </p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  Tu ubicación se actualizará automáticamente cada vez que el
                  GPS detecte un cambio
                </li>
                <li>
                  Los estudiantes verán tu posición en el mapa en tiempo real
                </li>
                <li>Asegúrate de tener una conexión estable a internet</li>
                <li>Puedes detener la transmisión en cualquier momento</li>
                <li>
                  Permite el acceso a la ubicación cuando el navegador lo
                  solicite
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            ← Volver a vista de estudiantes
          </Link>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                ⚙️ Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
