"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// 🔹 Fix de iconos de Leaflet en Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Tipo para la ubicación de un bus
type BusLocation = {
  bus_id: string;
  lat: number;
  lng: number;
  unit_number: string;
  route: string | null;
  capacity: number;
  recorded_at: string;
  isActive: boolean; // Indica si el bus está activo (enviando ubicaciones)
};

// Tipo para el recorrido completo de un bus
type BusPath = {
  bus_id: string;
  unit_number: string;
  route: string | null;
  capacity: number;
  locations: Array<[number, number]>; // Array de [lat, lng] en orden cronológico
};

// Tiempo máximo sin actualizaciones para considerar un bus como inactivo (5 minutos)
const INACTIVE_THRESHOLD_MS = 5 * 60 * 1000;

export default function MapView() {
  const [busLocations, setBusLocations] = useState<Map<string, BusLocation>>(
    new Map()
  );
  const [busPaths, setBusPaths] = useState<Map<string, BusPath>>(new Map());

  useEffect(() => {
    const supabase = createClient();

    // 🔹 Obtener buses con sus últimas ubicaciones y recorridos
    const fetchBusLocations = async () => {
      // Obtener todos los buses
      const { data: buses, error: busesError } = await supabase
        .from("buses")
        .select("id, unit_number, route, capacity");

      if (busesError) {
        console.error("Error al obtener buses:", busesError.message);
        return;
      }

      if (!buses || buses.length === 0) return;

      // Obtener la última ubicación y el recorrido completo de cada bus
      const locationPromises = buses.map(async (bus) => {
        // Última ubicación
        const { data: lastLocation, error: locError } = await supabase
          .from("bus_locations")
          .select("lat, lng, recorded_at")
          .eq("bus_id", bus.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .single();

        // Recorrido completo del día (últimas 24 horas)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: pathLocations } = await supabase
          .from("bus_locations")
          .select("lat, lng, recorded_at")
          .eq("bus_id", bus.id)
          .gte("recorded_at", today.toISOString())
          .order("recorded_at", { ascending: true });

        if (locError || !lastLocation) {
          return null;
        }

        // Crear array de coordenadas para el recorrido en orden cronológico
        // Leaflet espera [lat, lng]
        const pathCoords: Array<[number, number]> =
          pathLocations?.map((loc) => [loc.lat, loc.lng]) || [];

        // Verificar si el bus está activo (última actualización reciente)
        const lastUpdateTime = new Date(lastLocation.recorded_at).getTime();
        const now = Date.now();
        const isActive = now - lastUpdateTime < INACTIVE_THRESHOLD_MS;

        return {
          lastLocation: {
            bus_id: bus.id,
            lat: lastLocation.lat,
            lng: lastLocation.lng,
            unit_number: bus.unit_number,
            route: bus.route,
            capacity: bus.capacity,
            recorded_at: lastLocation.recorded_at,
            isActive,
          },
          path: {
            bus_id: bus.id,
            unit_number: bus.unit_number,
            route: bus.route,
            capacity: bus.capacity,
            locations: pathCoords,
          },
        };
      });

      const results = await Promise.all(locationPromises);
      const locationsMap = new Map<string, BusLocation>();
      const pathsMap = new Map<string, BusPath>();

      results.forEach((result) => {
        if (result) {
          locationsMap.set(result.lastLocation.bus_id, result.lastLocation);
          if (result.path.locations.length > 0) {
            pathsMap.set(result.path.bus_id, result.path);
          }
        }
      });

      setBusLocations(locationsMap);
      setBusPaths(pathsMap);
    };

    fetchBusLocations();

    // 🔹 Escuchar cambios en tiempo real de bus_locations
    const channel = supabase
      .channel("bus-locations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bus_locations",
        },
        async (payload) => {
          console.log("Nueva ubicación recibida:", payload.new);

          const newLocation = payload.new as {
            bus_id: string;
            lat: number;
            lng: number;
            recorded_at: string;
          };

          // Obtener información del bus
          const { data: bus } = await supabase
            .from("buses")
            .select("unit_number, route, capacity")
            .eq("id", newLocation.bus_id)
            .single();

          if (bus) {
            const busLocation: BusLocation = {
              bus_id: newLocation.bus_id,
              lat: newLocation.lat,
              lng: newLocation.lng,
              unit_number: bus.unit_number,
              route: bus.route,
              capacity: bus.capacity,
              recorded_at: newLocation.recorded_at,
              isActive: true, // Siempre activo cuando recibimos una nueva ubicación
            };

            // Actualizar última ubicación
            setBusLocations((prev) => {
              const updated = new Map(prev);
              updated.set(newLocation.bus_id, busLocation);
              return updated;
            });

            // Actualizar recorrido agregando la nueva ubicación al final (orden cronológico)
            setBusPaths((prev) => {
              const updated = new Map(prev);
              const existingPath = updated.get(newLocation.bus_id);

              if (existingPath) {
                // Crear nuevo array con la nueva ubicación al final para mantener el orden
                const newLocations: Array<[number, number]> = [
                  ...existingPath.locations,
                  [newLocation.lat, newLocation.lng] as [number, number],
                ];
                updated.set(newLocation.bus_id, {
                  ...existingPath,
                  locations: newLocations,
                });
              } else {
                // Crear nuevo recorrido
                updated.set(newLocation.bus_id, {
                  bus_id: newLocation.bus_id,
                  unit_number: bus.unit_number,
                  route: bus.route,
                  capacity: bus.capacity,
                  locations: [[newLocation.lat, newLocation.lng]],
                });
              }

              return updated;
            });
          }
        }
      )
      .subscribe();

    // Verificar periódicamente qué buses están inactivos
    const checkInactiveBuses = setInterval(() => {
      setBusLocations((prev) => {
        const updated = new Map(prev);
        const now = Date.now();

        prev.forEach((location, busId) => {
          const lastUpdateTime = new Date(location.recorded_at).getTime();
          const timeSinceUpdate = now - lastUpdateTime;

          if (timeSinceUpdate >= INACTIVE_THRESHOLD_MS) {
            // Marcar como inactivo o eliminar
            updated.delete(busId);

            // También limpiar el recorrido del bus inactivo
            setBusPaths((prevPaths) => {
              const updatedPaths = new Map(prevPaths);
              updatedPaths.delete(busId);
              return updatedPaths;
            });
          }
        });

        return updated;
      });
    }, 30000); // Verificar cada 30 segundos

    return () => {
      supabase.removeChannel(channel);
      clearInterval(checkInactiveBuses);
    };
  }, []);

  return (
    <div className="h-[80vh] w-full relative z-10">
      <MapContainer
        center={[-12.0464, -77.0428]} // Lima como centro inicial
        zoom={13}
        className="h-full w-full rounded-xl shadow-lg"
      >
        {/* Capa base de OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Recorridos de buses (líneas) */}
        {Array.from(busPaths.values()).map((path) => {
          if (path.locations.length < 2) return null; // Necesitamos al menos 2 puntos para una línea

          // Colores diferentes por bus (hash del bus_id)
          const colors = [
            "#FF0000",
            "#0000FF",
            "#00FF00",
            "#FF00FF",
            "#00FFFF",
            "#FFFF00",
            "#FFA500",
            "#800080",
          ];
          const colorIndex =
            parseInt(path.bus_id.replace(/-/g, "").substring(0, 8), 16) %
            colors.length;
          const pathColor = colors[colorIndex];

          return (
            <Polyline
              key={`path-${path.bus_id}`}
              positions={path.locations}
              color={pathColor}
              weight={4}
              opacity={0.7}
            />
          );
        })}

        {/* Marcadores de buses en tiempo real - Solo mostrar buses activos */}
        {Array.from(busLocations.values())
          .filter((location) => {
            // Filtrar solo buses activos (con actualizaciones recientes)
            const lastUpdateTime = new Date(location.recorded_at).getTime();
            const now = Date.now();
            return now - lastUpdateTime < INACTIVE_THRESHOLD_MS;
          })
          .map((location) => {
            // Color del marcador basado en el bus_id
            const colors = [
              "#FF0000",
              "#0000FF",
              "#00FF00",
              "#FF00FF",
              "#00FFFF",
              "#FFFF00",
              "#FFA500",
              "#800080",
            ];
            const colorIndex =
              parseInt(location.bus_id.replace(/-/g, "").substring(0, 8), 16) %
              colors.length;
            const markerColor = colors[colorIndex];

            // Crear icono personalizado con color
            const customIcon = L.divIcon({
              className: "custom-bus-marker",
              html: `<div style="
                background-color: ${markerColor};
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              "></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            });

            const path = busPaths.get(location.bus_id);
            const timeSinceUpdate =
              Date.now() - new Date(location.recorded_at).getTime();
            const minutesAgo = Math.floor(timeSinceUpdate / 60000);

            return (
              <Marker
                key={location.bus_id}
                position={[location.lat, location.lng]}
                icon={customIcon}
              >
                <Popup>
                  <div>
                    <strong>🚌 Bus:</strong> {location.unit_number} <br />
                    <strong>📍 Ruta:</strong> {location.route || "No asignada"}{" "}
                    <br />
                    <strong>👥 Capacidad:</strong> {location.capacity} <br />
                    <strong>🕐 Última actualización:</strong>{" "}
                    {new Date(location.recorded_at).toLocaleTimeString()}
                    {minutesAgo > 0 && (
                      <>
                        <br />
                        <span className="text-xs text-muted-foreground">
                          ({minutesAgo} min. atrás)
                        </span>
                      </>
                    )}
                    <br />
                    <strong>📍 Puntos registrados:</strong>{" "}
                    {path?.locations.length || 0}
                    <br />
                    <span className="text-xs text-green-600 font-semibold">
                      🟢 Activo
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
