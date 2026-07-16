"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import {
  getDriverById,
  listDriverScores,
  listCallLogs,
  ApiError,
  type Driver,
  type DriverScore,
  type CallLog,
} from "@/lib/api";
import { VEHICLE_TYPE_LABELS } from "@/lib/job-constants";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// วงแหวนคะแนนที่ขนาดเติมจริงตามสัดส่วนคะแนน (ของเดิมเป็นแค่เส้นขอบตกแต่ง ไม่ได้สื่อสัดส่วนจริง)
function ScoreGauge({ score, isHighRisk }: { score: number; isHighRisk: boolean }) {
  const size = 96;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(score, 0), 100) / 100;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isHighRisk ? "#f43f5e" : "#10b981"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - pct) }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-800 tracking-tight">
          <CountUp value={Math.round(score)} duration={1.2} />
        </span>
        <span className="text-[9px] text-slate-400 font-bold -mt-0.5">คะแนนเต็ม 100</span>
      </div>
    </div>
  );
}

// แถบเปอร์เซ็นต์ที่เติมความกว้างขึ้นมาจริงพร้อมตัวเลข count-up
function ScoreBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const good = value >= 70;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span className={good ? "text-emerald-600" : "text-rose-500"}>
          <CountUp value={Math.round(value)} duration={1} formatter={(v) => `${Math.round(v)}%`} />
        </span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${good ? "bg-emerald-500" : "bg-rose-500"}`}
          initial={{ width: "0%" }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
        />
      </div>
    </div>
  );
}

export function DriverScorecardBody({
  token,
  driverId,
}: {
  token: string | null;
  driverId: string;
}) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [driverLoading, setDriverLoading] = useState(true);
  const [driverError, setDriverError] = useState<string | null>(null);

  const [scores, setScores] = useState<DriverScore[]>([]);
  const [scoresLoading, setScoresLoading] = useState(true);

  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [callLogsLoading, setCallLogsLoading] = useState(true);

  useEffect(() => {
    if (!token || !driverId) return;

    getDriverById(token, driverId)
      .then(setDriver)
      .catch((err) =>
        setDriverError(err instanceof ApiError ? err.message : "โหลดข้อมูลคนขับไม่สำเร็จ")
      )
      .finally(() => setDriverLoading(false));

    listDriverScores(token, driverId)
      .then((data) => setScores(data ?? []))
      .catch(() => setScores([]))
      .finally(() => setScoresLoading(false));

    listCallLogs(token, { limit: 100 })
      .then((data) => setCallLogs(data ?? []))
      .catch(() => setCallLogs([]))
      .finally(() => setCallLogsLoading(false));
  }, [token, driverId]);

  const latestScore = useMemo(
    () =>
      [...scores].sort(
        (a, b) => new Date(b.scored_at).getTime() - new Date(a.scored_at).getTime()
      )[0] ?? null,
    [scores]
  );

  const latestCall = useMemo(
    () =>
      callLogs
        .filter((c) => c.driver_id === driverId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] ??
      null,
    [callLogs, driverId]
  );

  if (driverLoading) {
    return <p className="p-8 text-sm text-slate-400">กำลังโหลดข้อมูลคนขับ...</p>;
  }
  if (driverError || !driver) {
    return <p className="p-8 text-sm text-rose-500">{driverError ?? "ไม่พบข้อมูลคนขับ"}</p>;
  }

  const overallScore = latestScore?.overall_score ?? driver.currentScore ?? 0;
  const isHighRisk = driver.riskLevel === "high" || latestScore?.is_risk === true;

  return (
    <motion.div
      className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* การ์ดซ้าย: โปรไฟล์คนขับ */}
      <motion.div
        variants={fadeSlideUp}
        className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-6"
      >
        <div className="text-center space-y-3 pt-2">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-md">
            {initialsOf(driver.fullName)}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{driver.fullName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ทะเบียนรถ: {driver.licenseNo} ({VEHICLE_TYPE_LABELS[driver.carType] ?? driver.carType})
            </p>
          </div>
        </div>

        <div className="space-y-3 flex-grow pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            ข้อมูลคนขับ
          </p>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-phone" />
              </div>
              <span className="text-xs font-semibold text-slate-500">เบอร์โทรศัพท์</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{driver.phone}</span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-signal" />
              </div>
              <span className="text-xs font-semibold text-slate-500">สถานะพร้อมงาน</span>
            </div>
            <span className="text-sm font-bold text-slate-800">
              {driver.availability === "available" ? "พร้อมรับงาน" : "ออฟไลน์"}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm">
                <i className="fa-solid fa-chart-line" />
              </div>
              <span className="text-xs font-semibold text-slate-500">จำนวนครั้งที่ประเมิน</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{scores.length} ครั้ง</span>
          </div>
        </div>

        <div className="pt-2">
          <div
            className={`border rounded-xl p-3 text-center ${
              isHighRisk ? "bg-rose-50 border-rose-100" : "bg-emerald-50 border-emerald-100"
            }`}
          >
            <span className={`text-xs font-bold ${isHighRisk ? "text-rose-700" : "text-emerald-800"}`}>
              สถานะคนขับ: {isHighRisk ? "ควรพักรถ / เฝ้าระวัง" : "พร้อมปฏิบัติงานปลอดภัย"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* คอลัมน์ขวา: คะแนนและประวัติการโทร */}
      <motion.div variants={fadeSlideUp} className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="text-center md:border-r border-slate-100 py-2">
            <ScoreGauge score={overallScore} isHighRisk={isHighRisk} />
            <p className="text-[11px] font-bold text-slate-500 uppercase mt-3 tracking-wide">
              คะแนนภาพรวมล่าสุด
            </p>
          </div>

          <div className="md:col-span-2 space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              สรุปมิติการประเมินผล
            </h3>

            {scoresLoading ? (
              <p className="text-xs text-slate-400">กำลังโหลด...</p>
            ) : !latestScore ? (
              <p className="text-xs text-slate-400">ยังไม่มีข้อมูลการประเมินสำหรับคนขับคนนี้</p>
            ) : (
              <>
                <ScoreBar label="ความพร้อมปฏิบัติงาน (Readiness)" value={latestScore.readiness_score} />
                <ScoreBar label="ความเสถียรของน้ำเสียง (Sentiment)" value={latestScore.sentiment_score} />
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800">
              ประวัติสายโทรบอทน้อยถอดความล่าสุด (Call Transcript)
            </h3>
            {latestCall && (
              <span className="text-[11px] text-slate-400 font-medium">
                {new Date(latestCall.created_at).toLocaleString("th-TH")}
              </span>
            )}
          </div>

          {callLogsLoading ? (
            <p className="text-xs text-slate-400">กำลังโหลด...</p>
          ) : !latestCall ? (
            <p className="text-xs text-slate-400">ยังไม่มีประวัติการโทรสำหรับคนขับคนนี้</p>
          ) : (
            <>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs leading-relaxed text-slate-600 max-h-40 overflow-y-auto">
                {latestCall.conversation_log || "ไม่มีข้อความถอดเสียง"}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span>
                  สถานะ: <span className="font-bold text-slate-700">{latestCall.call_status}</span>
                </span>
                <span>
                  ระยะเวลา:{" "}
                  <span className="font-bold text-slate-700">{latestCall.call_duration_sec} วินาที</span>
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
