"use client";

import { LayoutSidebar } from "@/components/layout-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutSidebar>{children}</LayoutSidebar>;
}
