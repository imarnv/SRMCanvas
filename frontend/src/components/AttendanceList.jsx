import React from "react";
import AttendanceCard from "./AttendanceCard";

export default function AttendanceList({ attendance }) {
  if (!attendance || attendance.length === 0) {
    return <p className="text-gray-400">No attendance data available.</p>;
  }

  return (
    <div className="w-full max-w-2xl px-6 py-10 flex flex-col gap-6">
      {attendance.map((c, i) => (
        <AttendanceCard course={c} key={i} />
      ))}
    </div>
  );
}
