"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register, ApiError } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CAR_TYPES = [
  { value: "pickup", label: "กระบะ (Pickup)" },
  { value: "4-wheel", label: "รถ 4 ล้อ" },
  { value: "6-wheel", label: "รถ 6 ล้อ" },
  { value: "10-wheel", label: "รถ 10 ล้อ" },
  { value: "trailer", label: "รถพ่วง (Trailer)" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"driver" | "shipper">("driver");

  const [licenseNo, setLicenseNo] = useState("");
  const [carType, setCarType] = useState(CAR_TYPES[0].value);

  const [companyName, setCompanyName] = useState("");
  const [billingAddress, setBillingAddress] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        phone,
        email,
        password,
        fullName,
        role,
        ...(role === "driver"
          ? { driver: { licenseNo, carType } }
          : { shipper: { companyName, billingAddress: billingAddress || undefined } }),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(role === "driver" ? "/login/driver" : "/login/admin");
      }, 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 py-10">
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/80 w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-md mb-4">
            W
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            WeMove <span className="text-emerald-500">×</span> BOTNOI
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
            สมัครสมาชิกใหม่
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-xl px-4 py-4 text-center">
            สมัครสมาชิกสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="สมชาย ใจดี"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+66812345678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                อีเมล
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                รหัสผ่าน
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                สมัครเป็น
              </label>
              <Select value={role} onValueChange={(v) => setRole(v as "driver" | "shipper")}>
                <SelectTrigger className="h-auto w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">คนขับรถ (Driver)</SelectItem>
                  <SelectItem value="shipper">ผู้ส่งสินค้า (Shipper)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "driver" ? (
              <>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                    เลขใบขับขี่
                  </label>
                  <input
                    type="text"
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    placeholder="DL-99999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                    ประเภทรถ
                  </label>
                  <Select value={carType} onValueChange={setCarType}>
                    <SelectTrigger className="h-auto w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-slate-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAR_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                    ชื่อบริษัท
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="บริษัท ขนส่งดี จำกัด"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-bold uppercase block mb-1.5">
                    ที่อยู่ออกใบเสร็จ (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="123 ถนน..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all text-slate-700"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md text-sm mt-2"
            >
              {submitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </form>
        )}

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-slate-100" />
          <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            หรือ
          </span>
          <div className="flex-grow border-t border-slate-100" />
        </div>

        <Link
          href="/login/admin"
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
        >
          มีบัญชีอยู่แล้ว? เข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
