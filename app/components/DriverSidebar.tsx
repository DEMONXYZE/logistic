"use client";

import Sidebar, { type NavItem } from "@/app/components/Sidebar";

const navItems: NavItem[] = [
  { href: "/driver/jobs", icon: "fa-box-open", label: "งานที่รับได้" },
  { href: "/driver/my-jobs", icon: "fa-truck-fast", label: "งานของฉัน" },
  { href: "#", icon: "fa-star", label: "คะแนนขับขี่ของฉัน" },
];

export default function DriverSidebar() {
  return <Sidebar navItems={navItems} sectionLabel="งานขนส่ง" logoutRedirect="/login/driver" />;
}
