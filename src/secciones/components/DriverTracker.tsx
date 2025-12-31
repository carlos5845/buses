"use client";

import { useEffect } from "react";
import { MapPin, Radio, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDriverLocation } from "@/context/DriverLocationContext";

interface DriverTrackerProps {
  busId: string;
}

export default function DriverTracker({ busId }: DriverTrackerProps) {
  const {
    isTracking,
    startTracking,
    stopTracking,
    status,
    currentLocation,
    error,
    activeBusId,
  } = useDriverLocation();

  const handleStartTracking = () => {
    startTracking(busId);
  };

  const handleStopTracking = () => {
    stopTracking();
  };

  const isTrackingOtherBus = isTracking && activeBusId !== busId;

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

      {isTrackingOtherBus && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Estás compartiendo ubicación en otro bus. Detén la transmisión
            actual para iniciar en este bus.
          </p>
        </div>
      )}

      {currentLocation && isTracking && (
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
