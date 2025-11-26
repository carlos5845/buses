"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Bus, Loader2, MapPin, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewBusPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitNumber, setUnitNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [route, setRoute] = useState("");
  const [schedule, setSchedule] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/Auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
      setLoading(false);
    };

    checkAdmin();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      alert("Solo los administradores pueden registrar buses.");
      return;
    }

    setSubmitting(true);

    const supabase = createClient();

    try {
      // Insertar el bus como disponible (sin chofer asignado)
      const { error } = await supabase.from("buses").insert({
        driver_id: null, // Sin chofer asignado inicialmente
        unit_number: unitNumber,
        capacity: Number(capacity),
        route: route || null,
        schedule: schedule || null,
        is_available: true, // Disponible para que los choferes lo escojan
      });

      if (error) {
        console.error("Error al registrar bus:", error);
        alert(`Error al registrar bus: ${error.message}`);
      } else {
        alert("Bus registrado correctamente ✅");
        router.push("/admin/buses");
      }
    } catch (err: unknown) {
      console.error("Error inesperado:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Intenta nuevamente";
      alert(`Error inesperado: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-destructive mb-2">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground">
                Solo los administradores pueden registrar buses. Si eres un
                chofer, puedes seleccionar un bus disponible desde tu panel.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="  flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg border border-gray-200 dark:border-gray-800">
        <CardHeader className="space-y-3 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-lg">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                Registrar Nuevo Bus
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                Complete la información de la nueva unidad
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Número de unidad */}
            <div className="space-y-2">
              <Label
                htmlFor="unitNumber"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <Bus className="w-4 h-4 text-gray-500" />
                Número de unidad
              </Label>
              <Input
                id="unitNumber"
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="Ej: A-101"
                required
                className="h-11 border-gray-300 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Código único de identificación del bus
              </p>
            </div>

            {/* Ruta */}
            <div className="space-y-2">
              <Label
                htmlFor="route"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-500" />
                Ruta
              </Label>
              <Input
                id="route"
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="Ej: Centro - Universidad"
                required
                className="h-11 border-gray-300 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recorrido asignado a la unidad
              </p>
            </div>

            {/* Grid para capacidad y horario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Capacidad */}
              <div className="space-y-2">
                <Label
                  htmlFor="capacity"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-gray-500" />
                  Capacidad
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="45"
                  required
                  min="1"
                  className="h-11 border-gray-300 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Número de pasajeros
                </p>
              </div>

              {/* Horario */}
              <div className="space-y-2">
                <Label
                  htmlFor="schedule"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-gray-500" />
                  Horario
                </Label>
                <Input
                  id="schedule"
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="6:00 AM - 10:00 PM"
                  className="h-11 border-gray-300 dark:border-gray-700 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 dark:focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Horario de operación
                </p>
              </div>
            </div>

            {/* Botón de submit */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Bus className="w-4 h-4" />
                    Registrar Bus
                  </span>
                )}
              </Button>
            </div>

            {/* Información adicional */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Los campos marcados son obligatorios. La información se guardará
                en el sistema inmediatamente.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
