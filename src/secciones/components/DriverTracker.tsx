"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { MapPin, Radio, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DriverTrackerProps {
  busId: string;
}

export default function DriverTracker({ busId }: DriverTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState("Esperando...");
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isTracking) return;

    if (!navigator.geolocation) {
      setError("Geolocalización no soportada en este dispositivo");
      setIsTracking(false);
      return;
    }

    setStatus("Obteniendo ubicación...");
    setError(null);

    const watcher = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Enviar ubicación a Supabase
        const { error: insertError } = await supabase
          .from("bus_locations")
          .insert([
            {
              bus_id: busId,
              lat: latitude,
              lng: longitude,
            },
          ]);

        if (insertError) {
          console.error("Error al enviar ubicación:", insertError);
          setError(`Error: ${insertError.message}`);
          setStatus("Error al enviar ubicación");
        } else {
          setStatus(
            `Ubicación actualizada: ${latitude.toFixed(6)}, ${longitude.toFixed(
              6
            )}`
          );
          setError(null);
        }
      },
      (err) => {
        console.error("Error de geolocalización:", err);
        setError(`Error: ${err.message}`);
        setStatus("Error al obtener ubicación");
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, [isTracking, busId, supabase]);

  const handleStartTracking = () => {
    setIsTracking(true);
    setStatus("Iniciando seguimiento...");
    setError(null);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
    setStatus("Seguimiento detenido");
    setCurrentLocation(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-muted-foreground" />
          <div>
            <h2 className="font-semibold text-foreground">
              Estado de transmisión
            </h2>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
        </div>
        <Badge variant={isTracking ? "default" : "secondary"}>
          {isTracking ? "🟢 Activo" : "🔴 Inactivo"}
        </Badge>
      </div>

      {currentLocation && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-secondary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Ubicación actual
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {currentLocation.lat.toFixed(6)},{" "}
                {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {!isTracking ? (
          <button
            onClick={handleStartTracking}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Radio className="w-5 h-5" />
            Comenzar a compartir ubicación
          </button>
        ) : (
          <button
            onClick={handleStopTracking}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            Detener transmisión
          </button>
        )}
      </div>
    </div>
  );
}
