"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/80 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md mb-4">
            W
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            WeMove <span className="text-emerald-500">×</span> BOTNOI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            ระบบสำหรับผู้ใช้งาน (User Portal)
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-4.5 text-slate-400" />
              <input
                type="email"
                placeholder="user@wemove.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md text-sm mt-2"
          >
          <i className="fa-solid fa-right-to-bracket mr-2" />
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบผู้ใช้งาน"}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-100" />
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            หรือ
          </span>
          <div className="flex-grow border-t border-slate-100" />
        </div>

        <Link
          href="/login/driver"
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-truck-moving text-slate-500" />
          สลับไปฝั่งคนขับรถ
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
