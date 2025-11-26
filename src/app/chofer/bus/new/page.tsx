"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

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
        router.push("/chofer/bus"); // volver al listado
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
    <div className="max-w-lg mx-auto mt-10 p-6 bg-muted shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Registrar nuevo bus</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="unitNumber">Número de unidad</Label>
          <Input
            id="unitNumber"
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="route">Ruta</Label>
          <Input
            id="route"
            type="text"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="capacity">Capacidad</Label>
          <Input
            id="capacity"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="schedule">Horario</Label>
          <Input
            id="schedule"
            type="text"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Guardando..." : "Registrar Bus"}
        </Button>
      </form>
    </div>
  );
}
