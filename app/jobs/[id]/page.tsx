"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Search, Truck, ShieldCheck, Scale, Info } from "lucide-react"; // 🌟 เพิ่มไอคอนสวยๆ สำหรับ Modal รถบรรทุก
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  getJob,
  cancelJob,
  listDrivers,
  sendJobOffer,
  listJobOffers,
  ApiError,
  type Job,
  type Driver,
  type JobOffer,
} from "@/lib/api";
import {
  JOB_STATUS_STYLES,
  JOB_STATUS_LABELS,
  CARGO_TYPE_LABELS,
  VEHICLE_TYPE_LABELS,
  OFFER_STATUS_STYLES,
  OFFER_STATUS_LABELS,
  formatJobDateTime,
} from "@/lib/job-constants";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, loading } = useRequireAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [driverPage, setDriverPage] = useState(1);
  const [driverSort, setDriverSort] = useState<"score" | "availability">("score");
  const [driverSearch, setDriverSearch] = useState("");
  const [offeringDriverId, setOfferingDriverId] = useState<string | null>(null);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

  const DRIVERS_PER_PAGE = 10;

  useEffect(() => {
    if (!token || !id) return;
    getJob(token, id)
      .then(setJob)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "โหลดรายละเอียดงานไม่สำเร็จ")
      )
      .finally(() => setJobLoading(false));
  }, [token, id]);

  useEffect(() => {
    if (!token || !id) return;
    listDrivers(token)
      .then((data) => setDrivers(data ?? []))
      .catch(() => {});
    listJobOffers(token, id)
      .then((data) => setOffers(data ?? []))
      .catch(() => {})
      .finally(() => setOffersLoading(false));
  }, [token, id]);

  async function handleCancel() {
    if (!token || !job) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelJob(token, job.id);
      setJob({ ...job, status: "cancelled" });
    } catch (err) {
      setCancelError(err instanceof ApiError ? err.message : "ยกเลิกงานไม่สำเร็จ");
    } finally {
      setCancelling(false);
      setConfirmingCancel(false);
    }
  }

  const activeOfferedDriverIds = new Set(
    offers
      .filter((o) => o.offerStatus === "pending" || o.offerStatus === "accepted")
      .map((o) => o.driverId)
  );
  const availableDrivers = drivers.filter((d) => !activeOfferedDriverIds.has(d.userId));
  const sortedAvailableDrivers = [...availableDrivers].sort((a, b) => {
    if (driverSort === "availability") {
      if (a.availability !== b.availability) {
        return a.availability === "available" ? -1 : 1;
      }
      return b.currentScore - a.currentScore;
    }
    return b.currentScore - a.currentScore;
  });
  const searchedAvailableDrivers = sortedAvailableDrivers.filter((d) =>
    d.fullName.toLowerCase().includes(driverSearch.trim().toLowerCase())
  );
  const totalDriverPages = Math.max(1, Math.ceil(searchedAvailableDrivers.length / DRIVERS_PER_PAGE));
  const safeDriverPage = Math.min(driverPage, totalDriverPages);
  const pagedDrivers = searchedAvailableDrivers.slice(
    (safeDriverPage - 1) * DRIVERS_PER_PAGE,
    safeDriverPage * DRIVERS_PER_PAGE
  );

  async function handleOfferToDriver(driverId: string) {
    if (!token || !id) return;
    setOfferingDriverId(driverId);
    setOfferError(null);
    setOfferSuccess(null);
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const offer = await sendJobOffer(token, id, { driverId, expiresAt });
      setOffers((prev) => [offer, ...prev]);
      setOfferSuccess("ส่ง Offer ให้คนขับเรียบร้อยแล้ว (หมดอายุใน 24 ชม.)");
    } catch (err) {
      setOfferError(err instanceof ApiError ? err.message : "ส่ง Offer ไม่สำเร็จ");
    } finally {
      setOfferingDriverId(null);
    }
  }

  function driverLabel(driverId: string) {
    const d = drivers.find((x) => x.userId === driverId);
    return d ? `${d.licenseNo} · ${VEHICLE_TYPE_LABELS[d.carType] ?? d.carType}` : driverId;
  }

  function initialsOf(name: string) {
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  }

  const acceptedOffer = offers.find((o) => o.offerStatus === "accepted");
  const acceptedDriver = acceptedOffer ? drivers.find((d) => d.userId === acceptedOffer.driverId) : undefined;

  // 🚚 LOGIC คำนวณเปอร์เซ็นต์ความจุคนขับ (ตั้ง Max บรรทุกสมมติที่ 1,000 กก. สำหรับรถกระบะทั่วไป)
  const maxWeightLimit = 1000; 
  const rawPercentage = job && job.weight ? (job.weight / maxWeightLimit) * 100 : 0;
  // UX Hack: ถ้าน้ำหนักสินค้ามากกว่า 0 แต่หารแล้วไม่ถึง 1% ให้ปัดขึ้นเป็น 1% เสมอเพื่อให้กราฟขยับไม่นิ่งจืด
  const displayPercentage = job && job.weight > 0 ? Math.max(1, Math.round(rawPercentage)) : 0;

  if (loading || !user) return null;

  const isShipperOrAdmin = user.role === "admin" || user.role === "shipper";
  const canCancel = isShipperOrAdmin && job && job.status !== "cancelled" && job.status !== "completed";
  const canOffer = isShipperOrAdmin && job && job.status === "open";

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 flex flex-col items-center justify-center font-[family-name:var(--font-k2d)]">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        <div className="mb-8 border-b border-gray-100 pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition mb-3"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            กลับไปหน้า Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">รายละเอียดงานขนส่ง</h1>
        </div>

        {jobLoading ? (
          <p className="text-sm text-gray-400 py-10 text-center">กำลังโหลด...</p>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl px-4 py-3">
            {error}
          </div>
        ) : !job ? (
          <p className="text-sm text-gray-400 py-10 text-center">ไม่พบงานนี้</p>
        ) : (
          <div className="space-y-8">
            
            {/* 🌟 ส่วนบนสุด: การ์ดพื้นที่ความจุรถบรรทุกของงานชิ้นนี้ */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                  <Truck size={28} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">พื้นที่ความจุรถบรรทุกชิ้นนี้</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    รถจองจ้างงาน: {VEHICLE_TYPE_LABELS[job.vehicleType] ?? job.vehicleType}
                  </p>
                  <p className="text-xs font-bold text-gray-600 mt-1">
                    น้ำหนักปัจจุบัน: <span className="text-red-600">{job.weight ? job.weight.toLocaleString() : 0}</span> / {maxWeightLimit.toLocaleString()} กก.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* วงล้อแสดงเปอร์เซ็นต์สีชมพูเด้งดุ๊กดิ๊ก */}
                <div className="bg-gradient-to-r from-rose-500 to-rose-400 text-white font-black text-2xl px-6 py-3 rounded-xl shadow-md tracking-wider animate-pulse">
                  {displayPercentage}%
                </div>

                {/* 🌟 1. ปุ่มเปิด Pop-up รายละเอียดข้อมูลตู้/ท้ายรถกระบะ */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-xs font-bold text-gray-500 hover:text-red-600 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-xl flex items-center gap-1 transition-all">
                      <Info size={14} />
                      ดูรายละเอียดรถ
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Truck className="text-red-600" />
                        ข้อมูลจำเพาะความจุรถขนส่ง
                      </DialogTitle>
                      <DialogDescription>
                        รายละเอียดขนาดมิติตู้และพิกัดการรับน้ำหนักของประเภทรถที่เลือก
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="mt-4 space-y-4 text-sm">
                      <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ประเภทโครงสร้างรถ:</span>
                          <span className="font-bold text-gray-800">{VEHICLE_TYPE_LABELS[job.vehicleType] ?? job.vehicleType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">มิติตู้บรรทุก (กว้าง×ยาว×สูง):</span>
                          <span className="font-bold text-gray-800">1.8 × 2.4 × 2.0 เมตร</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">ปริมาตรรองรับสูงสุด:</span>
                          <span className="font-bold text-gray-800">8.6 ลูกบาศก์เมตร (CBM)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-slate-100 p-3 rounded-xl flex items-center gap-2.5">
                          <Scale size={20} className="text-amber-500 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">พิกัดน้ำหนักสูงสุด</p>
                            <p className="text-xs font-bold text-gray-700">{maxWeightLimit.toLocaleString()} กก.</p>
                          </div>
                        </div>
                        <div className="border border-slate-100 p-3 rounded-xl flex items-center gap-2.5">
                          <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">มาตรฐานความปลอดภัย</p>
                            <p className="text-xs font-bold text-gray-700">ผ่านการตรวจสภาพ</p>
                          </div>
                        </div>
                      </div>

                      {acceptedDriver ? (
                        <div className="border border-emerald-100 bg-emerald-50/40 p-3 rounded-xl">
                          <p className="text-xs font-bold text-emerald-800 mb-1">🚚 ข้อมูลคนขับรับงาน:</p>
                          <p className="text-xs font-medium text-gray-600">คุณ {acceptedDriver.fullName} (ทะเบียน {acceptedDriver.licenseNo})</p>
                        </div>
                      ) : (
                        <p className="text-xs text-center text-gray-400 italic pt-1">
                          * ข้อมูลคนขับและเลขทะเบียนจะปรากฏเมื่อมีผู้ขับกดรับงานนี้แล้ว
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ส่วนข้อมูลรายละเอียดตัวงานเดิม */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap ${
                    JOB_STATUS_STYLES[job.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {JOB_STATUS_LABELS[job.status] ?? job.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">เส้นทาง</p>
                  <p className="text-sm font-bold text-gray-800">
                    {job.pickupLocation} <span className="text-gray-400 mx-1">→</span>{" "}
                    {job.dropoffLocation}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    ค่าจ้างเที่ยวนี้
                  </p>
                  <p className="text-lg font-bold text-gray-800">
                    {job.price ? `${job.price.toLocaleString()} บาท` : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    กำหนดเวลาเดินทาง
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {formatJobDateTime(job.jobDatetime)}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    น้ำหนักสินค้า
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {job.weight ? `${job.weight.toLocaleString()} กก.` : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    ประเภทสินค้า
                  </p>
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-lg inline-block">
                    {CARGO_TYPE_LABELS[job.cargoType] ?? job.cargoType}
                  </span>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    ประเภทรถ
                  </p>
                  <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-lg inline-block">
                    {VEHICLE_TYPE_LABELS[job.vehicleType] ?? job.vehicleType}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase mb-1">
                    สร้างเมื่อ
                  </p>
                  <p className="text-xs text-gray-500">{formatJobDateTime(job.createdAt)}</p>
                </div>

                {canCancel && (
                  <div className="text-right">
                    {cancelError && (
                      <p className="text-xs text-rose-500 font-semibold mb-1">{cancelError}</p>
                    )}
                    {confirmingCancel ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">ยืนยันยกเลิกงานนี้?</span>
                        <button
                          onClick={() => setConfirmingCancel(false)}
                          disabled={cancelling}
                          className="text-xs font-bold text-gray-500 hover:text-gray-700 disabled:opacity-60 border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all"
                        >
                          ไม่ยกเลิก
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-60 px-3 py-2 rounded-lg transition-all"
                        >
                          {cancelling ? "กำลังยกเลิก..." : "ยืนยัน"}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingCancel(true)}
                        className="text-sm font-bold text-rose-600 hover:text-rose-700 border border-rose-200 hover:bg-rose-50 px-4 py-2 rounded-lg transition-all"
                      >
                        ยกเลิกงาน
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {canOffer && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-gray-900">เสนองานให้คนขับ</h3>

                  <Dialog
                    open={driverDialogOpen}
                    onOpenChange={(open) => {
                      setDriverDialogOpen(open);
                      if (open) {
                        setDriverPage(1);
                        setOfferError(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all whitespace-nowrap"
                      >
                        เลือกคนขับเพื่อเสนองาน
                      </button>
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>เลือกคนขับ</DialogTitle>
                        <DialogDescription>
                          คนขับที่ยังไม่ได้เสนองานนี้ให้ ({availableDrivers.length} คน)
                        </DialogDescription>
                      </DialogHeader>

                      {availableDrivers.length === 0 ? (
                        <p className="text-sm text-gray-400 py-8 text-center">
                          เสนองานให้คนขับที่มีอยู่ครบทุกคนแล้ว รอผลตอบรับก่อนเสนอเพิ่ม
                        </p>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">เรียงตาม:</span>
                              <button
                                onClick={() => {
                                  setDriverSort("score");
                                  setDriverPage(1);
                                }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                  driverSort === "score"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                คะแนนสูงสุด
                              </button>
                              <button
                                onClick={() => {
                                  setDriverSort("availability");
                                  setDriverPage(1);
                                }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                                  driverSort === "availability"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                }`}
                              >
                                ว่างก่อน
                              </button>
                            </div>

                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400 pointer-events-none" />
                              <input
                                type="text"
                                value={driverSearch}
                                onChange={(e) => {
                                  setDriverSearch(e.target.value);
                                  setDriverPage(1);
                                }}
                                placeholder="ค้นหาชื่อคนขับ..."
                                className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                              />
                            </div>
                          </div>

                          {searchedAvailableDrivers.length === 0 ? (
                            <p className="text-sm text-gray-400 py-8 text-center">
                              ไม่พบคนขับที่ชื่อตรงกับ &ldquo;{driverSearch}&rdquo;
                            </p>
                          ) : (
                            <div className="overflow-x-auto -mx-2">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-[11px] font-semibold text-gray-400 uppercase border-b border-gray-100">
                                    <th className="px-2 py-2">คนขับ</th>
                                    <th className="px-2 py-2">คะแนน</th>
                                    <th className="px-2 py-2">สถานะ</th>
                                    <th className="px-2 py-2 text-right">&nbsp;</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {pagedDrivers.map((d) => (
                                    <tr key={d.userId}>
                                      <td className="px-2 py-2.5">
                                        <p className="font-bold text-gray-800">{d.fullName}</p>
                                        <p className="text-xs text-gray-400">
                                          {d.licenseNo} · {VEHICLE_TYPE_LABELS[d.carType] ?? d.carType}
                                        </p>
                                      </td>
                                      <td className="px-2 py-2.5 font-bold text-gray-700 whitespace-nowrap">
                                        {d.currentScore}
                                      </td>
                                      <td className="px-2 py-2.5">
                                        <span
                                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap ${
                                            d.availability === "available"
                                              ? "bg-emerald-100 text-emerald-700"
                                              : "bg-gray-100 text-gray-500"
                                          }`}
                                        >
                                          {d.availability === "available" ? "ว่าง" : "ไม่ว่าง"}
                                        </span>
                                      </td>
                                      <td className="px-2 py-2.5 text-right">
                                        <button
                                          onClick={() => handleOfferToDriver(d.userId)}
                                          disabled={offeringDriverId === d.userId}
                                          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                                        >
                                          {offeringDriverId === d.userId ? "กำลังส่ง..." : "เสนองาน"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {totalDriverPages > 1 && (
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                              <button
                                onClick={() => setDriverPage((p) => Math.max(1, p - 1))}
                                disabled={safeDriverPage === 1}
                                className="text-xs font-bold text-gray-500 hover:text-gray-800 disabled:opacity-40"
                              >
                                ← ก่อนหน้า
                              </button>
                              <span className="text-xs text-gray-400">
                                หน้า {safeDriverPage} / {totalDriverPages}
                              </span>
                              <button
                                onClick={() => setDriverPage((p) => Math.min(totalDriverPages, p + 1))}
                                disabled={safeDriverPage === totalDriverPages}
                                className="text-xs font-bold text-gray-500 hover:text-gray-800 disabled:opacity-40"
                              >
                                หน้าถัดไป →
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      <p className="text-[11px] text-gray-400 mt-3">
                        Offer จะหมดอายุอัตโนมัติใน 24 ชั่วโมงหากคนขับไม่ตอบรับ
                      </p>
                      {offerError && (
                        <p className="text-xs text-rose-500 font-semibold mt-2">{offerError}</p>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                {offerSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">{offerSuccess}</p>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                {acceptedOffer ? "คนขับที่รับงานนี้" : `Offer ที่ส่งไปแล้ว (${offers.length})`}
              </h3>

              {offersLoading ? (
                <p className="text-sm text-gray-400 py-4 text-center">กำลังโหลด...</p>
              ) : acceptedOffer ? (
                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {acceptedDriver ? initialsOf(acceptedDriver.fullName) : "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {acceptedDriver?.fullName ?? "กำลังโหลด..."}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {acceptedDriver
                          ? `เลขใบขับขี่ ${acceptedDriver.licenseNo} · ${
                              VEHICLE_TYPE_LABELS[acceptedDriver.carType] ?? acceptedDriver.carType
                            }`
                          : ""}
                      </p>
                      {acceptedDriver?.phone && (
                        <p className="text-xs text-gray-400">{acceptedDriver.phone}</p>
                      )}
                    </div>
                  </div>
                  {acceptedDriver && (
                    <div className="text-center flex-shrink-0">
                      <p className="text-2xl font-black text-emerald-600">
                        {acceptedDriver.currentScore}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">คะแนนขับขี่</p>
                    </div>
                  )}
                </div>
              ) : offers.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">ยังไม่มี offer ที่ส่งไป</p>
              ) : (
                <div className="space-y-2">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {driverLabel(offer.driverId)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          หมดอายุ: {formatJobDateTime(offer.expiresAt)}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-lg whitespace-nowrap ${
                          OFFER_STATUS_STYLES[offer.offerStatus] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {OFFER_STATUS_LABELS[offer.offerStatus] ?? offer.offerStatus}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}