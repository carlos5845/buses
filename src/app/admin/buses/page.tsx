"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bus,
  Map,
  Users,
  User,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/loading-spinner";

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

  const handleDeleteBus = async (busId: string) => {
    if (
      !confirm(
        "¿Estás seguro que deseas eliminar este bus? Esta acción no se puede deshacer."
      )
    )
      return;

    const { error } = await supabase.from("buses").delete().eq("id", busId);

    if (error) {
      console.error("Error al eliminar bus:", error);
      alert(`Error: ${error.message}`);
    } else {
      alert("Bus eliminado correctamente ✅");
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
        <LoadingSpinner text="Cargando gestión de buses..." />
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gestión de Buses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra las asignaciones de buses a los choferes
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/chofer/bus/new">
            <Button className="bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800 dark:text-white">
              Registrar Nuevo Bus
            </Button>
          </Link>
          {assignedBuses.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleResetAll}
              className="dark:bg-red-700 dark:hover:bg-red-800"
            >
              Liberar Todos los Buses
            </Button>
          )}
        </div>
      </div>

      {/* Buses Asignados */}
      {assignedBuses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Buses Asignados ({assignedBuses.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assignedBuses.map((bus) => (
              <Card
                key={bus.id}
                className="border border-orange-200 dark:border-orange-900/50 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Bus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      Unidad {bus.unit_number}
                    </CardTitle>

                    <Badge className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800 px-3 py-1 rounded-full">
                      Asignado
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {bus.route && (
                    <div className="flex items-start gap-3">
                      <Map className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ruta
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bus.route}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Capacidad
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {bus.capacity} pasajeros
                      </p>
                    </div>
                  </div>

                  {bus.driver_email && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Chofer
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bus.driver_email}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center gap-2 dark:border-gray-600"
                      onClick={() => router.push(`/admin/buses/${bus.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center justify-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
                      onClick={() => handleUnassignBus(bus.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Desasignar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Buses Disponibles */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Buses Disponibles ({availableBuses.length})
        </h2>
        {availableBuses.length === 0 ? (
          <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  No hay buses disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Todos los buses están asignados. Desasigna algunos para que
                  los choferes puedan seleccionarlos.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableBuses.map((bus) => (
              <Card
                key={bus.id}
                className="border border-green-200 dark:border-green-900/50 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <Bus className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Unidad {bus.unit_number}
                    </CardTitle>

                    <Badge className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800 px-3 py-1 rounded-full">
                      Disponible
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {bus.route && (
                    <div className="flex items-start gap-3">
                      <Map className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ruta
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bus.route}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Capacidad
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {bus.capacity} pasajeros
                      </p>
                    </div>
                  </div>

                  {bus.schedule && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Horario
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {bus.schedule}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center justify-center gap-2 dark:border-gray-600"
                      onClick={() => router.push(`/admin/buses/${bus.id}/edit`)}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center justify-center gap-2 dark:bg-red-700 dark:hover:bg-red-800"
                      onClick={() => handleDeleteBus(bus.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
