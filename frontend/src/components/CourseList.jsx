// src/components/CourseList.jsx
import React from "react";
import CourseCard from "./CourseCard";

export default function CourseList({ courses = [] }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="text-center text-slate-400 py-6">
        No courses found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {courses.map((c, i) => (
        <CourseCard course={c} key={i} />
      ))}
    </div>
  );
}
