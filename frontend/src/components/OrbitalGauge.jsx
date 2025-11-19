// src/components/OrbitalGauge.jsx
import React from "react";
import { motion } from "framer-motion";

export default function OrbitalGauge({ percent, size = 100, strokeWidth = 8, className = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePercent = Math.min(Math.max(percent, 0), 100); // Clamp 0–100
  const dashOffset = circumference - (safePercent / 100) * circumference;

  const getRingColor = () => {
    if (safePercent >= 75) return "#10b981"; // emerald
    if (safePercent >= 65) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Track – Thin & Subtle */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(51, 65, 85, 0.4)" // slate-700/40
          strokeWidth={strokeWidth}
          fill="none"
        />
      </svg>

      {/* Progress Ring – Animated */}
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getRingColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
          }}
        />
      </svg>

      {/* Center Text – Clean, No Overbleed */}
      <motion.div
        className="absolute flex flex-col items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <span
          className={`font-bold tabular-nums text-lg ${
            safePercent >= 75
              ? "text-emerald-400"
              : safePercent >= 65
              ? "text-amber-400"
              : "text-red-400"
          }`}
          style={{
            filter: "drop-shadow(0 0 4px currentColor)",
            textShadow: "0 0 4px rgba(0,0,0,0.3)",
          }}
        >
          {safePercent.toFixed(safePercent % 1 === 0 ? 0 : 1)}%
        </span>
        <span className="text-[9px] text-slate-400 mt-0.5">Attendance</span>
      </motion.div>
    </div>
  );
}