"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bus, Route, Users, Clock } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function EditBusPageAdmin() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    unit_number: "",
    route: "",
    capacity: "",
    schedule: "",
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/Auth/login");
        return;
      }

      // Verificar si es admin
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileData?.role !== "admin") {
        setIsAdmin(false);
        return;
      }

      setIsAdmin(true);

      // Obtener datos del bus
      const { data: busData, error } = await supabase
        .from("buses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando bus:", error.message);
        return;
      }

      setForm({
        unit_number: busData.unit_number,
        route: busData.route || "",
        capacity: busData.capacity?.toString() || "",
        schedule: busData.schedule || "",
      });

      setLoading(false);
    };

    if (id) fetchData();
  }, [id, supabase, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("buses")
      .update({
        unit_number: form.unit_number,
        route: form.route,
        capacity: Number(form.capacity),
        schedule: form.schedule,
      })
      .eq("id", id);

    if (error) {
      console.error("Error actualizando bus:", error.message);
      alert("Error al actualizar el bus");
    } else {
      alert("Bus actualizado correctamente ✅");
      router.push("/admin/buses");
    }
  };

  if (isAdmin === null) {
    return <LoadingSpinner text="Verificando permisos..." />;
  }

  if (!isAdmin) {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  if (loading) return <LoadingSpinner text="Cargando datos del bus..." />;

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 p-6 sm:p-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Editar Bus
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Número de unidad */}
        <div className="space-y-1">
          <Label className="font-medium text-gray-700 dark:text-gray-300">
            Número de unidad
          </Label>
          <div className="relative">
            <Bus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="unit_number"
              value={form.unit_number}
              onChange={handleChange}
              required
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Ruta */}
        <div className="space-y-1">
          <Label className="font-medium text-gray-700 dark:text-gray-300">
            Ruta
          </Label>
          <div className="relative">
            <Route className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="route"
              value={form.route}
              onChange={handleChange}
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Capacidad */}
        <div className="space-y-1">
          <Label className="font-medium text-gray-700 dark:text-gray-300">
            Capacidad
          </Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              required
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Horario */}
        <div className="space-y-1">
          <Label className="font-medium text-gray-700 dark:text-gray-300">
            Horario
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              className="h-11 pl-10"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="md:col-span-2">
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold rounded-lg"
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
