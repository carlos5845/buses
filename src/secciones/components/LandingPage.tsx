"use client";

import { RainbowButton } from "@/components/ui/rainbow-button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { cn } from "@/lib/utils";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  MapPin,
  Bus,
  Clock,
  Shield,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef } from "react";

interface LandingPageProps {
  onViewMap: () => void;
}

export default function LandingPage({ onViewMap }: LandingPageProps) {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      Icon: MapPin,
      name: "Ubicación en Tiempo Real",
      description: "Rastreo GPS en vivo de todos tus buses",
      href: "#",
      cta: "Explorar",
      className: "col-span-3 lg:col-span-1",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent" />
      ),
    },
    {
      Icon: Bus,
      name: "Múltiples Buses",
      description: "Visualiza y gestiona toda tu flota en un solo lugar",
      href: "#",
      cta: "Saber más",
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent" />
      ),
    },
    {
      Icon: Clock,
      name: "Actualizaciones Instantáneas",
      description: "Datos en tiempo real cada segundo",
      href: "#",
      cta: "Saber más",
      className: "col-span-3 lg:col-span-2",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent" />
      ),
    },
    {
      Icon: Shield,
      name: "Seguridad Garantizada",
      description: "Autenticación y acceso basado en roles",
      className: "col-span-3 lg:col-span-1",
      href: "#",
      cta: "Saber más",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />
      ),
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (scrollIndicatorRef.current) {
        const scrolled = window.scrollY;
        const maxScroll = window.innerHeight;
        const opacity = Math.max(0, 1 - scrolled / maxScroll);
        scrollIndicatorRef.current.style.opacity = opacity.toString();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="landing"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Fondo con gradientes animados */}
      <div className="absolute inset-0 "></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>

      {/* RetroGrid Fondo */}
      <div className="absolute inset-0 z-0">
        <RetroGrid />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 py-20">
        {/* Título principal */}
        <div className="animate-fade-in">
          <div className="z-10 flex  items-center justify-center">
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                <span>✨Bus Traker UI</span>
                <ArrowRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </div>
          <h1 className="pointer-events-none bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl leading-none font-semibold whitespace-pre-wrap text-transparent dark:from-white dark:to-slate-900/10">
            Sistema de
            <span className="block pointer-events-none bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-8xl leading-none font-semibold whitespace-pre-wrap text-transparent dark:from-white dark:to-slate-900/10">
              Rastreo de Buses
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-500 max-w-3xl mx-auto">
            Monitorea la ubicación de tus buses en tiempo real. Ubicación
            precisa, actualizaciones instantáneas y seguimiento confiable.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button onClick={onViewMap}>
            <RainbowButton variant={"outline"} size={"lg"}>
              Ver Mapa en Tiempo Real
            </RainbowButton>
          </button>
          <button onClick={onViewMap}>
            <RainbowButton size={"lg"}>Explorar Rutas</RainbowButton>
          </button>
        </div>

        {/* Características destacadas */}
        <BentoGrid className="mt-16">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-3xl mx-auto">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              24/7
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitoreo
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              <Clock className="w-8 h-8 mx-auto" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tiempo Real
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              100%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Precisión
            </div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              GPS
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tecnología
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
