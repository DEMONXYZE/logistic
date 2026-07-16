"use client";

import DriverSidebar from "@/app/components/DriverSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { DriverScorecardBody } from "@/app/components/DriverScorecardBody";
import { useRequireAuth } from "@/lib/use-require-auth";

const DRIVER_ROLES = ["driver"];

export default function DriverOwnScorePage() {
  const { user, token, loading } = useRequireAuth("/login/driver", DRIVER_ROLES);

  if (loading || !user || !DRIVER_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <DriverSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">คะแนนขับขี่ของฉัน</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ผลการประเมินพฤติกรรมการขับขี่และความปลอดภัยทางเสียงของคุณ
            </p>
          </div>
          <NotificationBell />
        </header>

        <DriverScorecardBody token={token} driverId={user.id} />
      </main>
    </div>
  );
}
