"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/app/components/AdminSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import { listJobs, ApiError, type Job } from "@/lib/api";
import {
  JOB_STATUS_STYLES,
  CARGO_TYPE_LABELS,
  VEHICLE_TYPE_LABELS,
  formatJobDate,
} from "@/lib/job-constants";

const ADMIN_ROLES = ["admin", "shipper"];

export default function DashboardPage() {
  const { user, token, loading } = useRequireAuth("/login/admin", ADMIN_ROLES);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listJobs(token)
      .then((data) => setJobs(data ?? []))
      .catch((err) =>
        setJobsError(err instanceof ApiError ? err.message : "โหลดรายการงานไม่สำเร็จ")
      )
      .finally(() => setJobsLoading(false));
  }, [token]);

  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const latestJob = sortedJobs[0] ?? null;

  // คำนวณจำนวนงานแต่ละสถานะ
  const activeJobsCount = jobs.filter(j => j.status === "assigned" || j.status === "open").length;
  const completedJobsCount = jobs.filter(j => j.status === "completed").length;
  const cancelledJobsCount = jobs.filter(j => j.status === "cancelled").length;

  // 📊 LOGIC คำนวณจำนวนงานรายวันในสัปดาห์ปัจจุบัน
  const getJobsByDayOfWeek = () => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Index 0 = จันทร์, ..., 6 = อาทิตย์
    const now = new Date();
    
    // หาวันจันทร์ของสัปดาห์นี้
    const currentDay = now.getDay(); 
    const dayDiff = currentDay === 0 ? -6 : 1 - currentDay; 
    const mondayOfThisWeek = new Date(now);
    mondayOfThisWeek.setDate(now.getDate() + dayDiff);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    // วันอาทิตย์ของสัปดาห์นี้
    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
    sundayOfThisWeek.setHours(23, 59, 59, 999);

    jobs.forEach((job) => {
      const jobDate = new Date(job.createdAt);
      if (jobDate >= mondayOfThisWeek && jobDate <= sundayOfThisWeek) {
        let dayIndex = jobDate.getDay() - 1; // getDay(): 0=อาทิตย์, 1=จันทร์
        if (dayIndex === -1) dayIndex = 6; // ปรับวันอาทิตย์ให้อยู่ index 6
        counts[dayIndex]++;
      }
    });

    return counts;
  };

  const weeklyCounts = getJobsByDayOfWeek();
  const maxCount = Math.max(...weeklyCounts, 5); 

  // ฟังก์ชันคำนวณความสูงของแท่งกราฟ
  const getBarHeightClass = (count: number) => {
    if (count === 0) return "h-2";
    const percentage = (count / maxCount) * 100;
    if (percentage <= 15) return "h-4";
    if (percentage <= 30) return "h-8";
    if (percentage <= 50) return "h-14";
    if (percentage <= 75) return "h-18";
    return "h-22"; 
  };

  // 🚚 LOGIC คำนวณเปอร์เซ็นต์ความจุรถบรรทุกของงานล่าสุด
  const maxWeightLimit = 1000;
  const rawPercentage = latestJob && latestJob.weight ? (latestJob.weight / maxWeightLimit) * 100 : 0;
  const displayPercentage = latestJob && latestJob.weight > 0 ? Math.max(1, Math.round(rawPercentage)) : 0;

  if (loading || !user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบวิเคราะห์ข้อมูลพนักงานขับรถขนส่งและตรวจสอบความเสี่ยง
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ใบงานล่าสุด */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    ใบงานล่าสุดที่คุณสร้าง
                  </h3>
                  {latestJob && (
                    <p className="text-sm font-bold text-slate-700 mt-2">{latestJob.title}</p>
                  )}
                </div>
                {latestJob && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[11px] font-bold px-3 py-1 rounded-lg whitespace-nowrap ${
                        JOB_STATUS_STYLES[latestJob.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {latestJob.status}
                    </span>
                    <Link
                      href={`/jobs/${latestJob.id}`}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 whitespace-nowrap transition-colors"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                )}
              </div>

              {jobsLoading ? (
                <p className="text-sm text-slate-400 py-6 text-center">กำลังโหลด...</p>
              ) : !latestJob ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  ยังไม่มีงานที่สร้าง — ลองไปที่หน้า &ldquo;สร้างประกาศจ้างงาน&rdquo;
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">
                      ค่าจ้างเที่ยวนี้
                    </p>
                    <p className="text-2xl font-bold text-slate-800 pt-1">
                      {latestJob.price ? `${latestJob.price.toLocaleString()} บาท` : "-"}
                    </p>
                  </div>
                  <div className="space-y-1 border-l border-slate-100 pl-0 md:pl-4">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">
                      เส้นทางเดินรถ
                    </p>
                    <p className="text-xs text-slate-700 font-bold">
                      {latestJob.pickupLocation} <span className="text-slate-400 mx-1">→</span>{" "}
                      {latestJob.dropoffLocation}
                    </p>
                    <div className="pt-3">
                      <p className="text-[10px] text-slate-400 uppercase">กำหนดเวลาเดินทาง</p>
                      <p className="text-sm font-bold text-slate-700">
                        {formatJobDate(latestJob.jobDatetime)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 border-l border-slate-100 pl-0 md:pl-4">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        ประเภทรถ
                      </p>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg block text-center">
                        {VEHICLE_TYPE_LABELS[latestJob.vehicleType] ?? latestJob.vehicleType}
                      </span>
                    </div>
                    <div className="pt-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">
                        ประเภทสินค้า
                      </p>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg block text-center">
                        {CARGO_TYPE_LABELS[latestJob.cargoType] ?? latestJob.cargoType}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 🚚 พื้นที่ความจุรถบรรทุก */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800">พื้นที่ความจุรถบรรทุก</h3>
                {latestJob ? (
                  <Link
                    href={`/jobs/${latestJob.id}`}
                    className="text-xs text-rose-500 hover:text-rose-600 font-bold cursor-pointer hover:underline transition-all"
                  >
                    รายละเอียด
                  </Link>
                ) : (
                  <span className="text-xs text-slate-300">รายละเอียด</span>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-center relative my-2 overflow-hidden h-32">
                <i className="fa-solid fa-truck text-slate-200 text-5xl absolute left-4 opacity-30 animate-pulse" />
                <div className="bg-gradient-to-r from-rose-500 to-rose-400 text-white font-black text-3xl px-8 py-4 rounded-xl shadow-md tracking-wider animate-pulse">
                  {displayPercentage}%
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold pt-2">
                <div>
                  <p className="text-slate-700">
                    รถขนส่ง: {latestJob ? (VEHICLE_TYPE_LABELS[latestJob.vehicleType] ?? latestJob.vehicleType) : "ยังไม่มีงาน"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    น้ำหนักสินค้า: {latestJob && latestJob.weight ? `${latestJob.weight.toLocaleString()} กิโลกรัม` : "0 กิโลกรัม"}
                  </p>
                </div>
                <span className="text-emerald-500 flex items-center gap-1">
                  <i className="fa-solid fa-circle text-[8px] animate-ping absolute opacity-75" />
                  <i className="fa-solid fa-circle text-[8px] text-emerald-500" /> {latestJob ? latestJob.status : "ไม่มีสถานะ"}
                </span>
              </div>
            </div>
          </div>

          {/* ตารางงานขนส่งที่คุณสร้าง */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">งานขนส่งที่คุณสร้าง</h3>
              <div className="flex items-center gap-4">
                <Link
                  href="/admin/jobs"
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ดูทั้งหมด
                </Link>
                <Link
                  href="/admin/create-job"
                  className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5 hover:scale-105 transition-all"
                >
                  <i className="fa-solid fa-plus" />
                  สร้างงานใหม่
                </Link>
              </div>
            </div>

            {jobsLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">กำลังโหลดรายการงาน...</p>
            ) : jobsError ? (
              <p className="text-sm text-rose-500 py-6 text-center">{jobsError}</p>
            ) : jobs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                ยังไม่มีงานที่สร้าง — ลองกด &ldquo;สร้างงานใหม่&rdquo; ด้านบน
              </p>
            ) : (
              <div className="space-y-3">
                {sortedJobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{job.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.pickupLocation} <span className="mx-1 text-slate-300">→</span> {job.dropoffLocation}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                          {job.price ? `${job.price.toLocaleString()} บาท` : "-"}
                        </p>
                        <p className="text-[10px] text-slate-400">{formatJobDate(job.jobDatetime)}</p>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg whitespace-nowrap ${
                          JOB_STATUS_STYLES[job.status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* โซนการ์ดสถิติ 3 ใบด้านล่าง */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* การ์ดซ้าย: จำนวนงานรายสัปดาห์ */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">จำนวนงานรายสัปดาห์</h3>
                <button className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs group-hover:animate-bounce">
                  <i className="fa-solid fa-arrow-down-long" />
                </button>
              </div>

              <div className="h-28 flex items-end justify-between px-2 pt-8 border-b border-slate-100 relative">
                {/* ย้ายเส้นเป้าหมายไปหลบขวาสุด คลีนๆ ไม่ทับแท่งกราฟ */}
                <div className="absolute bottom-[50px] left-0 right-0 border-t border-dashed border-rose-300/60 flex items-center justify-end pr-4 pointer-events-none z-0">
                  <span className="bg-rose-500 text-white text-[9px] px-1 rounded font-bold -mt-2 animate-pulse shadow-sm">
                    จำนวนงานในสัปดาห์
                  </span>
                </div>

                {["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((dayLabel, index) => {
                  const count = weeklyCounts[index];
                  const heightClass = getBarHeightClass(count);
                  const isTargetMet = count >= 5;

                  return (
                    <div key={dayLabel} className="flex flex-col items-center group/bar relative w-3.5 z-10">
                      <span className="absolute -top-7 scale-0 group-hover/bar:scale-100 transition-all duration-150 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-20">
                        {count} งาน
                      </span>
                      
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-300 cursor-pointer 
                          ${isTargetMet ? "bg-gradient-to-t from-rose-500 to-rose-400 group-hover/bar:from-rose-600 group-hover/bar:to-rose-500" : "bg-slate-200 group-hover/bar:bg-slate-400"} 
                          ${heightClass} hover:scale-x-125`} 
                      >
                        {count === Math.max(...weeklyCounts) && count > 0 && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex justify-center w-2 h-2">
                            <span className="animate-ping absolute w-2 h-2 rounded-full bg-rose-400 opacity-75" />
                            <span className="w-2 h-2 rounded-full bg-rose-500 border border-white shadow" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2 px-1">
                <span>จ.</span>
                <span>อ.</span>
                <span>พ.</span>
                <span>พฤ.</span>
                <span>ศ.</span>
                <span>ส.</span>
                <span>อา.</span>
              </div>
            </div>

            {/* การ์ดกลาง: งานที่ประกาศจ้างทั้งหมด */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-400 p-6 rounded-3xl text-white shadow-lg shadow-rose-500/10 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
              <button className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs absolute right-6 top-6 group-hover:rotate-45 transition-transform duration-300">
                <i className="fa-solid fa-arrow-turn-up" />
              </button>

              <div>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  งานที่ประกาศจ้างทั้งหมด
                </p>
                <h2 className="text-5xl font-black mt-2 flex items-baseline gap-1">
                  {jobsLoading ? "..." : jobs.length} 
                  <span className="text-lg font-normal opacity-80">งาน</span>
                </h2>
              </div>

              <div className="my-2 pt-3 border-t border-white/20 grid grid-cols-3 gap-1 text-[10px] opacity-95 text-center">
                <div className="border-r border-white/10">
                  <p className="opacity-75 truncate">เปิดรับ/ส่ง</p>
                  <p className="text-xs font-bold mt-0.5">{jobsLoading ? "-" : activeJobsCount} งาน</p>
                </div>
                <div className="border-r border-white/10">
                  <p className="opacity-75 truncate">เสร็จสิ้นแล้ว</p>
                  <p className="text-xs font-bold mt-0.5">{jobsLoading ? "-" : completedJobsCount} งาน</p>
                </div>
                <div>
                  <p className="opacity-75 truncate">ยกเลิกแล้ว</p>
                  <p className="text-xs font-bold mt-0.5">{jobsLoading ? "-" : cancelledJobsCount} งาน</p>
                </div>
              </div>
            </div>

            {/* การ์ดขวา: บันทึกระบบ Voice AI ล่าสุด */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800">บันทึกระบบ Voice AI ล่าสุด</h3>
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </div>
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto pr-1 h-24 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600 flex-shrink-0">
                    บอท
                  </div>
                  <div className="bg-slate-100 p-2 rounded-2xl rounded-tl-none max-w-[85%]">
                    <p className="text-slate-700 font-medium">
                      โทรประเมินสายล่าสุด: นายวิชัย ระวังภัย
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-rose-500 text-white p-2 rounded-2xl rounded-tr-none max-w-[85%] animate-pulse">
                    <p className="font-medium text-right">
                      ผลตรวจเสียง: ตรวจพบระดับเสี่ยงเพลียสะสมสูง!
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                    ระบบ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-2">
                <button
                  onClick={() => alert("กำลังสั่งการ Voice Bot โทรออก...")}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-phone-volume text-[10px]" />
                  <span>คลิกสั่งสุ่มโทรตรวจคนขับทันที</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}