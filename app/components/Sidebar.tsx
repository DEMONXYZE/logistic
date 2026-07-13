"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export type NavItem = {
  href: string;
  icon: string;
  label: string;
};

function initialsOf(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

type SidebarProps = {
  navItems: NavItem[];
  sectionLabel: string;
  logoutRedirect: string;
};

export default function Sidebar({ navItems, sectionLabel, logoutRedirect }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await logout();
    router.push(logoutRedirect);
  }

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-72"
      } bg-white border-r border-slate-200/80 flex flex-col h-screen flex-shrink-0 z-10 transition-all duration-200`}
    >
      <div className="flex-grow overflow-y-auto overflow-x-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 bg-white z-10">
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
            className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all"
          >
            <i className="fa-solid fa-bars" />
          </button>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight text-slate-900 truncate">
              WeMove <span className="text-emerald-500">×</span> Botnoi
            </span>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {!collapsed && (
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              {sectionLabel}
            </p>
          )}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  collapsed ? "justify-center px-0" : ""
                } ${
                  isActive
                    ? "active-menu text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className={`p-4 border-t border-slate-100 flex items-center bg-white flex-shrink-0 ${
          collapsed ? "flex-col gap-3" : "justify-between"
        }`}
      >
        <div className={`flex items-center gap-3 min-w-0 ${collapsed ? "flex-col" : ""}`}>
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 flex-shrink-0">
            {initialsOf(user?.fullName)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 truncate">
                {user?.fullName ?? "..."}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title="ออกจากระบบ"
          className="text-slate-400 hover:text-rose-500 transition-all p-1.5 rounded-lg hover:bg-rose-50 flex-shrink-0"
        >
          <i className="fa-solid fa-right-from-bracket text-sm" />
        </button>
      </div>
    </aside>
  );
}
