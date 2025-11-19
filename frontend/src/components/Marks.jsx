// src/components/Marks.jsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const formatNum = (n) => {
  const num = parseFloat(String(n));
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export default function Marks({ marks = [], attendance = [] }) {
  const mappedMarks = useMemo(() => {
    const attMap = {};
    attendance.forEach((a) => {
      const clean = a.course_code?.replace(/Regular|Practical|Theory/gi, "").trim();
      if (clean) {
        attMap[clean] = { title: a.course_title, category: a.category };
      }
    });

    const sortOrder = [
      "FT-I",
      "FT-II",
      "FT-III",
      "FT-IV",
      "LLT-I",
      "LLT-II",
      "FJ-I",
      "FJ-II",
    ];

    return marks.map((m) => {
      const clean = m.course_code?.replace(/Regular|Practical|Theory/gi, "").trim();
      const match = attMap[clean] || { title: "Unnamed Course", category: "Theory" };

      const tests = (m.tests || []).sort((a, b) => {
        const aLabel = a.label.split("/")[0];
        const bLabel = b.label.split("/")[0];
        const aIdx = sortOrder.indexOf(aLabel);
        const bIdx = sortOrder.indexOf(bLabel);
        if (aIdx === -1 && bIdx === -1) return aLabel.localeCompare(bLabel);
        if (aIdx === -1) return 1;
        if (bIdx === -1) return -1;
        return aIdx - bIdx;
      });

      return { ...m, course_title: match.title, category: match.category, tests };
    });
  }, [marks, attendance]);

  if (!mappedMarks.length) {
    return (
      <div className="text-center text-slate-400 mt-16 text-lg font-medium">
        No marks data available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {mappedMarks.map((course, idx) => {
        const tests = (course.tests || []).map((t) => {
          const [label, max] = String(t.label).split("/");
          const score = parseFloat(t.score);
          const maxMarks = parseFloat(max);
          const percent = (score / maxMarks) * 100 || 0;
          return {
            label: label?.trim(),
            score,
            max: maxMarks,
            percent: parseFloat(formatNum(percent)),
          };
        });

        const totalScore = tests.reduce((s, t) => s + (t.score || 0), 0);
        const totalMax = tests.reduce((s, t) => s + (t.max || 0), 0);
        const avgPercent = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

        const graphData = tests.map((t) => ({
          label: t.label,
          percent: t.percent,
          score: t.score,
          max: t.max,
        }));

        return (
          <div
            key={idx}
            className="bg-slate-900/70 backdrop-blur-md rounded-xl border border-slate-700/50 p-5 shadow-lg hover:shadow-xl hover:border-slate-600/70 transition-all duration-300 max-w-xl mx-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-lg font-bold text-slate-100 leading-tight">
                  {course.course_title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="font-medium">{course.course_code}</span>
                  <span className="text-slate-500">•</span>
                  <span className="px-2 py-0.5 bg-slate-800/70 rounded text-slate-300 border border-slate-700/40">
                    {course.category}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-400">
                  {formatNum(totalScore)}
                  <span className="text-lg text-slate-400">/{formatNum(totalMax)}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {formatNum(avgPercent)}% avg
                </div>
              </div>
            </div>

            {/* Compact Graph */}
            <div className="h-48 mb-4 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={graphData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="rgba(100,116,139,0.15)" strokeDasharray="2 4" />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickMargin={6}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `${v}%`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid rgba(100,116,139,0.3)",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      padding: "6px 10px",
                    }}
                    labelStyle={{ color: "#e2e8f0", fontWeight: "600" }}
                    itemStyle={{ color: "#06b6d4" }}
                    formatter={(v) => `${formatNum(v)}%`}
                  />
                  <defs>
                    <linearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <Line
                    type="monotone"
                    dataKey="percent"
                    stroke={`url(#grad-${idx})`}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#06b6d4", strokeWidth: 1.5, stroke: "#0e7490" }}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#1d4ed8" }}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Test Pills – ONLY score / max */}
            <div className="flex flex-wrap gap-2 justify-center">
              {tests.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-full px-3 py-1.5 text-xs hover:bg-slate-700/60 hover:border-cyan-500/40 transition-all"
                >
                  <span className="font-medium text-cyan-400">{t.label} </span>
                  <span className="text-slate-300">
                    {formatNum(t.score)} / <span className="text-slate-500">{formatNum(t.max)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}