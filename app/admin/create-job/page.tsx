"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/use-require-auth";
import { createJob, ApiError, type CargoType, type VehicleType } from "@/lib/api";
import { CARGO_TYPES, VEHICLE_TYPES } from "@/lib/job-constants";
// 🌟 แก้ไข Path ให้ถอยออกไปหาโฟลเดอร์ components ด้านนอกตรง ๆ
import { Calendar } from "../../../components/ui/calendar";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { ArrowLeft, Clock } from "lucide-react";

const ADMIN_ROLES = ["admin", "shipper"];

export default function CreateJobPage() {
  const router = useRouter();
  const { user, token, loading } = useRequireAuth("/login/admin", ADMIN_ROLES);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00:00");

  const [formData, setFormData] = useState({
    title: "",
    origin: "",
    destination: "",
    cargoType: CARGO_TYPES[0].value,
    vehicleType: VEHICLE_TYPES[0].value,
    weight: "",
    price: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);

    const jobDatetime =
      selectedDate && selectedTime
        ? new Date(`${selectedDate.toISOString().slice(0, 10)}T${selectedTime}`).toISOString()
        : undefined;

    try {
      await createJob(token, {
        title: formData.title,
        pickupLocation: formData.origin,
        dropoffLocation: formData.destination,
        cargoType: formData.cargoType,
        vehicleType: formData.vehicleType,
        weight: formData.weight ? Number(formData.weight) : undefined,
        price: formData.price ? Number(formData.price) : undefined,
        jobDatetime,
      });
      alert("ลงประกาศจ้างงานสำเร็จเรียบร้อยแล้ว! งานจะถูกส่งไปที่หน้ารับงานของคนขับ");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

        <div className="mb-8 border-b border-gray-100 pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition mb-3"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            กลับไปหน้า Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">ลงประกาศจ้างงานขนส่ง</h1>
          <p className="text-gray-500 text-sm mt-1">กรุณากรอกรายละเอียดงานและเลือกวันเวลาเดินทางให้ครบถ้วน</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ฝั่งซ้าย: ข้อมูลรายละเอียดเส้นทางและสินค้า */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่องาน / คำอธิบายสั้นๆ</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น ขนส่งสินค้าไปคลังสินค้าสมุทรปราการ"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จุดรับสินค้า (ต้นทาง)</label>
                <input
                  type="text"
                  name="origin"
                  required
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="เช่น กรุงเทพฯ"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">จุดส่งสินค้า (ปลายทาง)</label>
                <input
                  type="text"
                  name="destination"
                  required
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="เช่น แหลมฉบัง"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทสินค้า</label>
                <Select
                  value={formData.cargoType}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, cargoType: v as CargoType }))}
                >
                  <SelectTrigger className="h-auto w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CARGO_TYPES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทรถที่ต้องการ</label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, vehicleType: v as VehicleType }))}
                >
                  <SelectTrigger className="h-auto w-full rounded-lg border-gray-200 bg-gray-50 px-4 py-2.5 focus:ring-2 focus:ring-red-500 focus:bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((v) => (
                      <SelectItem key={v.value} value={v.value}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">น้ำหนักสินค้า (กก.)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="เช่น 500"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ค่าจ้างเที่ยวนี้ (บาท)</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="เช่น 18500"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* ฝั่งขวา: เลือกวันเดินทางและเวลา */}
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">กำหนดวันและเวลาเดินทาง</Label>

            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              <Calendar
                mode="single"
                className="p-3 mx-auto bg-white"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />

              <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <Label htmlFor="time-picker" className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                    ระบุเวลาออกเดินทาง
                  </Label>
                  <div className="relative grow">
                    <Input
                      id="time-picker"
                      type="time"
                      step="1"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="peer ps-9 bg-white border-gray-200 focus-visible:ring-red-500/20 focus-visible:border-red-500"
                    />
                    <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-gray-400">
                      <Clock size={16} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition active:scale-[0.99]"
              >
                {submitting ? "กำลังลงประกาศ..." : "ลงประกาศงานขนส่ง"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
