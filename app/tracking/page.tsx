"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import AdminSidebar from "@/app/components/AdminSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import { listDrivers, ApiError, type Driver } from "@/lib/api";
import { VEHICLE_TYPES, VEHICLE_TYPE_LABELS } from "@/lib/job-constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADMIN_ROLES = ["admin", "shipper"];

const RISK_FILTER_OPTIONS = ["all", "low", "medium", "high"];
const RISK_FILTER_LABELS: Record<string, string> = {
  all: "ทุกสถานะ",
  low: "ปกติ / พร้อมวิ่งงาน",
  medium: "เฝ้าระวัง",
  high: "เสี่ยงสูง",
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const RISK_STYLES: Record<string, { label: string; badgeClass: string; avatarClass: string }> = {
  low: {
    label: "ปกติ / พร้อมวิ่งงาน",
    badgeClass: "bg-emerald-100 text-emerald-700",
    avatarClass: "bg-slate-100 text-slate-600",
  },
  medium: {
    label: "เฝ้าระวัง",
    badgeClass: "bg-amber-100 text-amber-700",
    avatarClass: "bg-amber-100 text-amber-700",
  },
  high: {
    label: "เสี่ยงสูง",
    badgeClass: "bg-rose-100 text-rose-600",
    avatarClass: "bg-rose-100 text-rose-600",
  },
};

function scoreClassOf(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-500";
}

function AdvancedFilterPopover({
  riskFilter,
  setRiskFilter,
  vehicleFilter,
  setVehicleFilter,
}: {
  riskFilter: string;
  setRiskFilter: (v: string) => void;
  vehicleFilter: string;
  setVehicleFilter: (v: string) => void;
}) {
  const isActive = riskFilter !== "all" || vehicleFilter !== "all";

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={`relative text-xs font-semibold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 border ${
            isActive
              ? "border-rose-400/60 text-rose-500 bg-rose-50/60"
              : "border-slate-200 text-slate-500 hover:text-slate-800"
          }`}
        >
          <i className="fa-solid fa-arrow-down-wide-short" /> ตัวกรองขั้นสูง
          {isActive && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-50 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 space-y-4"
        >
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase">ผลการประเมิน</p>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RISK_FILTER_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs font-bold">
                    {RISK_FILTER_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase">ประเภทรถ</p>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-bold">
                  ทุกประเภท
                </SelectItem>
                {VEHICLE_TYPES.map((v) => (
                  <SelectItem key={v.value} value={v.value} className="text-xs font-bold">
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isActive && (
            <button
              type="button"
              onClick={() => {
                setRiskFilter("all");
                setVehicleFilter("all");
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1"
            >
              <i className="fa-solid fa-rotate-left" /> ล้างตัวกรอง
            </button>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export default function TrackingPage() {
  const { user, token, loading } = useRequireAuth("/login/shipper", ADMIN_ROLES);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [driversError, setDriversError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");

  useEffect(() => {
    if (!token) return;
    listDrivers(token)
      .then((data) => setDrivers(data ?? []))
      .catch((err) =>
        setDriversError(err instanceof ApiError ? err.message : "โหลดรายชื่อคนขับไม่สำเร็จ")
      )
      .finally(() => setDriversLoading(false));
  }, [token]);

  const filteredDrivers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      const matchesSearch =
        !q || d.fullName.toLowerCase().includes(q) || d.phone.toLowerCase().includes(q);
      const matchesRisk = riskFilter === "all" || d.riskLevel === riskFilter;
      const matchesVehicle = vehicleFilter === "all" || d.carType === vehicleFilter;
      return matchesSearch && matchesRisk && matchesVehicle;
    });
  }, [drivers, search, riskFilter, vehicleFilter]);

  if (loading || !user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-20">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              ติดตามสถานะและการโทร (Voice Bot Tracking)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ตารางสรุปประวัติสายโทรเข้า-ออกของระบบ Voice AI เพื่อประเมินความปลอดภัยเรียลไทม์
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className="p-4 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-[11px] font-bold text-slate-400 uppercase">จำนวนการโทรทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">48 สาย</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ประเมินผ่านเกณฑ์ (ปกติ)</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">42 สาย</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ตรวจพบความเสี่ยง (เหนื่อยล้า)</p>
              <p className="text-2xl font-bold text-rose-500 mt-1">4 สาย</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ไม่รับสาย / ติดต่อไม่ได้</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">2 สาย</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-white">
              <h3 className="text-sm font-bold text-slate-800">
                ตารางบันทึกการติดตามงาน (Tracking Logs)
              </h3>
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหาชื่อ / เบอร์โทร..."
                    className="bg-transparent text-xs outline-none w-full sm:w-44"
                  />
                  <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs flex-shrink-0" />
                </div>
                <AdvancedFilterPopover
                  riskFilter={riskFilter}
                  setRiskFilter={setRiskFilter}
                  vehicleFilter={vehicleFilter}
                  setVehicleFilter={setVehicleFilter}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 pl-6">ชื่อพนักงานขับรถ</th>
                    <th className="p-4">เบอร์โทรศัพท์</th>
                    <th className="p-4">ประเภทรถ</th>
                    <th className="p-4 text-center">ผลการประเมิน</th>
                    <th className="p-4 text-center">คะแนน</th>
                    <th className="p-4 pr-6 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {driversLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        กำลังโหลดรายชื่อคนขับ...
                      </td>
                    </tr>
                  ) : driversError ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-rose-500">
                        {driversError}
                      </td>
                    </tr>
                  ) : filteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        {drivers.length === 0 ? "ยังไม่มีคนขับในระบบ" : "ไม่พบคนขับที่ตรงกับที่ค้นหา"}
                      </td>
                    </tr>
                  ) : (
                    filteredDrivers.map((d) => {
                      const risk = RISK_STYLES[d.riskLevel] ?? RISK_STYLES.low;
                      const isHighRisk = d.riskLevel === "high";
                      return (
                        <tr key={d.userId} className="hover:bg-slate-50/50 transition-all">
                          <td className="p-4 pl-6">
                            <Link
                              href={`/driver-scorecard/${d.userId}`}
                              className="flex items-center gap-3 group no-underline hover:no-underline w-fit"
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${risk.avatarClass}`}
                              >
                                {initialsOf(d.fullName)}
                              </div>
                              <span className="font-bold text-slate-800 group-hover:text-rose-500 transition-colors">
                                {d.fullName}
                              </span>
                            </Link>
                          </td>
                          <td className="p-4 text-slate-500">{d.phone}</td>
                          <td className="p-4 text-slate-500">
                            {VEHICLE_TYPE_LABELS[d.carType] ?? d.carType}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`font-bold px-2.5 py-1 rounded-lg text-[11px] ${risk.badgeClass}`}
                            >
                              {risk.label}
                            </span>
                          </td>
                          <td className={`p-4 text-center font-bold ${scoreClassOf(d.currentScore)}`}>
                            {Math.round(d.currentScore)} / 100
                          </td>
                          <td className="p-4 pr-6 text-center">
                            {isHighRisk ? (
                              <button className="px-3 py-1.5 rounded-xl transition-all font-bold bg-rose-50 hover:bg-rose-100 text-rose-600">
                                สั่งหยุดพักรถ
                              </button>
                            ) : (
                              <Link
                                href={`/driver-scorecard/${d.userId}`}
                                className="px-3 py-1.5 rounded-xl transition-all font-bold inline-block bg-slate-100 hover:bg-slate-200 text-slate-700"
                              >
                                ดูการ์ดคะแนน
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
