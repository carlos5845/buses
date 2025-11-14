"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MapView from "./mapview";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type ActiveBus = {
  id: string;
  unit_number: string;
  route: string | null;
  capacity: number;
  isActive: boolean;
  lastUpdate: string;
};

export default function Content() {
  const [activeBuses, setActiveBuses] = useState<ActiveBus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchActiveBuses = async () => {
      // Obtener todos los buses con chofer asignado
      const { data: buses, error } = await supabase
        .from("buses")
        .select("id, unit_number, route, capacity, driver_id, updated_at")
        .not("driver_id", "is", null)
        .order("unit_number", { ascending: true });

      if (error) {
        console.error("Error cargando buses:", error);
        setLoading(false);
        return;
      }

      if (!buses || buses.length === 0) {
        setActiveBuses([]);
        setLoading(false);
        return;
      }

      // Obtener la última ubicación de cada bus para determinar si está activo
      const INACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutos
      const now = Date.now();

      const busPromises = buses.map(async (bus) => {
        const { data: lastLocation } = await supabase
          .from("bus_locations")
          .select("recorded_at")
          .eq("bus_id", bus.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        const lastUpdateTime = lastLocation
          ? new Date(lastLocation.recorded_at).getTime()
          : 0;
        const isActive = now - lastUpdateTime < INACTIVE_THRESHOLD_MS;

        return {
          id: bus.id,
          unit_number: bus.unit_number,
          route: bus.route,
          capacity: bus.capacity,
          isActive,
          lastUpdate: lastLocation?.recorded_at || bus.updated_at || "",
        };
      });

      const busesWithStatus = await Promise.all(busPromises);
      setActiveBuses(busesWithStatus);
      setLoading(false);
    };

    fetchActiveBuses();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("active-buses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "buses",
        },
        () => {
          fetchActiveBuses();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bus_locations",
        },
        () => {
          fetchActiveBuses();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${Math.floor(diffHours / 24)}d`;
  };

  return (
    <section className="relative overflow-hidden max-w-7xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl mt-8 mr-auto ml-auto w-full shadow-xl">
      {/* Contenedor principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl w-full">
        {/* Mapa - Ocupa 3 columnas en pantallas grandes */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
          <MapView />
        </div>

        {/* Panel lateral - Buses activos */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Buses Activos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loading
                  ? "Cargando..."
                  : `${activeBuses.length} bus${
                      activeBuses.length !== 1 ? "es" : ""
                    } en ruta`}
              </p>
            </div>

            <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Cargando buses...
                </div>
              ) : activeBuses.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay buses activos en este momento
                    </p>
                  </CardContent>
                </Card>
              ) : (
                activeBuses.map((bus) => (
                  <Card
                    key={bus.id}
                    className="hover:shadow-md transition-shadow border-l-4"
                    style={{
                      borderLeftColor: bus.isActive
                        ? "rgb(34, 197, 94)"
                        : "rgb(156, 163, 175)",
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bus {bus.unit_number}
                          </CardTitle>
                          {bus.route && (
                            <CardDescription className="mt-1 text-sm">
                              Ruta: {bus.route}
                            </CardDescription>
                          )}
                        </div>
                        <Badge
                          variant={bus.isActive ? "default" : "secondary"}
                          className={
                            bus.isActive
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-400"
                          }
                        >
                          {bus.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Capacidad: {bus.capacity} pasajeros</span>
                        <span className="font-medium">
                          {formatTimeAgo(bus.lastUpdate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
