"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// 🔹 Fix de iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Tipo de bus (ajustado a tu tabla "buses")
type Bus = {
  id: string;
  unit_number: string;
  route: string | null;
  capacity: number;
  location_lat: number | null;
  location_lng: number | null;
};

export default function MapView() {
  const [buses, setBuses] = useState<Bus[]>([]);

  useEffect(() => {
    const supabase = createClient();

    // 🔹 Obtener los buses desde la tabla
    const fetchBuses = async () => {
      const { data, error } = await supabase
        .from("buses")
        .select("id, unit_number, route, capacity, location_lat, location_lng");

      if (error) {
        console.error("Error al obtener buses:", error.message);
      } else {
        setBuses(data || []);
      }
    };

    fetchBuses();

    // 🔹 Escuchar cambios en tiempo real (INSERT, UPDATE)
    const channel = supabase
      .channel("buses-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "buses" },
        (payload) => {
          console.log("Cambio detectado:", payload);
          fetchBuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="h-[80vh] w-full">
      <MapContainer
        center={[-15.84, -70.02]} // 🔹 centro inicial (Puno, ejemplo)
        zoom={14}
        className="h-full w-full rounded-xl shadow-lg"
      >
        {/* Capa base de OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Marcadores de buses */}
        {buses.map((bus) =>
          bus.location_lat && bus.location_lng ? (
            <Marker
              key={bus.id}
              position={[bus.location_lat, bus.location_lng]}
            >
              <Popup>
                <div>
                  <strong>Bus:</strong> {bus.unit_number} <br />
                  <strong>Ruta:</strong> {bus.route || "No asignada"} <br />
                  <strong>Capacidad:</strong> {bus.capacity}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}
