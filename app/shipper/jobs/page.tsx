"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/app/components/AdminSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import { listJobs, ApiError, type Job } from "@/lib/api";
import { formatJobDate, JOB_STATUS_LABELS } from "@/lib/job-constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ADMIN_ROLES = ["admin", "shipper"];

const STATUS_FILTER_OPTIONS = ["all", "open", "assigned", "in_progress", "completed", "cancelled"];

// 🎨 WeMove design system — สโคปเฉพาะหน้านี้เท่านั้น (เหมือน dashboard)
const WEMOVE_STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200",
  assigned: "bg-sky-50 text-sky-600 ring-1 ring-inset ring-sky-200",
  in_progress: "bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-200",
  completed: "bg-slate-700 text-white",
  cancelled: "bg-rose-50 text-rose-500 ring-1 ring-inset ring-rose-200",
};

export default function AllJobsPage() {
  const { user, token, loading } = useRequireAuth("/login/shipper", ADMIN_ROLES);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    if (!token) return;
    listJobs(token, { limit: 100 })
      .then((data) => setJobs(data ?? []))
      .catch((err) =>
        setJobsError(err instanceof ApiError ? err.message : "โหลดรายการงานไม่สำเร็จ")
      )
      .finally(() => setJobsLoading(false));
  }, [token]);

  const sortedJobs = useMemo(
    () =>
      [...jobs].sort((a, b) => {
        const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return dateSort === "newest" ? diff : -diff;
      }),
    [jobs, dateSort]
  );

  const filteredJobs = useMemo(
    () =>
      statusFilter === "all"
        ? sortedJobs
        : sortedJobs.filter((job) => job.status === statusFilter),
    [sortedJobs, statusFilter]
  );

  if (loading || !user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">งานขนส่งทั้งหมด</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              รายการงานขนส่งทั้งหมดที่คุณสร้างไว้ ({jobs.length} งาน)
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className="p-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
              <h3 className="text-base font-bold text-slate-800">รายการงานขนส่ง</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDateSort((s) => (s === "newest" ? "oldest" : "newest"))}
                  className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-[#E63946]/40 hover:text-[#E63946] flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <i className={`fa-solid ${dateSort === "newest" ? "fa-arrow-down-short-wide" : "fa-arrow-up-short-wide"}`} />
                  {dateSort === "newest" ? "ใหม่สุดก่อน" : "เก่าสุดก่อน"}
                </button>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 text-xs font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs font-bold">
                        {status === "all" ? "ทุกสถานะ" : JOB_STATUS_LABELS[status] ?? status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link
                  href="/shipper/create-job"
                  className="text-xs font-bold text-[#E63946] hover:text-[#C62839] flex items-center gap-1.5 whitespace-nowrap"
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
            ) : sortedJobs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                ยังไม่มีงานที่สร้าง — ลองกด &ldquo;สร้างงานใหม่&rdquo; ด้านบน
              </p>
            ) : filteredJobs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                ไม่มีงานที่ตรงกับสถานะ &ldquo;{JOB_STATUS_LABELS[statusFilter] ?? statusFilter}&rdquo;
              </p>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{job.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.pickupLocation} <span className="mx-1">→</span> {job.dropoffLocation}
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
                          WEMOVE_STATUS_STYLES[job.status] ?? "bg-slate-100 text-slate-600"
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
        </div>
      </main>
    </div>
  );
}
