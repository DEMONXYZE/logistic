import type { CargoType, VehicleType } from "@/lib/api";

export const CARGO_TYPES: { value: CargoType; label: string }[] = [
  { value: "general", label: "สินค้าทั่วไป" },
  { value: "refrigerated", label: "สินค้าแช่เย็น/แช่แข็ง" },
  { value: "hazardous", label: "วัตถุอันตราย / สารเคมี" },
  { value: "fragile", label: "สินค้าแตกหักง่าย" },
  { value: "livestock", label: "สัตว์มีชีวิต" },
  { value: "bulk", label: "สินค้าเทกอง (เช่น ทราย หิน)" },
];

export const VEHICLE_TYPES: { value: VehicleType; label: string }[] = [
  { value: "pickup", label: "กระบะ (Pickup)" },
  { value: "4-wheel", label: "รถ 4 ล้อ" },
  { value: "6-wheel", label: "รถ 6 ล้อ" },
  { value: "10-wheel", label: "รถ 10 ล้อ" },
  { value: "trailer", label: "รถพ่วง (Trailer)" },
];

export const CARGO_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CARGO_TYPES.map((c) => [c.value, c.label])
);

export const VEHICLE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  VEHICLE_TYPES.map((v) => [v.value, v.label])
);

export const JOB_STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  assigned: "bg-sky-100 text-sky-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  open: "เปิดรับงาน",
  assigned: "มีคนขับรับแล้ว",
  in_progress: "กำลังขนส่ง",
  completed: "เสร็จสิ้น",
  cancelled: "ยกเลิกแล้ว",
};

export const OFFER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  expired: "bg-slate-200 text-slate-600",
};

export const OFFER_STATUS_LABELS: Record<string, string> = {
  pending: "รอคนขับตอบรับ",
  accepted: "คนขับรับงานแล้ว",
  rejected: "คนขับปฏิเสธ",
  expired: "หมดเวลาแล้ว",
};

export const ASSIGNMENT_STATUS_STYLES: Record<string, string> = {
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  in_progress: "กำลังดำเนินการ",
  completed: "ส่งสำเร็จแล้ว",
  cancelled: "ยกเลิกแล้ว",
};

export const DELIVERY_STATUS_STEPS: { value: "pickup" | "in_transit" | "delivered"; label: string }[] = [
  { value: "pickup", label: "รับสินค้าแล้ว" },
  { value: "in_transit", label: "กำลังเดินทาง" },
  { value: "delivered", label: "ส่งสำเร็จ" },
];

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pickup: "รับสินค้าแล้ว",
  in_transit: "กำลังเดินทาง",
  delivered: "ส่งสำเร็จ",
  cancelled: "ยกเลิก",
};

export function formatJobDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatJobDateTime(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
