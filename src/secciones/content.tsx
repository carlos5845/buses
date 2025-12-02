"use client";

import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MapPin, Users, Clock } from "lucide-react";
import { RollingText } from "@/components/animate-ui/primitives/texts/rolling";

const MapView = dynamic(() => import("./mapview"), { ssr: false });
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
    <section className="relative overflow-hidden w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border border-gray-200 dark:border-gray-800 rounded-3xl mt-2 shadow-xl">
      {/* Contenedor principal */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 w-full">
        {/* Mapa - Ocupa todas las columnas en móvil, 3 en desktop */}
        <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
          <MapView />
        </div>

        {/* Panel lateral - Buses activos */}
        <div className="lg:col-span-1 space-y-4">
          <div className="sticky top-6">
            <div className="mb-4">
              <RollingText
                className="text-2xl sm:text-3xl font-semibold"
                text="Buses En Ruta"
              />
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
                    className="hover:shadow-md transition-shadow border-l-2 gap-3 dark:bg-gray-900 bg-white"
                    style={{
                      borderLeftColor: bus.isActive
                        ? "rgb(34, 197, 94)"
                        : "rgb(156, 163, 175)",
                    }}
                  >
                    {/* Header */}
                    <div className="px-4 pb-0">
                      {" "}
                      {/* antes pb-3 */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bus - {bus.unit_number}
                          </h3>
                        </div>

                        {/* Badge */}
                        <div
                          className={`flex items-center gap-1.5 border h-6 shadow-none px-2 rounded-md text-xs
        ${
          bus.isActive
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-600 dark:text-slate-300 dark:border-slate-600"
        }`}
                        >
                          <span className="relative flex h-2 w-2">
                            {bus.isActive && (
                              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-pulse"></span>
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-2 w-2 ${
                                bus.isActive
                                  ? "bg-green-600"
                                  : "bg-slate-400 dark:bg-slate-500"
                              }`}
                            ></span>
                          </span>

                          {bus.isActive ? "Activo" : "Inactivo"}
                        </div>
                      </div>
                      {bus.route && (
                        <div className="flex items-center gap-2 mt-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-100 dark:border-slate-700 w-full">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span
                            className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-full"
                            title={bus.route}
                          >
                            {bus.route}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-2 ">
                      {" "}
                      {/* antes pt-0 */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Capacidad: {bus.capacity}
                          </span>
                        </div>

                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />

                          {formatTimeAgo(bus.lastUpdate)}
                        </span>
                      </div>
                    </div>
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
