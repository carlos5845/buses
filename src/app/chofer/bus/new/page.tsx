"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewBusPage() {
  const [unitNumber, setUnitNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [route, setRoute] = useState("");
  const [schedule, setSchedule] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión como chofer.");
      return;
    }

    const { error } = await supabase.from("buses").insert({
      driver_id: user.id,
      unit_number: unitNumber,
      capacity: Number(capacity),
      route,
      schedule,
    });

    if (error) {
      console.error("Error al registrar bus:", error.message);
      alert("Hubo un error al registrar el bus");
    } else {
      alert("Bus registrado correctamente ✅");
      router.push("/chofer/bus"); // volver al listado
    }

    setLoading(false);
  };

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

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Guardando..." : "Registrar Bus"}
        </Button>
      </form>
    </div>
  );
}
