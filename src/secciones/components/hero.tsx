"use client";

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils"; // Ajusta la ruta si tu util está en otra carpeta
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text"; // Ajusta según tu estructura
import { RainbowButton } from "@/components/ui/rainbow-button"; // Ajusta la ruta si cambia
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";

interface HeroProps {
  onViewMap: () => void;
}

export default function Hero({ onViewMap }: HeroProps) {
  return (
    <div className="relative h-full w-full px-4 sm:px-6 lg:px-8 mx-auto py-8">
      {/* RetroGrid Fondo */}
      <div className="absolute inset-0 w-full h-full z-0">
        <RetroGrid opacity={0.7} darkLineColor="white" />
      </div>

      {/* CONTENIDO CENTRADO */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center">
        {/* Etiqueta superior */}
        <div className="animate-fade-in">
          <div className="flex items-center justify-center">
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span>✨ Bus Traker UI</span>
                <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </div>

          {/* Título */}
          <h1 className="pointer-events-none bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-3xl sm:text-5xl lg:text-8xl font-semibold  text-transparent dark:from-white dark:to-slate-900/10 whitespace-pre-wrap break-words mt-4    ">
            Sistema de
            <span className="block bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-transparent dark:from-white dark:to-slate-900/10">
              Rastreo de Buses
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-500 max-w-3xl mx-auto px-2 mt-4">
            Monitorea la ubicación de tus buses en tiempo real. Ubicación
            precisa, actualizaciones instantáneas y seguimiento confiable.
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 px-2">
          <button onClick={onViewMap}>
            <RainbowButton variant="outline" size="lg">
              Ver Mapa en Tiempo Real
            </RainbowButton>
          </button>

          <Button onClick={onViewMap} size="lg">
            Explorar Rutas
          </Button>
        </div>
      </div>
    </div>
  );
}
