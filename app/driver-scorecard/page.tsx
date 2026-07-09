"use client";

import AdminSidebar from "@/app/components/AdminSidebar";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function DriverScorecardPage() {
  const { user, loading } = useRequireAuth();
  if (loading || !user) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Driver Scorecard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบดึงข้อมูลประสิทธิภาพพฤติกรรมการขับขี่ และวิเคราะห์ความปลอดภัยทางเสียง
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 border border-emerald-200/60 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse" />
              เชื่อมต่อฐานข้อมูลคนขับแล้ว
            </span>
          </div>
        </header>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-6">
            <div className="text-center space-y-3 pt-2">
              <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-md">
                SD
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">นายสมชาย ดีใจ</h2>
                <p className="text-xs text-slate-400 mt-0.5">ทะเบียนรถ: 70-1234 กทม. (18 ล้อ)</p>
              </div>
            </div>

            <div className="space-y-3 flex-grow pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                ข้อมูลสถิติตามรอบบิล
              </p>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-gauge-high" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    ความเร็วเฉลี่ย (Avg Speed)
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800">74 กม./ชม.</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-route" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    ระยะทางรวม (Total Distance)
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800">2,350 กม.</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                    <i className="fa-solid fa-clock" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    ระยะเวลาขับรถ (Drive Time)
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-800">32 ชม.</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <span className="text-xs font-bold text-emerald-800">
                  สถานะคนขับ: พร้อมปฏิบัติงานปลอดภัย
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="text-center md:border-r border-slate-100 py-2">
                <div className="w-24 h-24 rounded-full border-[6px] border-slate-100 border-t-emerald-500 flex flex-col items-center justify-center mx-auto shadow-sm">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">94</span>
                  <span className="text-[9px] text-slate-400 font-bold -mt-0.5">คะแนนเต็ม 100</span>
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mt-3 tracking-wide">
                  คะแนนภาพรวมประจำวัน
                </p>
              </div>

              <div className="md:col-span-2 space-y-3.5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  สรุปมิติการประเมินผล
                </h3>

                {[
                  { label: "ความพร้อมด้านสุขภาพ (Health Ready)", value: 95 },
                  { label: "ทักษะการเดินทางและประหยัดพลังงาน (Travel Skill)", value: 94 },
                  { label: "ความเสถียรของน้ำเสียงตรวจบอท (Voice History)", value: 92 },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{item.label}</span>
                      <span className="text-emerald-600">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  ประวัติสายโทรบอทน้อยถอดความล่าสุด (Call Transcript)
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">บันทึกอัตโนมัติ</span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed max-h-40 overflow-y-auto pr-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[9px]">
                    บอท
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-slate-600">
                    &quot;สวัสดีครับ คุณสมชาย ดีใจ วันนี้มีกำหนดวิ่งงานขนส่งพ่วงสินค้า
                    พักผ่อนเพียงพอไหมครับ?&quot;
                  </div>
                </div>

                <div className="flex items-start gap-2.5 justify-end">
                  <div className="bg-emerald-500 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] text-right">
                    &quot;พร้อมครับ เมื่อคืนนี้ผมได้นอนเต็มอิ่มยาว 8 ชั่วโมงเต็ม
                    สุขภาพปกติไม่มีปัญหาอะไรครับ&quot;
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-[9px]">
                    คนขับ
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-emerald-500 mt-0.5">
                  <i className="fa-solid fa-square-poll-horizontal text-lg" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-800">
                      ผลการประเมินทางภาษาและอารมณ์ความรู้สึก (NLP Analysis)
                    </h4>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ผลประเมินปกติ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    โครงสร้างประโยคมีความสมบูรณ์ น้ำเสียงแจ่มใสและมั่นใจ
                    อัตราความเร็วในการพูดสม่ำเสมอ ไม่พบการพูดสั่นเครือหรือสัญญาณของภาวะอ่อนล้าสะสม
                    สรุปผ่านเกณฑ์มาตรฐานความปลอดภัย
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
