"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Location {
  lat: number;
  lng: number;
}

interface DriverLocationContextType {
  isTracking: boolean;
  startTracking: (busId: string) => void;
  stopTracking: () => void;
  status: string;
  error: string | null;
  currentLocation: Location | null;
  activeBusId: string | null;
}

const DriverLocationContext = createContext<
  DriverLocationContextType | undefined
>(undefined);

export function DriverLocationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTracking, setIsTracking] = useState(false);
  const [activeBusId, setActiveBusId] = useState<string | null>(null);
  const [status, setStatus] = useState("Esperando...");
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!isTracking || !activeBusId) return;

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
              bus_id: activeBusId,
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
  }, [isTracking, activeBusId, supabase]);

  const startTracking = (busId: string) => {
    setActiveBusId(busId);
    setIsTracking(true);
    setStatus("Iniciando seguimiento...");
    setError(null);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setActiveBusId(null);
    setStatus("Seguimiento detenido");
    setCurrentLocation(null);
  };

  return (
    <DriverLocationContext.Provider
      value={{
        isTracking,
        startTracking,
        stopTracking,
        status,
        error,
        currentLocation,
        activeBusId,
      }}
    >
      {children}
    </DriverLocationContext.Provider>
  );
}

export function useDriverLocation() {
  const context = useContext(DriverLocationContext);
  if (context === undefined) {
    throw new Error(
      "useDriverLocation must be used within a DriverLocationProvider"
    );
  }
  return context;
}
