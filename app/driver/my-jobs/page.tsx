"use client";

import { useEffect, useState } from "react";
import DriverSidebar from "@/app/components/DriverSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  listMyAssignments,
  getJob,
  getDeliveryTimeline,
  addDeliveryStatus,
  ApiError,
  type JobAssignment,
  type Job,
  type DeliveryEvent,
  type DeliveryStatusValue,
} from "@/lib/api";
import {
  CARGO_TYPE_LABELS,
  ASSIGNMENT_STATUS_STYLES,
  ASSIGNMENT_STATUS_LABELS,
  DELIVERY_STATUS_STEPS,
  DELIVERY_STATUS_LABELS,
  formatJobDateTime,
} from "@/lib/job-constants";

const DRIVER_ROLES = ["driver"];

type AssignmentRow = {
  assignment: JobAssignment;
  job: Job | null;
  timeline: DeliveryEvent[];
};

function nextStep(timeline: DeliveryEvent[]): DeliveryStatusValue | null {
  const done = new Set(timeline.map((e) => e.status));
  for (const step of DELIVERY_STATUS_STEPS) {
    if (!done.has(step.value)) return step.value;
  }
  return null;
}

export default function DriverMyJobsPage() {
  const { user, token, loading } = useRequireAuth("/login/driver", DRIVER_ROLES);

  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(true);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadAssignments();
  }, [token]);

  async function loadAssignments() {
    if (!token) return;
    setRowsLoading(true);
    setRowsError(null);
    try {
      const assignments = (await listMyAssignments(token)) ?? [];
      const withDetails = await Promise.all(
        assignments.map(async (assignment) => {
          const [job, timeline] = await Promise.all([
            getJob(token, assignment.jobId).catch(() => null),
            getDeliveryTimeline(token, assignment.id).catch(() => []),
          ]);
          return { assignment, job, timeline: timeline ?? [] };
        })
      );
      setRows(withDetails);
    } catch (err) {
      setRowsError(err instanceof ApiError ? err.message : "โหลดงานของฉันไม่สำเร็จ");
    } finally {
      setRowsLoading(false);
    }
  }

  async function handleAdvance(assignmentId: string, status: DeliveryStatusValue) {
    if (!token) return;
    setUpdatingId(assignmentId);
    setUpdateError(null);
    try {
      await addDeliveryStatus(token, assignmentId, { status });
      await loadAssignments();
    } catch (err) {
      setUpdateError(err instanceof ApiError ? err.message : "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading || !user || !DRIVER_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <DriverSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">งานของฉัน</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              งานที่คุณรับไว้ อัปเดตสถานะการจัดส่งได้จากตรงนี้
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className="p-6 md:p-8">
          {updateError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl px-4 py-3">
              {updateError}
            </div>
          )}

          {rowsLoading ? (
            <p className="text-sm text-slate-400 py-10 text-center">กำลังโหลด...</p>
          ) : rowsError ? (
            <p className="text-sm text-rose-500 py-10 text-center">{rowsError}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">ยังไม่มีงานที่รับไว้</p>
          ) : (
            <div className="grid gap-6">
              {rows.map(({ assignment, job, timeline }) => {
                const upcoming = nextStep(timeline);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6"
                  >
                    {/* หัวการ์ด: badge สถานะ + เส้นทาง + ราคา */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                      <div className="space-y-2 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            {job?.title ?? "งานขนส่ง"}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                              ASSIGNMENT_STATUS_STYLES[assignment.status] ?? "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                          {job ? `${job.pickupLocation} → ${job.dropoffLocation}` : "-"}
                        </h2>
                      </div>

                      <div className="text-left md:text-right flex-shrink-0">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          ค่าจ้างเที่ยวนี้
                        </p>
                        <p className="text-2xl font-black text-[#E63946] whitespace-nowrap">
                          {job?.price ? `${job.price.toLocaleString()} บาท` : "-"}
                        </p>
                      </div>
                    </div>

                    {/* ข้อมูลงาน: กรอบมีหัวข้อ แบบเดียวกับ dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">
                          ประเภทสินค้า
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {job ? CARGO_TYPE_LABELS[job.cargoType] ?? job.cargoType : "-"}
                        </p>
                      </div>
                      <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-4">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">
                          วันเดินทาง
                        </p>
                        <p className="text-sm font-bold text-slate-700">
                          {job ? formatJobDateTime(job.jobDatetime) : "-"}
                        </p>
                      </div>
                    </div>

                    {/* timeline สถานะ + ปุ่มอัปเดต */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {DELIVERY_STATUS_STEPS.map((step) => {
                          const done = timeline.some((e) => e.status === step.value);
                          return (
                            <span
                              key={step.value}
                              className={`text-[11px] font-bold px-3 py-1 rounded-lg whitespace-nowrap ${
                                done ? "bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200" : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {done ? "✓ " : ""}
                              {step.label}
                            </span>
                          );
                        })}
                      </div>

                      {assignment.status === "in_progress" && upcoming && (
                        <button
                          onClick={() => handleAdvance(assignment.id, upcoming)}
                          disabled={updatingId === assignment.id}
                          className="bg-[#E63946] hover:bg-[#C62839] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all whitespace-nowrap"
                        >
                          {updatingId === assignment.id
                            ? "กำลังอัปเดต..."
                            : `อัปเดต: ${DELIVERY_STATUS_LABELS[upcoming]}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
