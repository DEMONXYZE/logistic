"use client";

import AdminSidebar from "@/app/components/AdminSidebar";
import { useRequireAuth } from "@/lib/use-require-auth";

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();
  if (loading || !user) return null;

  return (
    <div className="bg-[#f8f9fa] text-slate-800 h-screen w-screen flex overflow-hidden font-[family-name:var(--font-k2d)]">
      <AdminSidebar />

      <main className="flex-grow flex flex-col h-screen overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ระบบวิเคราะห์ข้อมูลพนักงานขับรถขนส่งและตรวจสอบความเสี่ยง
            </p>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    รายละเอียดใบงานขนส่งล่าสุด
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                      WS
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">นายสมชาย ดีใจ</h4>
                      <p className="text-[10px] text-slate-400">
                        รหัสพนักงาน: WM-701234 ● คนขับรถพ่วง 18 ล้อ
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">คะแนนขับขี่</span>
                  <span className="bg-emerald-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    4.8
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">
                    ค่าจ้างเที่ยววิ่งนี้
                  </p>
                  <p className="text-xs text-emerald-600 font-bold">บันทึกวางบิลสำเร็จ</p>
                  <p className="text-2xl font-bold text-slate-800 pt-1">18,500 บาท</p>
                </div>
                <div className="space-y-1 border-l border-slate-100 pl-0 md:pl-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">
                    เส้นทางเดินรถ
                  </p>
                  <p className="text-xs text-slate-700 font-bold">
                    กรุงเทพฯ <span className="text-slate-400 mx-1">→</span> แหลมฉบัง
                  </p>
                  <div className="pt-3">
                    <p className="text-[10px] text-slate-400 uppercase">กำหนดเวลาถึงปลายทาง</p>
                    <p className="text-sm font-bold text-slate-700">07 กรกฎาคม 2026</p>
                  </div>
                </div>
                <div className="space-y-2 border-l border-slate-100 pl-0 md:pl-4">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      สถานะงาน
                    </p>
                    <span className="bg-emerald-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg">
                      กำลังวิ่งงาน
                    </span>
                  </div>
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1">
                      ประเภทสินค้า
                    </p>
                    <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg block text-center">
                      สินค้าอุปโภคบริโภค
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-800">พื้นที่ความจุรถบรรทุก</h3>
                <span className="text-xs text-slate-400">รายละเอียด</span>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-center relative my-2 overflow-hidden h-32">
                <i className="fa-solid fa-truck text-slate-200 text-5xl absolute left-4 opacity-30" />
                <div className="bg-gradient-to-r from-rose-500 to-rose-400 text-white font-black text-3xl px-8 py-4 rounded-xl shadow-md tracking-wider animate-pulse">
                  86%
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-semibold pt-2">
                <div>
                  <p className="text-slate-700">ทะเบียน: 70-1234 กทม.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    น้ำหนักบรรทุก: 7,340 กิโลกรัม
                  </p>
                </div>
                <span className="text-emerald-500 flex items-center gap-1">
                  <i className="fa-solid fa-circle text-[8px] animate-pulse" /> กำลังขนส่ง
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">จำนวนงานรายสัปดาห์</h3>
                <button className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-arrow-down-long" />
                </button>
              </div>

              <div className="h-28 flex items-end justify-between px-2 pt-2 border-b border-slate-100 relative">
                <div className="absolute top-4 left-0 right-0 border-t border-dashed border-rose-300/60 flex items-center">
                  <span className="bg-rose-500 text-white text-[9px] px-1 rounded font-bold -mt-2">
                    เป้าหมาย: 5 เที่ยว
                  </span>
                </div>
                <div className="w-2 bg-slate-200 h-16 rounded-t-sm" />
                <div className="w-2 bg-slate-200 h-10 rounded-t-sm" />
                <div className="w-2 bg-slate-200 h-20 rounded-t-sm" />
                <div className="w-2 bg-slate-200 h-14 rounded-t-sm" />
                <div className="w-2 bg-rose-500 h-24 rounded-t-sm relative flex justify-center">
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-3 border border-white shadow" />
                </div>
                <div className="w-2 bg-slate-200 h-22 rounded-t-sm" />
                <div className="w-2 bg-slate-200 h-12 rounded-t-sm" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-2 px-1">
                <span>จ.</span>
                <span>อ.</span>
                <span>พ.</span>
                <span>พฤ.</span>
                <span>ศ.</span>
                <span>ส.</span>
                <span>อา.</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-rose-400 p-6 rounded-3xl text-white shadow-lg shadow-rose-500/10 flex flex-col justify-between relative overflow-hidden">
              <button className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center text-xs absolute right-6 top-6">
                <i className="fa-solid fa-arrow-turn-up" />
              </button>

              <div>
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                  คะแนนความแม่นยำเส้นทาง
                </p>
                <h2 className="text-5xl font-black mt-2">
                  96 <span className="text-2xl font-normal">%</span>
                </h2>
              </div>

              <div className="my-3 h-12 relative flex items-center justify-center">
                <svg
                  className="w-full h-full stroke-white/80 fill-none"
                  viewBox="0 0 100 30"
                  strokeWidth="2"
                >
                  <path d="M0,25 Q20,5 40,20 T80,10 T100,5" strokeLinecap="round" />
                  <circle cx="80" cy="10" r="2" fill="white" />
                </svg>
                <span className="absolute text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded-full top-0 right-4">
                  เส้นทางที่ดีที่สุด
                </span>
              </div>

              <p className="text-xs font-medium text-white/90">
                ระบบนำส่งพิกัดแผนที่ผ่านเบอร์คนขับเรียบร้อยแล้ว
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800">บันทึกระบบ Voice AI ล่าสุด</h3>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>

              <div className="space-y-3 flex-grow overflow-y-auto pr-1 h-24 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-600">
                    บอท
                  </div>
                  <div className="bg-slate-100 p-2 rounded-2xl rounded-tl-none max-w-[85%]">
                    <p className="text-slate-700 font-medium">
                      โทรประเมินสายล่าสุด: นายวิชัย ระวังภัย
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-rose-500 text-white p-2 rounded-2xl rounded-tr-none max-w-[85%]">
                    <p className="font-medium text-right">
                      ผลตรวจเสียง: ตรวจพบระดับเสี่ยงเพลียสะสมสูง!
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-[9px] font-bold text-white">
                    ระบบ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-2">
                <button
                  onClick={() => alert("กำลังสั่งการ Voice Bot โทรออก...")}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <i className="fa-solid fa-phone-volume text-[10px]" />
                  <span>คลิกสั่งสุ่มโทรตรวจคนขับทันที</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
