// src/components/AttendanceCard.jsx
import React from "react";
import OrbitalGauge from "./OrbitalGauge";

export default function AttendanceCard({ course }) {
  const percent = parseFloat(course.attendance_percent) || 0;
  const conducted = parseInt(course.hours_conducted) || 0;
  const absent = parseInt(course.hours_absent) || 0;
  const present = conducted - absent;
  const formattedCode = course.course_code
    ? course.course_code.replace("Regular", " Regular")
    : "";

  // === Safe Misses ===
  const calculateSafeMisses = () => {
    if (conducted === 0 || percent < 75) return 0;
    const safe = (present / 0.75) - conducted;
    return Math.max(0, Math.floor(safe));
  };

  // === Required to Attend ===
  const calculateRequired = () => {
    if (conducted === 0 || percent >= 75) return 0;
    const deficit = 0.75 * conducted - present;
    if (deficit <= 0) return 0;
    return Math.ceil(deficit / 0.25);
  };

  const safeMisses = calculateSafeMisses();
  const requiredClasses = calculateRequired();
  const isBelow75 = percent < 75;

  // Get status color and message - SIMPLIFIED LOGIC
  const getStatusInfo = () => {
    if (isBelow75) {
      // RED only when attendance is below 75% (required classes)
      return {
        color: "text-rose-400",
        bg: "bg-rose-900/30",
        border: "border-rose-500/40",
        message: `${requiredClasses} more classes needed`,
        title: "Required"
      };
    } else {
      // GREEN for any safe to miss classes (even 1)
      return {
        color: "text-emerald-400",
        bg: "bg-emerald-900/30",
        border: "border-emerald-500/40",
        message: `${safeMisses} classes safe to miss`,
        title: "Safe to Miss"
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="w-full">
      {/* === Card === */}
      <div className="w-full p-5 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-700/70 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10">
        {/* Header + Gauge */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1 space-y-1.5">
            <h2 className="text-lg font-bold text-slate-100 leading-tight">
              {course.course_title}
            </h2>
            <p className="text-xs font-medium text-slate-300">{formattedCode}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-slate-800/80 rounded border border-slate-600/50 text-slate-300">
                {course.category}
              </span>
              <span className="italic text-slate-500">{course.faculty}</span>
            </div>
          </div>
          <OrbitalGauge percent={percent} size={100} strokeWidth={8} />
        </div>

        {/* === 3 Stats + Status Card === */}
        <div className="grid grid-cols-4 gap-2">
          <CompactStat label="Present" value={present} color="text-emerald-400" />
          <CompactStat label="Absent" value={absent} color="text-rose-400" />
          <CompactStat label="Total" value={conducted} color="text-blue-400" />
          
          {/* === Status Card - Simplified Logic === */}
          <div className={`p-2.5 rounded-lg border ${status.bg} ${status.border} transition-all duration-300`}>
            <div className="flex flex-col items-center justify-center text-center">
              <span className={`text-sm font-semibold ${status.color} mb-1`}>
                {status.title}
              </span>
              <span className="text-lg font-bold text-slate-100 mb-1">
                {isBelow75 ? requiredClasses : safeMisses}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {status.message}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// === Compact Stat ===
function CompactStat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-600/30 bg-slate-800/40 transition-all duration-300">
      <span className={`${color} text-base font-bold`}>{value}</span>
      <span className="text-[10px] text-slate-400 mt-0.5">{label}</span>
    </div>
  );
}