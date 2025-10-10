"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const fetchBuses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/Auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("buses")
      .select("*")
      .eq("driver_id", user.id);

    if (error) {
      console.error("Error cargando buses:", error.message);
    } else {
      setBuses(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este bus?")) return;

    const { error } = await supabase.from("buses").delete().eq("id", id);

    if (error) {
      console.error("Error eliminando bus:", error.message);
    } else {
      setBuses(buses.filter((bus) => bus.id !== id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-muted">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Buses</h1>
        <Button onClick={() => router.push("/chofer/bus/new")}>
          Registrar Bus
        </Button>
      </div>

      {loading ? (
        <p>Cargando buses...</p>
      ) : buses.length === 0 ? (
        <p>No tienes buses registrados todavía.</p>
      ) : (
        <div className="space-y-4">
          {buses.map((bus) => (
            <Card key={bus.id}>
              <CardHeader>
                <CardTitle>Unidad {bus.unit_number}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Ruta:</strong> {bus.route}
                </p>
                <p>
                  <strong>Capacidad:</strong> {bus.capacity}
                </p>
                <p>
                  <strong>Horario:</strong> {bus.schedule || "No definido"}
                </p>

                <div className="flex gap-3 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/chofer/bus/${bus.id}/edit`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(bus.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
