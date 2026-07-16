"use client";

import Sidebar, { type NavItem } from "@/app/components/Sidebar";
import { useAuth } from "@/lib/auth-context";

const baseNavItems: NavItem[] = [
  { href: "/dashboard", icon: "fa-truck-moving", label: "Dashboard" },
  { href: "#", icon: "fa-microphone-lines", label: "ประวัติสายโทร Voice AI" },
  { href: "/tracking", icon: "fa-map-location-dot", label: "Tracking" },
  { href: "/shipper/jobs", icon: "fa-boxes-stacked", label: "งานขนส่งทั้งหมด" },
  { href: "/shipper/create-job", icon: "fa-file-pen", label: "สร้างประกาศจ้างงาน" },
];

const adminOnlyNavItem: NavItem = {
  href: "/admin/llm-config",
  icon: "fa-gear",
  label: "ตั้งค่า LLM Model",
};

export default function AdminSidebar() {
  const { user } = useAuth();
  const navItems = user?.role === "admin" ? [...baseNavItems, adminOnlyNavItem] : baseNavItems;

  return <Sidebar navItems={navItems} sectionLabel="การจัดการกองรถ" logoutRedirect="/login/shipper" />;
}
