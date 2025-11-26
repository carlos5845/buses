"use client";

import { LayoutSidebar } from "@/components/layout-sidebar";

export default function ChoferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutSidebar>{children}</LayoutSidebar>;
}
