"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Bus {
  id?: string;
  numero_unidad?: string;
  ruta_asignada?: string;
  capacidad?: string;
  horario?: string;
}

interface BusFormProps {
  userId: string;
  bus?: Bus;
}

export default function BusForm({ userId, bus }: BusFormProps) {
  const supabase = createClient();

  const [form, setForm] = useState({
    numero_unidad: bus?.numero_unidad || "",
    ruta_asignada: bus?.ruta_asignada || "",
    capacidad: bus?.capacidad || "",
    horario: bus?.horario || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (bus) {
      // actualizar
      await supabase.from("buses").update(form).eq("id", bus.id);
      alert("Bus actualizado correctamente 🚍");
    } else {
      // crear
      await supabase.from("buses").insert([
        {
          ...form,
          chofer_id: userId,
        },
      ]);
      alert("Bus registrado correctamente 🚍");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <Input
        name="numero_unidad"
        placeholder="Número de unidad"
        value={form.numero_unidad}
        onChange={handleChange}
      />
      <Input
        name="ruta_asignada"
        placeholder="Ruta asignada"
        value={form.ruta_asignada}
        onChange={handleChange}
      />
      <Input
        type="number"
        name="capacidad"
        placeholder="Capacidad"
        value={form.capacidad}
        onChange={handleChange}
      />
      <Input
        name="horario"
        placeholder="Horario (ej. 7:00am - 9:00pm)"
        value={form.horario}
        onChange={handleChange}
      />

      <Button type="submit">{bus ? "Actualizar Bus" : "Registrar Bus"}</Button>
    </form>
  );
}
