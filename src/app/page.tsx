"use client";

import Image from "next/image";
import LandingPage from "@/secciones/components/LandingPage";
import Content from "@/secciones/content";
import Header from "@/secciones/header";
import { useRef } from "react";
import Hero from "@/secciones/components/hero";
export default function Home() {
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const scrollToMap = () => {
    if (mapSectionRef.current && typeof window !== "undefined") {
      const headerOffset = 100; // Altura del header + margen
      const elementPosition = mapSectionRef.current.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="font-sans w-full">
      {/* ================= SECTION 1: HEADER ================= */}
      <Header />

      {/* ================= SECTION 2: HERO ================= */}
      <section className="min-h-screen flex items-center justify-center ">
        <Hero onViewMap={scrollToMap} />
      </section>

      {/* ================= SECTION 3: MAPA ================= */}
      <section
        ref={mapSectionRef}
        id="map-section"
        className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 "
      >
        <Content />
      </section>

      {/* ================= SECTION 4: LANDING PAGE ================= */}
      <section className="min-h-screen flex items-center justify-center ">
        <LandingPage onViewMap={scrollToMap} />
      </section>

      {/* ================= SECTION 5: FOOTER ================= */}
      <footer className="w-full flex items-center justify-center py-10 px-4 relative bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <img src="/tapir.jpg" alt="tapir" width={190} />
      </footer>
    </div>
  );
}
