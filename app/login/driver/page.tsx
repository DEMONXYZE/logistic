"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { Truck } from "lucide-react";

export default function DriverLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(phone, password);
      // 🌟 หน่วงเวลาให้รถวิ่งโชว์ 4 วินาทีเต็ม ๆ ก่อนย้ายหน้า
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push('/driver/jobs');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      }
      setSubmitting(false); // ปิดโหลดเฉพาะตอนที่ล็อกอินพัง เพื่อให้กรอกใหม่ได้
    }
  }

  return (
    <div className="relative bg-slate-50 min-h-screen flex items-center justify-center p-4">
      
      {/* หน้าจอ Loading รถบรรทุกวิ่ง 4 วินาที */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-bounce">
              <Truck size={64} className="text-red-600 animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 animate-pulse">
              กำลังเข้าสู่ระบบ...
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              กรุณารอสักครู่ ระบบกำลังจัดเตรียมข้อมูลตารางงานพนักงาน
            </p>
          </div>
        </div>
      )}

      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/80 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
            <i className="fa-solid fa-user-gear" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ระบบคนขับรถ WeMove</h1>
          <p className="text-xs text-slate-400 mt-1">
            กรุณากรอกเบอร์โทรเพื่อเข้าตรวจตารางงานและรับสายบอท
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1">
              เบอร์โทรศัพท์มือถือ
            </label>
            <div className="relative">
              <i className="fa-solid fa-phone absolute left-4 top-5 text-slate-400" />
              <input
                type="tel"
                placeholder="09X-XXX-XXXX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-base font-bold focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700 tracking-wider"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
              รหัสผ่านพนักงาน
            </label>
            <div className="relative">
              <i className="fa-solid fa-key absolute left-4 top-4.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-base focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>
          <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md text-sm mt-2"
            >
            <i className="fa-solid fa-right-to-bracket mr-2" />
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบพนักงานขับรถ"}
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-slate-100" />
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            หรือ
          </span>
          <div className="flex-grow border-t border-slate-100" />
        </div>

        <Link
          href="/login/shipper"
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-user-shield text-slate-500" />
          สลับไปฝั่งผู้ใช้งาน
        </Link>

        <p className="text-center text-xs text-slate-400 mt-5">
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="text-slate-700 font-bold hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </div>
    </div>
  );
}