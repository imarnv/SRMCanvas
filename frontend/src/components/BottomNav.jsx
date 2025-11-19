// src/components/BottomNav.jsx
import React from "react";
import "./BottomNav.css";
import { AiOutlinePercentage, AiOutlineBarChart, AiFillHome } from "react-icons/ai";

export default function BottomNav({ active, onChange }) {
  return (
    <div className="bottom-navbar">
      <div
        className={`nav-item ${active === "home" ? "active" : ""}`}
        onClick={() => onChange("home")}
      >
        <AiFillHome className="nav-icon" />
        <span>Home</span>
      </div>

      <div
        className={`nav-item ${active === "attendance" ? "active" : ""}`}
        onClick={() => onChange("attendance")}
      >
        <AiOutlinePercentage className="nav-icon" />
        <span>Attendance</span>
      </div>

      <div
        className={`nav-item ${active === "marks" ? "active" : ""}`}
        onClick={() => onChange("marks")}
      >
        <AiOutlineBarChart className="nav-icon" />
        <span>Marks</span>
      </div>
    </div>
  );
}
