"use client";

import Link from "next/link";
import AdminSidebar from "@/app/components/AdminSidebar";
import { useRequireAuth } from "@/lib/use-require-auth";

const ADMIN_ROLES = ["admin", "shipper"];

const trackingRows = [
  {
    initials: "SD",
    avatarClass: "bg-slate-900 text-white",
    name: "นายสมชาย ดีใจ",
    phone: "089-123-xxxx",
    time: "07 ก.ค. 2026 ● 14:32 น.",
    status: "ปกติ / พร้อมวิ่งงาน",
    statusClass: "bg-emerald-100 text-emerald-700",
    score: "94 / 100",
    scoreClass: "text-emerald-600",
    action: { label: "ดูการ์ดคะแนน", href: "/driver-scorecard", className: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
  },
  {
    initials: "WR",
    avatarClass: "bg-rose-100 text-rose-600",
    name: "นายวิชัย ระวังภัย",
    phone: "081-789-xxxx",
    time: "07 ก.ค. 2026 ● 11:15 น.",
    status: "เสี่ยงสูง / เพลียสะสม",
    statusClass: "bg-rose-100 text-rose-600",
    score: "58 / 100",
    scoreClass: "text-rose-500",
    action: { label: "สั่งหยุดพักรถ", className: "bg-rose-50 hover:bg-rose-100 text-rose-600" },
  },
  {
    initials: "MN",
    avatarClass: "bg-slate-100 text-slate-600",
    name: "นายมานพ นิ่งเฉย",
    phone: "086-456-xxxx",
    time: "07 ก.ค. 2026 ● 09:04 น.",
    status: "ปกติ / พร้อมวิ่งงาน",
    statusClass: "bg-emerald-100 text-emerald-700",
    score: "89 / 100",
    scoreClass: "text-emerald-600",
    action: { label: "ดูการ์ดคะแนน", href: "/driver-scorecard", className: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
  },
  {
    initials: "AK",
    avatarClass: "bg-slate-100 text-slate-600",
    name: "นายอนันต์ ขยันขับ",
    phone: "083-222-xxxx",
    time: "06 ก.ค. 2026 ● 18:20 น.",
    status: "เฝ้าระวัง / ขับเกินเวลา",
    statusClass: "bg-amber-100 text-amber-700",
    score: "72 / 100",
    scoreClass: "text-amber-600",
    action: { label: "ส่งข้อความเตือน", className: "bg-slate-100 hover:bg-slate-200 text-slate-700" },
  },
];

export default function TrackingPage() {
  const { user, loading } = useRequireAuth("/login/admin", ADMIN_ROLES);
  if (loading || !user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              ติดตามสถานะและการโทร (Voice Bot Tracking)
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ตารางสรุปประวัติสายโทรเข้า-ออกของระบบ Voice AI เพื่อประเมินความปลอดภัยเรียลไทม์
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
              <input
                type="text"
                placeholder="ค้นหาชื่อ / เบอร์โทร..."
                className="bg-transparent text-xs outline-none w-44"
              />
              <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs" />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">จำนวนการโทรทั้งหมด</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">48 สาย</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ประเมินผ่านเกณฑ์ (ปกติ)</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">42 สาย</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ตรวจพบความเสี่ยง (เหนื่อยล้า)</p>
              <p className="text-2xl font-bold text-rose-500 mt-1">4 สาย</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase">ไม่รับสาย / ติดต่อไม่ได้</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">2 สาย</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-sm font-bold text-slate-800">
                ตารางบันทึกการติดตามงาน (Tracking Logs)
              </h3>
              <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl transition-all">
                <i className="fa-solid fa-arrow-down-wide-short mr-1" /> ตัวกรองขั้นสูง
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 pl-6">ชื่อพนักงานขับรถ</th>
                    <th className="p-4">เบอร์โทรศัพท์</th>
                    <th className="p-4">เวลาทำรายการ</th>
                    <th className="p-4 text-center">ผลการประเมิน</th>
                    <th className="p-4 text-center">คะแนน</th>
                    <th className="p-4 pr-6 text-center">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {trackingRows.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${row.avatarClass}`}
                          >
                            {row.initials}
                          </div>
                          <span className="font-bold text-slate-800">{row.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">{row.phone}</td>
                      <td className="p-4 text-slate-500">{row.time}</td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-lg text-[11px] ${row.statusClass}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className={`p-4 text-center font-bold ${row.scoreClass}`}>
                        {row.score}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        {row.action.href ? (
                          <Link
                            href={row.action.href}
                            className={`px-3 py-1.5 rounded-xl transition-all font-bold inline-block ${row.action.className}`}
                          >
                            {row.action.label}
                          </Link>
                        ) : (
                          <button
                            className={`px-3 py-1.5 rounded-xl transition-all font-bold ${row.action.className}`}
                          >
                            {row.action.label}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
