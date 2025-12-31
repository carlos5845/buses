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

// Tiempo máximo sin actualizaciones para considerar un bus como inactivo (1 minutos)
const INACTIVE_THRESHOLD_MS = 1 * 60 * 1000;

export default function MapView() {
  const [busLocations, setBusLocations] = useState<Map<string, BusLocation>>(
    new Map()
  );
  const [busPaths, setBusPaths] = useState<Map<string, BusPath>>(new Map());

  // Umbral para considerar que una sesión de manejo ha terminado (20 minutos)
  // Si hay una brecha mayor a esto, no unimos los puntos con una línea
  const SESSION_GAP_THRESHOLD_MS = 20 * 60 * 1000;

  useEffect(() => {
    const supabase = createClient();

    // Función auxiliar para filtrar solo los puntos de la sesión actual
    const filterCurrentSessionPoints = (
      points: { lat: number; lng: number; recorded_at: string }[]
    ): [number, number][] => {
      if (points.length === 0) return [];

      // Ordenar por fecha descendente (más nuevo primero) para procesar hacia atrás
      const sortedPoints = [...points].sort(
        (a, b) =>
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );

      const currentSessionPoints: [number, number][] = [];
      let lastTime = new Date(sortedPoints[0].recorded_at).getTime();

      // Agregar el punto más reciente
      currentSessionPoints.push([sortedPoints[0].lat, sortedPoints[0].lng]);

      // Iterar hacia atrás y detenerse si encontramos un hueco grande
      for (let i = 1; i < sortedPoints.length; i++) {
        const pointTime = new Date(sortedPoints[i].recorded_at).getTime();
        const timeDiff = lastTime - pointTime;

        if (timeDiff > SESSION_GAP_THRESHOLD_MS) {
          // Se encontró una brecha grande, detenemos aquí para no unir con sesiones anteriores
          break;
        }

        currentSessionPoints.push([sortedPoints[i].lat, sortedPoints[i].lng]);
        lastTime = pointTime;
      }

      // Devolver los puntos en orden cronológico (antiguo -> nuevo) para que Leaflet dibuje bien
      return currentSessionPoints.reverse();
    };

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
          .order("recorded_at", { ascending: true }); // Orden ascendente para la lógica normal

        if (locError || !lastLocation) {
          return null;
        }

        // Filtrar puntos para obtener solo la sesión actual
        const validPathCoords = filterCurrentSessionPoints(pathLocations || []);

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
            locations: validPathCoords,
          },
        };
      });

      const results = await Promise.all(locationPromises);
      const locationsMap = new Map<string, BusLocation>();
      const pathsMap = new Map<string, BusPath>();

      results.forEach((result) => {
        if (result) {
          // Solo agregar si está activo o ha estado activo recientemente
          if (result.lastLocation.isActive) {
            locationsMap.set(result.lastLocation.bus_id, result.lastLocation);
            if (result.path.locations.length > 0) {
              pathsMap.set(result.path.bus_id, result.path);
            }
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

            // Actualizar recorrido
            setBusPaths((prev) => {
              const updated = new Map(prev);
              const existingPath = updated.get(newLocation.bus_id);

              let newLocations: [number, number][] = [];

              if (existingPath) {
                // Verificar si el último punto fue hace mucho tiempo (nueva sesión)
                const lastPointIndex = existingPath.locations.length - 1;
                // No tenemos la fecha del último punto en `locations` (solo lat,lng),
                // pero podemos inferir que si el bus ya estaba en el mapa, es parte de la sesión.
                // Sin embargo, para ser robustos, si el bus se reactiva después de horas,
                // deberíamos resetear el path.
                // Como gestionamos la limpieza con `setInterval`, si el bus desapareció y volvió,
                // el path se habrá borrado. Así que simplemente agregamos.
                newLocations = [
                  ...existingPath.locations,
                  [newLocation.lat, newLocation.lng],
                ];
              } else {
                newLocations = [[newLocation.lat, newLocation.lng]];
              }

              updated.set(newLocation.bus_id, {
                bus_id: newLocation.bus_id,
                unit_number: bus.unit_number,
                route: bus.route,
                capacity: bus.capacity,
                locations: newLocations,
              });

              return updated;
            });
          }
        }
      )
      .subscribe();

    // Verificar periódicamente qué buses están inactivos
    const checkInactiveBuses = setInterval(() => {
      const now = Date.now();
      let locationsUpdated = false;
      let pathsUpdated = false;

      // Usamos los setters con función para acceder al estado más reciente
      setBusLocations((prevLocations) => {
        const nextLocations = new Map(prevLocations);
        const busesToRemove: string[] = [];

        nextLocations.forEach((location, busId) => {
          const lastUpdateTime = new Date(location.recorded_at).getTime();
          const timeSinceUpdate = now - lastUpdateTime;

          if (timeSinceUpdate >= INACTIVE_THRESHOLD_MS) {
            busesToRemove.push(busId);
          }
        });

        if (busesToRemove.length > 0) {
          locationsUpdated = true;
          busesToRemove.forEach((id) => nextLocations.delete(id));

          // Si borramos locations, TAMBIÉN borramos paths
          if (locationsUpdated) {
            setBusPaths((prevPaths) => {
              const nextPaths = new Map(prevPaths);
              busesToRemove.forEach((id) => nextPaths.delete(id));
              return nextPaths;
            });
          }
        }

        return locationsUpdated ? nextLocations : prevLocations;
      });
    }, 5000); // Verificar cada 5 segundos (más frecuente para mejor UX)

    return () => {
      supabase.removeChannel(channel);
      clearInterval(checkInactiveBuses);
    };
  }, []);

  return (
    <div className="h-[80vh] w-full relative z-10">
      <MapContainer
        center={[-15.8402, -70.0219]} // Lima como centro inicial
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
        {Array.from(busLocations.values()).map((location) => {
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
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">🚌 Bus</span>
                    <span className="font-medium">{location.unit_number}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">📍 Ruta</span>
                    <span className="font-medium">
                      {location.route || "No asignada"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">👥 Capacidad</span>
                    <span className="font-medium">{location.capacity}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">🕐 Actualizado</span>
                    <span className="font-medium">
                      {new Date(location.recorded_at).toLocaleTimeString()}
                    </span>
                  </div>

                  {minutesAgo > 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      ({minutesAgo} min atrás)
                    </p>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">📍 Puntos</span>
                    <span className="font-medium">
                      {path?.locations.length || 0}
                    </span>
                  </div>

                  <div className="pt-2 text-xs text-green-600 font-semibold text-right">
                    🟢 Activo
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
