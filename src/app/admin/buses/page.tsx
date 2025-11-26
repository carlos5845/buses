"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bus, User, X } from "lucide-react";
import Link from "next/link";

type BusWithDriver = {
  id: string;
  unit_number: string;
  route: string | null;
  capacity: number;
  schedule: string | null;
  is_available: boolean;
  driver_id: string | null;
  driver_email?: string;
};

export default function AdminBusesPage() {
  const [buses, setBuses] = useState<BusWithDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminAndFetchBuses();
  }, []);

  const checkAdminAndFetchBuses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/Auth/login");
      return;
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    await fetchBuses();
  };

  const fetchBuses = async () => {
    // Obtener todos los buses con información del chofer si está asignado
    const { data, error } = await supabase
      .from("buses")
      .select(
        "id, unit_number, route, capacity, schedule, is_available, driver_id"
      )
      .order("unit_number", { ascending: true });

    if (error) {
      console.error("Error cargando buses:", error);
      alert(`Error: ${error.message}`);
      return;
    }

    // Obtener información de los choferes asignados
    if (data) {
      const driverIds = data
        .filter((bus) => bus.driver_id)
        .map((bus) => bus.driver_id)
        .filter((id): id is string => id !== null);

      let driverEmails: Record<string, string> = {};

      if (driverIds.length > 0) {
        // Intentar obtener emails usando la función RPC si está disponible
        // Si no funciona, usar el ID como fallback
        try {
          const emailPromises = driverIds.map(async (id) => {
            const { data, error } = await supabase.rpc("get_driver_email", {
              driver_id: id,
            });
            return [id, data || `ID: ${id.substring(0, 8)}...`] as [
              string,
              string
            ];
          });

          const emailResults = await Promise.all(emailPromises);
          driverEmails = Object.fromEntries(emailResults);
        } catch (err) {
          // Fallback: usar IDs si la función RPC no está disponible
          driverEmails = Object.fromEntries(
            driverIds.map((id) => [id, `ID: ${id.substring(0, 8)}...`])
          );
        }
      }

      const busesWithDrivers: BusWithDriver[] = data.map((bus) => ({
        ...bus,
        driver_email: bus.driver_id ? driverEmails[bus.driver_id] : undefined,
      }));

      setBuses(busesWithDrivers);
    }

    setLoading(false);
  };

  const handleUnassignBus = async (busId: string) => {
    if (!confirm("¿Seguro que deseas desasignar este bus?")) return;

    const { error } = await supabase
      .from("buses")
      .update({
        driver_id: null,
        is_available: true,
      })
      .eq("id", busId);

    if (error) {
      console.error("Error al desasignar bus:", error);
      alert(`Error: ${error.message}`);
    } else {
      alert("Bus desasignado correctamente ✅");
      fetchBuses();
    }
  };

  const handleResetAll = async () => {
    if (
      !confirm(
        "¿Estás seguro? Esto desasignará TODOS los buses de TODOS los choferes. Esta acción no se puede deshacer."
      )
    )
      return;

    // Resetear todos los buses asignados
    // Primero obtener todos los buses con driver_id
    const { data: assignedBuses, error: fetchError } = await supabase
      .from("buses")
      .select("id")
      .not("driver_id", "is", null);

    if (fetchError) {
      console.error("Error al obtener buses asignados:", fetchError);
      alert(`Error: ${fetchError.message}`);
      return;
    }

    if (!assignedBuses || assignedBuses.length === 0) {
      alert("No hay buses asignados para liberar.");
      return;
    }

    // Actualizar todos los buses asignados
    const { error } = await supabase
      .from("buses")
      .update({
        driver_id: null,
        is_available: true,
      })
      .in(
        "id",
        assignedBuses.map((b) => b.id)
      );

    if (error) {
      console.error("Error al resetear buses:", error);
      alert(`Error: ${error.message}`);
    } else {
      alert("Todos los buses han sido liberados ✅");
      fetchBuses();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <p>Cargando...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-6">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-destructive mb-2">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground">
                Solo los administradores pueden acceder a esta página.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const assignedBuses = buses.filter((bus) => bus.driver_id);
  const availableBuses = buses.filter((bus) => !bus.driver_id);

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Buses</h1>
          <p className="text-muted-foreground">
            Administra las asignaciones de buses a los choferes
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/chofer/bus/new">
            <Button>Registrar Nuevo Bus</Button>
          </Link>
          {assignedBuses.length > 0 && (
            <Button variant="destructive" onClick={handleResetAll}>
              Liberar Todos los Buses
            </Button>
          )}
        </div>
      </div>

      {/* Buses Asignados */}
      {assignedBuses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Buses Asignados ({assignedBuses.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedBuses.map((bus) => (
              <Card key={bus.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="w-5 h-5" />
                      Unidad {bus.unit_number}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700"
                    >
                      Asignado
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bus.route && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ruta</p>
                      <p className="font-medium">{bus.route}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <p className="font-medium">{bus.capacity} pasajeros</p>
                  </div>
                  {bus.driver_email && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Chofer
                      </p>
                      <p className="font-medium text-sm">{bus.driver_email}</p>
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => handleUnassignBus(bus.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Desasignar Bus
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Buses Disponibles */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Buses Disponibles ({availableBuses.length})
        </h2>
        {availableBuses.length === 0 ? (
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold mb-2">
                  No hay buses disponibles
                </h3>
                <p className="text-muted-foreground">
                  Todos los buses están asignados. Desasigna algunos para que
                  los choferes puedan seleccionarlos.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableBuses.map((bus) => (
              <Card key={bus.id} className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="w-5 h-5" />
                      Unidad {bus.unit_number}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Disponible
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bus.route && (
                    <div>
                      <p className="text-sm text-muted-foreground">Ruta</p>
                      <p className="font-medium">{bus.route}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Capacidad</p>
                    <p className="font-medium">{bus.capacity} pasajeros</p>
                  </div>
                  {bus.schedule && (
                    <div>
                      <p className="text-sm text-muted-foreground">Horario</p>
                      <p className="font-medium">{bus.schedule}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
