"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminSidebar from "@/app/components/AdminSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import { listJobs, ApiError, type Job } from "@/lib/api";
import { JOB_STATUS_STYLES, formatJobDate } from "@/lib/job-constants";

const ADMIN_ROLES = ["admin", "shipper"];

export default function AllJobsPage() {
  const { user, token, loading } = useRequireAuth("/login/shipper", ADMIN_ROLES);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listJobs(token, { limit: 100 })
      .then((data) => setJobs(data ?? []))
      .catch((err) =>
        setJobsError(err instanceof ApiError ? err.message : "โหลดรายการงานไม่สำเร็จ")
      )
      .finally(() => setJobsLoading(false));
  }, [token]);

  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-800">รายการงานขนส่ง</h3>
              <Link
                href="/shipper/create-job"
                className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-plus" />
                สร้างงานใหม่
              </Link>
            </div>

            {jobsLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">กำลังโหลดรายการงาน...</p>
            ) : jobsError ? (
              <p className="text-sm text-rose-500 py-6 text-center">{jobsError}</p>
            ) : sortedJobs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                ยังไม่มีงานที่สร้าง — ลองกด &ldquo;สร้างงานใหม่&rdquo; ด้านบน
              </p>
            ) : (
              <div className="space-y-3">
                {sortedJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
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
        </div>
      </main>
    </div>
  );
}
