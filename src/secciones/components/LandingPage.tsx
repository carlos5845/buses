"use client";

import { Button } from "@/components/ui/button";
import { MapPin, Bus, Clock, Shield, ArrowDown } from "lucide-react";
import { useEffect, useRef } from "react";

interface LandingPageProps {
  onViewMap: () => void;
}

export default function LandingPage({ onViewMap }: LandingPageProps) {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

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
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 py-20">
        {/* Título principal */}
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white tracking-tight">
            Sistema de
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rastreo de Buses
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Monitorea la ubicación de tus buses en tiempo real. Ubicación
            precisa, actualizaciones instantáneas y seguimiento confiable.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            onClick={onViewMap}
            size="lg"
            className="text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <MapPin className="w-5 h-5" />
            Ver Mapa en Tiempo Real
          </Button>
          <Button
            onClick={onViewMap}
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 h-auto border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            Explorar Rutas
          </Button>
        </div>

        {/* Características destacadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Ubicación en Tiempo Real
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Sigue la ubicación exacta de cada bus con actualizaciones cada
              pocos segundos
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Bus className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Múltiples Buses
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Visualiza todos los buses activos en un solo mapa con rutas
              diferenciadas por color
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Seguro y Confiable
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Sistema seguro con autenticación y control de acceso basado en
              roles
            </p>
          </div>
        </div>

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

      {/* Indicador de scroll */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
      >
        <div className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400">
          <span className="text-sm font-medium">Desplázate para ver el mapa</span>
          <ArrowDown className="w-6 h-6" />
        </div>
      </div>
    </section>
  );
}

