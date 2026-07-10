"use client";

import React, { useState } from "react";
// 🌟 แก้ไข Path ให้ถอยออกไปหาโฟลเดอร์ components ด้านนอกตรง ๆ
import { Calendar } from "../../../components/ui/calendar";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Clock } from "lucide-react";

export default function CreateJobPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("12:00:00");

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    cargoType: "",
    price: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🌟 แก้ตัวแดงบรรทัด 150: กำหนด Type ให้ e เป็น React.FormEvent
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      date: selectedDate ? selectedDate.toLocaleDateString("th-TH") : "",
      time: selectedTime,
    };

    console.log("ข้อมูลที่ลงประกาศจ้างงาน:", finalData);
    alert("ลงประกาศจ้างงานสำเร็จเรียบร้อยแล้ว! งานจะถูกส่งไปที่หน้ารับงานของคนขับ");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">ลงประกาศจ้างงานขนส่ง</h1>
          <p className="text-gray-500 text-sm mt-1">กรุณากรอกรายละเอียดงานและเลือกวันเวลาเดินทางให้ครบถ้วน</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ฝั่งซ้าย: ข้อมูลรายละเอียดเส้นทางและสินค้า */}
          <div className="space-y-6">
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
                <select
                  name="cargoType"
                  required
                  value={formData.cargoType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
                >
                  <option value="">-- เลือกประเภท --</option>
                  <option value="สินค้าอุปโภคบริโภค">สินค้าอุปโภคบริโภค</option>
                  <option value="ชิ้นส่วนอิเล็กทรอนิกส์">ชิ้นส่วนอิเล็กทรอนิกส์</option>
                  <option value="วัสดุก่อสร้าง">วัสดุก่อสร้าง</option>
                </select>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุเพิ่มเติม</label>
              <textarea
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                placeholder="ระบุประเภทรถ หรือข้อมูลเพิ่มเติม..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition"
              />
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
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition active:scale-[0.99]"
              >
                ลงประกาศงานขนส่ง
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}