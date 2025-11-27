"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { RadixSidebarDemo } from "@/components/navegation";

interface LayoutSidebarProps {
  children: React.ReactNode;
}

export function LayoutSidebar({ children }: LayoutSidebarProps) {
  const isMobile = useIsMobile();

  return (
    <div
      className={
        isMobile
          ? "relative overflow-hidden" // permite overlay limpio en mobile
          : "flex min-h-screen" // desktop layout normal
      }
    >
      <RadixSidebarDemo>{children}</RadixSidebarDemo>
    </div>
  );
}
