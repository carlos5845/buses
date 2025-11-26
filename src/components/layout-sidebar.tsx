"use client";

import * as React from "react";
import { RadixSidebarDemo } from "@/components/navegation";

interface LayoutSidebarProps {
  children: React.ReactNode;
}

export function LayoutSidebar({ children }: LayoutSidebarProps) {
  return <RadixSidebarDemo>{children}</RadixSidebarDemo>;
}
