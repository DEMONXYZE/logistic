"use client";

import { useEffect, useState } from "react";
import DriverSidebar from "@/app/components/DriverSidebar";
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
        </header>

        <div className="p-6 md:p-8">
          {updateError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl px-4 py-3">
              {updateError}
            </div>
          )}

          {rowsLoading ? (
            <p className="text-sm text-gray-400 py-10 text-center">กำลังโหลด...</p>
          ) : rowsError ? (
            <p className="text-sm text-rose-500 py-10 text-center">{rowsError}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">ยังไม่มีงานที่รับไว้</p>
          ) : (
            <div className="grid gap-6">
              {rows.map(({ assignment, job, timeline }) => {
                const upcoming = nextStep(timeline);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {job?.title ?? "งานขนส่ง"}
                          </span>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              ASSIGNMENT_STATUS_STYLES[assignment.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {ASSIGNMENT_STATUS_LABELS[assignment.status] ?? assignment.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {job ? `${job.pickupLocation} → ${job.dropoffLocation}` : "-"}
                        </h2>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                          <div>
                            📦 ประเภท:{" "}
                            <span className="text-gray-700">
                              {job ? CARGO_TYPE_LABELS[job.cargoType] ?? job.cargoType : "-"}
                            </span>
                          </div>
                          <div>
                            📅 วันเดินทาง:{" "}
                            <span className="text-gray-700">
                              {job ? formatJobDateTime(job.jobDatetime) : "-"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wider">ค่าจ้างเที่ยวนี้</p>
                        <p className="text-2xl font-black text-red-600">
                          {job?.price ? `${job.price.toLocaleString()} บาท` : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {DELIVERY_STATUS_STEPS.map((step) => {
                          const done = timeline.some((e) => e.status === step.value);
                          return (
                            <span
                              key={step.value}
                              className={`text-[11px] font-bold px-3 py-1 rounded-lg whitespace-nowrap ${
                                done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
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
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all whitespace-nowrap"
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
