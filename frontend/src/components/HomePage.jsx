// src/components/HomePage.jsx
import React, { useMemo, useEffect, useRef, useState } from "react";
import {
  AiFillHome,
  AiOutlineCalendar,
  AiOutlineLink,
  AiOutlineBulb,
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineClockCircle,
} from "react-icons/ai";
import { FiMapPin } from "react-icons/fi";

const fmt = (n, d = 2) => (Number(n) || 0).toFixed(d);

export default function HomePage({ data }) {
  const attendance = data?.attendance || [];
  const courses = data?.courses || [];
  const marks = data?.marks || [];
  const totalCredits = Number(data?.total_credits || 0);
  const profile = data?.profile || {};

  // === Create mapping from course codes to attendance data ===
  const attendanceMap = useMemo(() => {
    const map = {};
    attendance.forEach(course => {
      const cleanCode = course.course_code?.replace(/Regular|Practical|Theory/gi, "").trim();
      if (cleanCode) {
        map[cleanCode] = course;
      }
      // Also store with original code
      map[course.course_code] = course;
    });
    return map;
  }, [attendance]);

  // === Overall Attendance (Supports Normal + Frozen Mode) ===
  const overall = useMemo(() => {
    if (!attendance || attendance.length === 0) {
      return { percent: 0, present: 0, conducted: 0 };
    }

    // detect normal mode by checking if ANY course has hours_conducted > 0
    const hasHours = attendance.some(
      (c) => Number(c.hours_conducted) > 0 && Number(c.hours_absent) >= 0
    );

    // Normal attendance calculation (hours-based)
    if (hasHours) {
      const total = attendance.reduce(
        (acc, c) => {
          const conducted = Number(c.hours_conducted) || 0;
          const absent = Number(c.hours_absent) || 0;

          acc.conducted += conducted;
          acc.present += Math.max(0, conducted - absent);

          return acc;
        },
        { conducted: 0, present: 0 }
      );

      const percent =
        total.conducted > 0
          ? (total.present / total.conducted) * 100
          : 0;

      return {
        percent: Number(percent.toFixed(2)),
        present: total.present,
        conducted: total.conducted,
      };
    }

    // FROZEN MODE (SRM hides hours, only shows percentages)
    const percents = attendance
      .map((c) =>
        parseFloat(String(c.attendance_percent).replace("%", "")) || 0
      )
      .filter((p) => p >= 0);

    const avg =
      percents.length > 0
        ? percents.reduce((a, b) => a + b, 0) / percents.length
        : 0;

    return {
      percent: Number(avg.toFixed(2)),
      present: 0,
      conducted: 0,
    };
  }, [attendance]);

  // === Cumulative Marks ===
  const cumulative = useMemo(() => {
    const totals = marks.reduce(
      (acc, course) => {
        course.tests?.forEach((t) => {
          const parts = String(t.label).split("/");
          const max = parts[1] ? Number(parts[1]) : 0;
          const score = Number(t.score) || 0;

          acc.score += score;
          acc.max += max;
        });
        return acc;
      },
      { score: 0, max: 0 }
    );

    const percent = totals.max > 0 ? (totals.score / totals.max) * 100 : 0;

    return {
      score: Math.round(totals.score),
      max: Math.round(totals.max),
      percent: Number(percent.toFixed(2)),
    };
  }, [marks]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* === Header === */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg border border-cyan-400/30">
            <AiFillHome className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              SRM Canvas
            </h1>
            <p className="text-sm text-slate-400">Academic Overview</p>
          </div>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/60 px-4 py-1.5 rounded-full border border-slate-700/50">
          Updated just now
        </div>
      </header>

      {/* === Profile + Stats === */}
      <section className="grid lg:grid-cols-4 gap-6">
        {/* Profile */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border border-cyan-400/30">
              {profile.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white mb-1 truncate">
                {profile.name || "Unknown Student"}
              </h2>
              <p className="text-sm text-cyan-400 font-medium bg-cyan-400/10 px-3 py-1 rounded-full inline-block">
                {profile.regno || "No ID"}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <ProfileField label="Program" value={profile.program} />
                <ProfileField
                  label="Specialization"
                  value={profile.specialization}
                />
                <ProfileField
                  label="Semester"
                  value={profile.semester}
                  prefix="Sem "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AnimatedStatCard
            label="Overall Attendance"
            value={overall.percent}
            unit="%"
            sub={
              overall.conducted > 0
                ? `${overall.present}/${overall.conducted} hrs`
                : "Frozen Mode"
            }
            color="emerald"
            icon={<AiOutlineClockCircle className="text-2xl" />}
          />

          <AnimatedStatCard
            label="Cumulative Marks"
            value={cumulative.percent}
            unit="%"
            sub={`${cumulative.score}/${cumulative.max} pts`}
            color="amber"
            icon={<AiOutlineBook className="text-2xl" />}
          />

          <AnimatedStatCard
            label="Total Credits"
            value={totalCredits}
            unit=""
            sub="This semester"
            color="purple"
            icon={<AiOutlineUser className="text-2xl" />}
          />
        </div>
      </section>

      {/* === Courses === */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AiOutlineBook className="text-cyan-400" />
            Your Courses
          </h3>
          <span className="text-xs text-slate-400 bg-slate-800/60 px-3 py-1 rounded-full border border-slate-700/50">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course, i) => (
              <CourseCard 
                key={i} 
                course={course} 
                attendanceData={attendanceMap[course.course_code]} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AiOutlineBook className="text-slate-600 text-4xl mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              No courses registered this semester.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// === Animated Stat Card ===
function AnimatedStatCard({ label, value, unit, sub, color, icon }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = value;
          const duration = 1200;
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(animate);
          };

          requestAnimationFrame(animate);
          observer.unobserve(ref.current);
        }
      },
      { threshold: 0.6 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  const colors = {
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-5 shadow-xl flex flex-col items-center justify-center text-center h-full`}
    >
      <div className="text-white/90 mb-3">{icon}</div>
      <p className="text-4xl font-bold text-white leading-tight">
        {count}
        {unit && (
          <span className="text-2xl ml-1">{unit}</span>
        )}
      </p>
      <p className="text-xs text-white/80 font-medium mt-2">{label}</p>
      {sub && <p className="text-xs text-white/70 mt-1">{sub}</p>}
    </div>
  );
}

// === Course Card ===
function CourseCard({ course, attendanceData }) {
  // Get attendance from attendanceData if available
  const attendancePercent = attendanceData ? 
    parseFloat(String(attendanceData.attendance_percent).replace("%", "")) || 0 : 0;

  const getColor = (p) =>
  p >= 75 ? "text-emerald-400" : "text-red-400";
const getProgress = (p) =>
  p >= 75 ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="bg-slate-900/70 rounded-xl p-5 border border-slate-700/50 shadow-md hover:border-slate-600/70 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-100 text-sm truncate">
            {course.course_title || "Unnamed Course"}
          </h4>
          <p className="text-xs text-cyan-400 mt-1">
            {course.course_code}
          </p>
        </div>
        {course.category && (
          <span className="text-xs text-slate-300 bg-slate-800/80 px-2 py-1 rounded-full border border-slate-700/50">
            {course.category}
          </span>
        )}
      </div>

      <div className="space-y-3 text-sm">
        <DetailRow label="Faculty" value={course.faculty} />
        <DetailRow label="Slot" value={course.slot} />
        <DetailRow label="Room" value={course.room} />
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
        <div>
          <p className="text-xs text-slate-500">Attendance</p>
          <p className={`text-sm font-semibold ${getColor(attendancePercent)}`}>
            {attendanceData ? fmt(attendancePercent) + "%" : "—"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Credits</p>
          <p className="text-sm font-semibold text-amber-400">
            {course.credits}
          </p>
        </div>
      </div>

      {attendanceData && (
        <div className="mt-3 w-full bg-slate-700/50 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${getProgress(attendancePercent)} transition-all duration-1000`}
            style={{ width: `${Math.min(attendancePercent, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-slate-500">{label}</p>
      <p className="text-slate-300">{value || "—"}</p>
    </div>
  );
}

function ProfileField({ label, value, prefix = "" }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-300">
        {value ? `${prefix}${value}` : "—"}
      </p>
    </div>
  );
}