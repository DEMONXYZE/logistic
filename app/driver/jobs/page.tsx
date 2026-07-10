"use client";

import React, { useState } from "react";

// สร้างข้อมูลจำลองของงานขนส่งสินค้า
const initialJobs = [
  {
    id: "JOB-001",
    route: "กรุงเทพฯ → แหลมฉบัง",
    type: "สินค้าอุปโภคบริโภค",
    price: "18,500 บาท",
    date: "12 กรกฎาคม 2026",
    status: "ว่าง",
  },
  {
    id: "JOB-002",
    route: "อยุธยา → เชียงใหม่",
    type: "ชิ้นส่วนอิเล็กทรอนิกส์",
    price: "32,000 บาท",
    date: "14 กรกฎาคม 2026",
    status: "ว่าง",
  },
  {
    id: "JOB-003",
    route: "ชลบุรี → โคราช",
    type: "วัสดุก่อสร้าง",
    price: "22,500 บาท",
    date: "15 กรกฎาคม 2026",
    status: "ว่าง",
  },
];

export default function DriverJobsPage() {
  const [jobs, setJobs] = useState(initialJobs);

  // ฟังก์ชันเวลากดปุ่มรับงาน
  const handleAcceptJob = (id: string) => {
    if (confirm("คุณต้องการกดรับงานขนส่งนี้ใช่หรือไม่?")) {
      setJobs(
        jobs.map((job) =>
          job.id === id ? { ...job, status: "กำลังวิ่งงาน" } : job
        )
      );
      alert("รับงานสำเร็จ! กรุณาเตรียมตัวออกเดินทาง");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* ส่วนหัวของหน้าเว็บ */}
      <div className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">รายการงานขนส่งสินค้า</h1>
        <p className="text-gray-500">เลือกงานที่ต้องการและกดปุ่มเพื่อรับงาน (เฉพาะสิทธิ์พนักงานขับรถ)</p>
      </div>

      {/* การ์ดรายการงาน */}
      <div className="max-w-5xl mx-auto grid gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between transition hover:shadow-md"
          >
            {/* ข้อมูลรายละเอียดงาน */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                  {job.id}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    job.status === "ว่าง"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">{job.route}</h2>
              
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                <div>📦 ประเภท: <span className="text-gray-700">{job.type}</span></div>
                <div>📅 วันเดินทาง: <span className="text-gray-700">{job.date}</span></div>
              </div>
            </div>

            {/* ส่วนราคาและปุ่มกดรับงาน */}
            <div className="mt-6 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 flex items-center justify-between md:justify-end gap-6">
              <div className="text-left md:text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider">ค่าจ้างเที่ยวนี้</p>
                <p className="text-2xl font-black text-red-600">{job.price}</p>
              </div>

              {job.status === "ว่าง" ? (
                <button
                  onClick={() => handleAcceptJob(job.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-sm transition active:scale-95"
                >
                  กดรับงาน
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-200 text-gray-400 font-semibold px-6 py-3 rounded-lg cursor-not-allowed"
                >
                  รับงานแล้ว
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}