"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

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
import { NavUserAdmin } from "@/components/nav-user-admin";

const navMainData = [
  {
    title: "Dashboard",
    url: "/admin",
    items: [
      {
        title: "Inicio",
        url: "/admin",
      },
      {
        title: "Panel",
        url: "/chofer",
      },
    ],
  },
  {
    title: "Gestión",
    url: "/admin/buses",
    items: [
      {
        title: "Buses",
        url: "/admin/buses",
      },
      {
        title: "Conductores",
        url: "/admin/conductores",
      },
    ],
  },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [userRole, setUserRole] = useState<string>("Administrador");
  const [userEmail, setUserEmail] = useState<string>("admin@bustacker.com");

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "admin@bustacker.com");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "admin";
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
        <div className="px-4 py-2">
          <h2 className="text-lg font-semibold">Bus Tracker</h2>
          <p className="text-sm text-muted-foreground">{userRole}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navMainData.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="text-sm font-bold tracking-tight">
              {item.title}
            </SidebarGroupLabel>
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
        <NavUserAdmin user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
