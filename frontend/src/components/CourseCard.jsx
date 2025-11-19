// src/components/CourseCard.jsx
import React from "react";
import { FaChalkboardTeacher, FaMapMarkerAlt } from "react-icons/fa";

export default function CourseCard({ course }) {
  const credit = Number(course.credit) || 0;
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 pr-3">
          <div className="flex items-baseline gap-3">
            <h4 className="text-lg font-semibold text-slate-100 leading-tight">
              {course.course_title}
            </h4>

            <span className="ml-auto inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-amber-700/20 border border-amber-500/20 text-amber-300">
              {credit} Credits
            </span>
          </div>

          <div className="text-xs text-slate-400 mt-1 flex flex-wrap gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/40">
              {course.course_code}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/40">
              {course.course_type}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800/50 border border-slate-700/40">
              {course.reg_type}
            </span>
          </div>

          <div className="mt-3 text-sm text-slate-300 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FaChalkboardTeacher className="text-amber-400/80" />
              <span className="text-slate-200">{course.faculty_name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FaMapMarkerAlt className="text-cyan-400/80" />
              <span className="text-slate-200">{course.slot} • {course.grade || ""} • {course.room || ""}</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end text-right">
          <div className="text-xs text-slate-400">Academic Year</div>
          <div className="text-sm font-medium text-slate-100 mt-1">{course.academic_year}</div>
        </div>
      </div>
    </div>
  );
}
