"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", icon: "fa-truck-moving", label: "Dashboard" },
  { href: "/driver-scorecard", icon: "fa-users", label: "Driver Scorecard" },
  { href: "#", icon: "fa-microphone-lines", label: "ประวัติสายโทร Voice AI" },
  { href: "#", icon: "fa-gear", label: "ตั้งค่าเสียงบอท (Settings)" },
  { href: "/tracking", icon: "fa-map-location-dot", label: "Tracking" },
];

function initialsOf(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.push("/login/admin");
  }

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col h-screen flex-shrink-0 z-10">
      <div className="flex-grow overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white z-10">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            W
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">
            WeMove <span className="text-emerald-500">×</span> Botnoi
          </span>
        </div>

        <nav className="p-4 space-y-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            การจัดการกองรถ
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? "active-menu text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 flex-shrink-0">
            {initialsOf(user?.fullName)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">
              {user?.fullName ?? "..."}
            </p>
            <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-rose-500 transition-all p-1.5 rounded-lg hover:bg-rose-50 flex-shrink-0"
        >
          <i className="fa-solid fa-right-from-bracket text-sm" />
        </button>
      </div>
    </aside>
  );
}
