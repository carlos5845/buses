"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function EditBusPage() {
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
  const [isAdmin, setIsAdmin] = useState(false);

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
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/chofer/bus");
        return;
      }

      setIsAdmin(true);

      // Obtener datos del bus
      const { data, error } = await supabase
        .from("buses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error cargando bus:", error.message);
        return;
      }

      setForm({
        unit_number: data.unit_number,
        route: data.route || "",
        capacity: data.capacity?.toString() || "",
        schedule: data.schedule || "",
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
    } else {
      router.push("/admin/buses");
    }
  };

  if (!isAdmin) {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  if (loading) return <LoadingSpinner text="Cargando datos del bus..." />;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Editar Bus</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Número de unidad</Label>
          <Input
            name="unit_number"
            value={form.unit_number}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Ruta</Label>
          <Input name="route" value={form.route} onChange={handleChange} />
        </div>
        <div>
          <Label>Capacidad</Label>
          <Input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Horario</Label>
          <Input
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
          />
        </div>

        <Button type="submit" className="w-full">
          Guardar cambios
        </Button>
      </form>
    </div>
  );
}
