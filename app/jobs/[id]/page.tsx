"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);
  const [offerSuccess, setOfferSuccess] = useState<string | null>(null);

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

  async function handleSendOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !id || !selectedDriverId) return;
    if (activeOfferedDriverIds.has(selectedDriverId)) {
      setOfferError("เสนองานให้คนขับคนนี้ไปแล้ว รอผลตอบรับก่อน");
      return;
    }
    setOfferSubmitting(true);
    setOfferError(null);
    setOfferSuccess(null);
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const offer = await sendJobOffer(token, id, { driverId: selectedDriverId, expiresAt });
      setOffers((prev) => [offer, ...prev]);
      setOfferSuccess("ส่ง Offer ให้คนขับเรียบร้อยแล้ว (หมดอายุใน 24 ชม.)");
      setSelectedDriverId("");
    } catch (err) {
      setOfferError(err instanceof ApiError ? err.message : "ส่ง Offer ไม่สำเร็จ");
    } finally {
      setOfferSubmitting(false);
    }
  }

  function driverLabel(driverId: string) {
    const d = drivers.find((x) => x.userId === driverId);
    return d ? `${d.licenseNo} · ${VEHICLE_TYPE_LABELS[d.carType] ?? d.carType}` : driverId;
  }

  if (loading || !user) return null;

  const isShipperOrAdmin = user.role === "admin" || user.role === "shipper";
  const canCancel = isShipperOrAdmin && job && job.status !== "cancelled" && job.status !== "completed";
  const canOffer = isShipperOrAdmin && job && job.status === "open";

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 flex items-center justify-center">
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
                <h3 className="text-base font-bold text-gray-900 mb-3">เสนองานให้คนขับ</h3>

                <form onSubmit={handleSendOffer} className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                    <SelectTrigger className="h-auto flex-grow w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:bg-white">
                      <SelectValue placeholder="-- เลือกคนขับ --" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((d) => (
                        <SelectItem key={d.userId} value={d.userId}>
                          {d.licenseNo} · {VEHICLE_TYPE_LABELS[d.carType] ?? d.carType} · คะแนน{" "}
                          {d.currentScore} · {d.availability === "available" ? "ว่าง" : "ไม่ว่าง"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="submit"
                    disabled={offerSubmitting || !selectedDriverId}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all whitespace-nowrap"
                  >
                    {offerSubmitting ? "กำลังส่ง..." : "ส่ง Offer"}
                  </button>
                </form>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  {availableDrivers.length === 0
                    ? "เสนองานให้คนขับที่มีอยู่ครบทุกคนแล้ว รอผลตอบรับก่อนเสนอเพิ่ม"
                    : "Offer จะหมดอายุอัตโนมัติใน 24 ชั่วโมงหากคนขับไม่ตอบรับ · คนขับที่เสนอไปแล้วจะไม่ขึ้นในลิสต์ซ้ำ"}
                </p>

                {offerError && <p className="text-xs text-rose-500 font-semibold mt-2">{offerError}</p>}
                {offerSuccess && (
                  <p className="text-xs text-emerald-600 font-semibold mt-2">{offerSuccess}</p>
                )}
              </div>
            )}

            <div className="pt-6 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Offer ที่ส่งไปแล้ว ({offers.length})
              </h3>

              {offersLoading ? (
                <p className="text-sm text-gray-400 py-4 text-center">กำลังโหลด...</p>
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
