"use client";

import Image from "next/image";
import LandingPage from "@/secciones/components/LandingPage";
import Content from "@/secciones/content";
import Header from "@/secciones/header";
import { useRef } from "react";

export default function Home() {
  const mapSectionRef = useRef<HTMLDivElement>(null);

  const scrollToMap = () => {
    if (mapSectionRef.current) {
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
    <div className="font-sans min-h-screen">
      <Header />
      {/* Landing Page */}
      <LandingPage onViewMap={scrollToMap} />

      {/* Sección del Mapa */}
      <div
        ref={mapSectionRef}
        id="map-section"
        className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      >
        <Content />
      </div>

      {/* Footer */}
      <footer className="flex gap-[24px] flex-wrap items-center justify-center py-8 px-4 relative z-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-600 dark:text-gray-400"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-600 dark:text-gray-400"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-gray-600 dark:text-gray-400"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
