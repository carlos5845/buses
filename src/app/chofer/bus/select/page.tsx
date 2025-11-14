"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bus } from "lucide-react";

type AvailableBus = {
  id: string;
  unit_number: string;
  route: string | null;
  capacity: number;
  schedule: string | null;
};

export default function SelectBusPage() {
  const [buses, setBuses] = useState<AvailableBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchAvailableBuses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/Auth/login");
      return;
    }

    // Obtener buses disponibles (sin chofer asignado)
    const { data, error } = await supabase
      .from("buses")
      .select("id, unit_number, route, capacity, schedule, is_available, driver_id")
      .eq("is_available", true)
      .is("driver_id", null)
      .order("unit_number", { ascending: true });

    if (error) {
      console.error("Error cargando buses:", error);
      console.error("Detalles del error:", error.message, error.details, error.hint);
      alert(`Error al cargar buses: ${error.message}`);
    } else {
      console.log("Buses disponibles encontrados:", data);
      setBuses(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      // Cargar buses iniciales
      await fetchAvailableBuses();

      // Suscribirse a cambios en tiempo real de buses
      channel = supabase
        .channel("available-buses-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "buses",
          },
          async (payload) => {
            console.log("Cambio en buses detectado (select page):", payload);
            console.log("Evento:", payload.eventType);
            console.log("Nuevo:", payload.new);
            console.log("Anterior:", payload.old);
            
            // Recargar buses disponibles cuando hay cambios
            if (mounted) {
              console.log("Recargando lista de buses disponibles...");
              await fetchAvailableBuses();
            }
          }
        )
        .subscribe((status) => {
          console.log("Estado de suscripción (select page):", status);
        });
    };

    setupRealtime();

    return () => {
      mounted = false;
      if (channel) {
        console.log("Limpiando suscripción (select page)...");
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const handleSelectBus = async (busId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión.");
      return;
    }

    setSelecting(busId);

    try {
      // Verificar si el usuario tiene un perfil de chofer
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (!profile) {
        alert("No tienes un perfil. Contacta al administrador.");
        return;
      }

      if (profile.role !== "chofer") {
        alert("Solo los choferes pueden seleccionar buses.");
        return;
      }

      // Usar la función SQL para asignar el bus de forma atómica
      // Esto garantiza que solo un bus esté asignado al chofer
      const { error } = await supabase.rpc("assign_bus_to_driver", {
        p_bus_id: busId,
        p_driver_id: user.id,
      });

      if (error) {
        console.error("Error al seleccionar bus:", error);
        
        // Si la función RPC no existe o falla, usar el método anterior como fallback
        console.log("Intentando método alternativo...");
        
        // Primero, liberar cualquier bus que el chofer tenga asignado previamente
        const { error: releaseError } = await supabase
          .from("buses")
          .update({
            driver_id: null,
            is_available: true,
          })
          .eq("driver_id", user.id);

        if (releaseError) {
          console.error("Error al liberar bus anterior:", releaseError);
        }

        // Ahora asignar el nuevo bus al chofer
        const { error: assignError } = await supabase
          .from("buses")
          .update({
            driver_id: user.id,
            is_available: false,
          })
          .eq("id", busId);

        if (assignError) {
          console.error("Error al asignar bus:", assignError);
          alert(`Error: ${assignError.message}`);
          setSelecting(null);
          return;
        }
      }

      console.log("Bus seleccionado correctamente, esperando actualización...");
      
      // Esperar un momento para que la suscripción en tiempo real se actualice
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Redirigir al panel del chofer
      router.push("/chofer");
      router.refresh();
    } catch (err: any) {
      console.error("Error inesperado:", err);
      alert(`Error: ${err.message || "Intenta nuevamente"}`);
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-6">
        <p>Cargando buses disponibles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Seleccionar Bus</h1>
        <p className="text-muted-foreground">
          Elige un bus disponible para comenzar a compartir tu ubicación
        </p>
      </div>

      {buses.length === 0 ? (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold mb-2">
                No hay buses disponibles
              </h2>
              <p className="text-muted-foreground">
                Actualmente no hay buses disponibles. Contacta al administrador
                para que registre más buses.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buses.map((bus) => (
            <Card key={bus.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="w-5 h-5" />
                    Unidad {bus.unit_number}
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Disponible
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {bus.route && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ruta</p>
                    <p className="font-medium">{bus.route}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Capacidad</p>
                  <p className="font-medium">{bus.capacity} pasajeros</p>
                </div>
                {bus.schedule && (
                  <div>
                    <p className="text-sm text-muted-foreground">Horario</p>
                    <p className="font-medium">{bus.schedule}</p>
                  </div>
                )}
                <Button
                  className="w-full mt-4"
                  onClick={() => handleSelectBus(bus.id)}
                  disabled={selecting === bus.id}
                >
                  {selecting === bus.id ? "Seleccionando..." : "Seleccionar Bus"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

