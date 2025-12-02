"use client";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";
import { MapPin, Bus, Clock, Shield } from "lucide-react";
import { useEffect, useRef } from "react";
interface LandingPageProps {
  onViewMap: () => void;
}

export default function LandingPage({}: LandingPageProps) {
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      Icon: MapPin,
      name: "Ubicación en Tiempo Real",
      description: "Rastreo GPS en vivo de todos tus buses",
      href: "https://github.com/carlos5845",
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
      href: "https://github.com/carlos5845",
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
      href: "https://github.com/carlos5845",
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
      href: "https://github.com/carlos5845",
      cta: "Saber más",
      background: (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent" />
      ),
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

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
      {/* Fondo con gradientes animados 
        <div className="absolute inset-0 "></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>*/}

      {/* Contenido principal */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 mx-auto text-center space-y-6 sm:space-y-8 py-8">
        {/* Título principal */}

        {/* Características destacadas */}
        <BentoGrid className="mt-8 sm:mt-12 lg:mt-16 px-2">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>

        {/* Estadísticas rápidas con scroll de texto */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mt-8 sm:mt-12 px-2">
          <ScrollVelocityContainer className="text-4xl font-bold tracking-[-0.02em] md:text-7xl md:leading-[5rem]">
            <ScrollVelocityRow baseVelocity={5} direction={1}>
              Sistema de Rastreo • Buses en Tiempo Real •
            </ScrollVelocityRow>
            <ScrollVelocityRow baseVelocity={5} direction={-1}>
              GPS Avanzado • Monitoreo 24/7 •
            </ScrollVelocityRow>
          </ScrollVelocityContainer>
          <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
          <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
        </div>
      </div>
    </section>
  );
}
