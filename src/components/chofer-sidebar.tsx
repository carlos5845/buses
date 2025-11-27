"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Bus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";

const navMainData = [
  {
    title: "Dashboard",
    url: "/chofer",
    items: [
      {
        title: "Inicio",
        url: "/chofer",
      },
    ],
  },
  {
    title: "Buses",
    url: "/chofer/bus",
    items: [
      {
        title: "Mis Buses",
        url: "/chofer/bus",
      },
      {
        title: "Registrar Bus",
        url: "/chofer/bus/new",
      },
      {
        title: "Seleccionar Bus",
        url: "/chofer/bus/select",
      },
    ],
  },
];

export function ChoferSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [userRole, setUserRole] = useState<string>("Conductor");
  const [userEmail, setUserEmail] = useState<string>("conductor@bustacker.com");

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "conductor@bustacker.com");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "chofer";
        const roleLabel = role === "admin" ? "Administrador" : "Conductor";
        setUserRole(roleLabel);
      }
    };

    fetchUserData();
  }, []);

  const userData = {
    name: userRole,
    email: userEmail,
    avatar: "",
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-4 py-2 flex items-center justify-start gap-2">
          <Bus className="inline-block mr-2 size-8" />
          <div>
            <h2 className="text-lg font-bold font-sans">Bus Tracker</h2>
            <p className="text-sm text-muted-foreground">{userRole}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navMainData.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild>
                      <Link href={subItem.url}>{subItem.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
