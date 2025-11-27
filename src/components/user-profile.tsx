"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Mail, User, Calendar, Shield } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

interface UserProfileProps {
  user?: SupabaseUser | null;
}

export function UserProfile({ user }: UserProfileProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setUserRole(profile?.role || null);
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (!user) {
    return (
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          No hay datos de usuario disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Perfil de Usuario
          </h2>
        </div>

        {/* Información del Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rol */}
          {!loading && userRole && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rol
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {userRole}
                </p>
              </div>
            </div>
          )}
          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Correo Electrónico
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white break-all">
                {user.email || "No disponible"}
              </p>
            </div>
          </div>

          {/* Nombre Completo */}
          {user.user_metadata?.full_name && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nombre Completo
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {user.user_metadata.full_name}
                </p>
              </div>
            </div>
          )}

          {/* Fecha de Creación */}
          {user.created_at && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Miembro desde
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Último acceso */}
          {user.last_sign_in_at && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Último acceso
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {new Date(user.last_sign_in_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Información Adicional */}
        {user.user_metadata && Object.keys(user.user_metadata).length > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Adicional
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
