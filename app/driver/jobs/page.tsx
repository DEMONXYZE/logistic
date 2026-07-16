"use client";

import { useEffect, useState } from "react";
import DriverSidebar from "@/app/components/DriverSidebar";
import { NotificationBell } from "@/app/components/NotificationBell";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  listMyOffers,
  acceptOffer,
  rejectOffer,
  getJob,
  ApiError,
  type JobOffer,
  type Job,
} from "@/lib/api";
import { CARGO_TYPE_LABELS, VEHICLE_TYPE_LABELS, formatJobDateTime } from "@/lib/job-constants";

const DRIVER_ROLES = ["driver"];

type OfferWithJob = JobOffer & { job: Job | null };

export default function DriverJobsPage() {
  const { user, token, loading } = useRequireAuth("/login/driver", DRIVER_ROLES);

  const [offers, setOffers] = useState<OfferWithJob[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  const [actioningId, setActioningId] = useState<string | null>(null);
  const [confirmingRejectId, setConfirmingRejectId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadOffers();
  }, [token]);

  async function loadOffers() {
    if (!token) return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const data = (await listMyOffers(token)) ?? [];
      const pending = data.filter((o) => o.offerStatus === "pending");
      const withJobs = await Promise.all(
        pending.map(async (offer) => {
          const job = await getJob(token, offer.jobId).catch(() => null);
          return { ...offer, job };
        })
      );
      setOffers(withJobs);
    } catch (err) {
      setOffersError(err instanceof ApiError ? err.message : "โหลดรายการงานไม่สำเร็จ");
    } finally {
      setOffersLoading(false);
    }
  }

  async function handleAccept(offerId: string) {
    if (!token) return;
    setActioningId(offerId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await acceptOffer(token, offerId);
      setActionSuccess("รับงานสำเร็จ! ดูงานที่รับแล้วได้ที่เมนู \"งานของฉัน\"");
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "รับงานไม่สำเร็จ");
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(offerId: string) {
    if (!token) return;
    setActioningId(offerId);
    setActionError(null);
    setActionSuccess(null);
    try {
      await rejectOffer(token, offerId);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "ปฏิเสธงานไม่สำเร็จ");
    } finally {
      setActioningId(null);
      setConfirmingRejectId(null);
    }
  }

  if (loading || !user || !DRIVER_ROLES.includes(user.role)) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <DriverSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">งานที่รับได้</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              รายการงานที่มีคนเสนอมาให้คุณโดยตรง กดรับหรือปฏิเสธได้เลย
            </p>
          </div>
          <NotificationBell />
        </header>

        <div className="p-6 md:p-8">
          {actionError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl px-4 py-3">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl px-4 py-3">
              {actionSuccess}
            </div>
          )}

          {offersLoading ? (
            <p className="text-sm text-slate-400 py-10 text-center">กำลังโหลด...</p>
          ) : offersError ? (
            <p className="text-sm text-rose-500 py-10 text-center">{offersError}</p>
          ) : offers.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">
              ยังไม่มีงานเสนอเข้ามาตอนนี้
            </p>
          ) : (
            <div className="grid gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-6"
                >
                  {/* หัวการ์ด: badge สถานะ + เส้นทาง + ราคา */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                          {offer.job?.title ?? "งานขนส่ง"}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200">
                          ว่าง
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800">
                        {offer.job
                          ? `${offer.job.pickupLocation} → ${offer.job.dropoffLocation}`
                          : "-"}
                      </h2>
                    </div>

                    <div className="text-left md:text-right flex-shrink-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        ค่าจ้างเที่ยวนี้
                      </p>
                      <p className="text-2xl font-black text-[#E63946] whitespace-nowrap">
                        {offer.job?.price ? `${offer.job.price.toLocaleString()} บาท` : "-"}
                      </p>
                    </div>
                  </div>

                  {/* ข้อมูลงาน: กรอบมีหัวข้อ แบบเดียวกับ dashboard */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">
                        ประเภทสินค้า
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {offer.job ? CARGO_TYPE_LABELS[offer.job.cargoType] ?? offer.job.cargoType : "-"}
                      </p>
                    </div>
                    <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-4">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">
                        ประเภทรถ
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {offer.job ? VEHICLE_TYPE_LABELS[offer.job.vehicleType] ?? offer.job.vehicleType : "-"}
                      </p>
                    </div>
                    <div className="space-y-1 sm:border-l sm:border-slate-100 sm:pl-4">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase">
                        วันเดินทาง
                      </p>
                      <p className="text-sm font-bold text-slate-700">
                        {offer.job ? formatJobDateTime(offer.job.jobDatetime) : "-"}
                      </p>
                    </div>
                  </div>

                  {/* ปุ่มจัดการ */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    {confirmingRejectId === offer.id ? (
                      <>
                        <button
                          onClick={() => setConfirmingRejectId(null)}
                          disabled={actioningId === offer.id}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 whitespace-nowrap"
                        >
                          ไม่ปฏิเสธ
                        </button>
                        <button
                          onClick={() => handleReject(offer.id)}
                          disabled={actioningId === offer.id}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all disabled:opacity-60 whitespace-nowrap"
                        >
                          {actioningId === offer.id ? "กำลังปฏิเสธ..." : "ยืนยันปฏิเสธ"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setConfirmingRejectId(offer.id)}
                          disabled={actioningId === offer.id}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 whitespace-nowrap"
                        >
                          ปฏิเสธ
                        </button>
                        <button
                          onClick={() => handleAccept(offer.id)}
                          disabled={actioningId === offer.id}
                          className="bg-[#E63946] hover:bg-[#C62839] text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap"
                        >
                          {actioningId === offer.id ? "กำลังรับงาน..." : "กดรับงาน"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
