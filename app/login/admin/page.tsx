"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";
import { ShieldCheck } from "lucide-react";

export default function TrueAdminLoginPage() {
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
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen flex items-center justify-center p-4">
      <div className="bg-slate-900 p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-800">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md mb-4">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            WeMove <span className="text-emerald-500">×</span> BOTNOI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            Admin Portal — ผู้ดูแลระบบเท่านั้น
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-950/50 border border-rose-900 text-rose-400 text-xs font-semibold rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1.5">
              อีเมลผู้ดูแลระบบ (Email)
            </label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-4 top-4.5 text-slate-500" />
              <input
                type="email"
                placeholder="admin@yourcompany.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-slate-500 transition-all text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-4 top-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-slate-500 transition-all text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md text-sm mt-2"
          >
            <i className="fa-solid fa-right-to-bracket mr-2" />
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบผู้ดูแลระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
