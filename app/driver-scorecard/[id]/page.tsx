"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminSidebar from "@/app/components/AdminSidebar";
import { DriverScorecardBody } from "@/app/components/DriverScorecardBody";
import { useRequireAuth } from "@/lib/use-require-auth";

const ADMIN_ROLES = ["admin", "shipper"];

export default function DriverScorecardPage() {
  const { user, token, loading } = useRequireAuth("/login/shipper", ADMIN_ROLES);
  const { id } = useParams<{ id: string }>();

  if (loading || !user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <Link
              href="/tracking"
              className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1.5 mb-1 no-underline hover:no-underline"
            >
              <ArrowLeft size={12} /> กลับไปหน้าติดตามสถานะ
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Driver Scorecard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบดึงข้อมูลประสิทธิภาพพฤติกรรมการขับขี่ และวิเคราะห์ความปลอดภัยทางเสียง
            </p>
          </div>
        </header>

        <DriverScorecardBody token={token} driverId={id} />
      </main>
    </div>
  );
}
