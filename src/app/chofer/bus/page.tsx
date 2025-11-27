"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Route, Users, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

interface Bus {
  id: string;
  unit_number: string;
  route: string | null;
  capacity: number;
  driver_id: string | null;
  is_available: boolean;
  schedule?: string | null;
  [key: string]: unknown;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-4xl  mt-2 p-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bus className="h-6 w-6 text-blue-600" />
          Mi Bus
        </h1>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <LoadingSpinner text="Cargando tus buses..." />
      ) : buses.length === 0 ? (
        <p className="text-gray-600">No tienes buses registrados todavía.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {buses.map((bus) => (
            <Card
              key={bus.id}
              className="border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition rounded-xl gap-3"
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-2xl font-semibold">
                  <Bus className="h-5 w-5 text-blue-500" />
                  Unidad {bus.unit_number}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-2 text-gray-700 dark:text-gray-300 text-xl">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-gray-500" />
                  <p>
                    <strong>Ruta:</strong> {bus.route || "No definida"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p>
                    <strong>Capacidad:</strong> {bus.capacity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <p>
                    <strong>Horario:</strong> {bus.schedule || "No definido"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
