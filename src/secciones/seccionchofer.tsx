import { Navigation, User, MapPin, Info, Radio, Link } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./components/SignOutButton";
export default async function ChoferPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-muted from-background to-primary/5 p-4">
      <div className="max-w-2xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Navigation className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel del Conductor
          </h1>
          <p className="text-muted-foreground">
            Comparte tu ubicación en tiempo real con los estudiantes
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{user?.email}</span>
          </div>
        </div>

        {/* Status Card */}
        <Card className="p-6 bg-card border-border shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Radio className="w-6 h-6 text-muted-foreground" />
              <div>
                <h2 className="font-semibold text-foreground">
                  Estado de transmisión
                </h2>
                <p className="text-sm text-muted-foreground">Sin transmitir</p>
              </div>
            </div>
            <Badge variant="secondary">🔴 Inactivo</Badge>
          </div>

          {/* Ubicación ejemplo */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-5 h-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Ubicación actual
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  -12.046374, -77.042793
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
              size="lg"
            >
              <Navigation className="w-5 h-5 mr-2" />
              Comenzar a compartir ubicación
            </Button>

            {/*
            <Button variant="destructive" className="w-full" size="lg">
              Detener transmisión
            </Button>
            */}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-5 bg-primary/5 border-primary/20">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                Información importante:
              </p>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>
                  Tu ubicación se actualizará automáticamente cada pocos
                  segundos
                </li>
                <li>
                  Los estudiantes verán tu posición en el mapa en tiempo real
                </li>
                <li>Asegúrate de tener una conexión estable a internet</li>
                <li>Puedes detener la transmisión en cualquier momento</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            ← Volver a vista de estudiantes
          </Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
