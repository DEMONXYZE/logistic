"use client";

import Sidebar, { type NavItem } from "@/app/components/Sidebar";

const navItems: NavItem[] = [
  { href: "/dashboard", icon: "fa-truck-moving", label: "Dashboard" },
  { href: "/driver-scorecard", icon: "fa-users", label: "Driver Scorecard" },
  { href: "#", icon: "fa-microphone-lines", label: "ประวัติสายโทร Voice AI" },
  { href: "#", icon: "fa-gear", label: "ตั้งค่าเสียงบอท (Settings)" },
  { href: "/tracking", icon: "fa-map-location-dot", label: "Tracking" },
  { href: "/admin/create-job", icon: "fa-file-pen", label: "สร้างประกาศจ้างงาน" },
];

export default function AdminSidebar() {
  return <Sidebar navItems={navItems} sectionLabel="การจัดการกองรถ" logoutRedirect="/login/admin" />;
}
