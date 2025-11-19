// src/App.jsx
import { useState, useRef } from "react";
import { fetchAcademiaData } from "./apiClient";
import LoginForm from "./components/LoginForm";
import AttendanceList from "./components/AttendanceList";
import Marks from "./components/Marks";
import BottomNav from "./components/BottomNav";
import HomePage from "./components/HomePage";
import "./index.css";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home"); // default to home
  const [refreshing, setRefreshing] = useState(false);

  const touchStartY = useRef(0);
  const pullThreshold = 120; // px to trigger refresh
  const pullRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAcademiaData(username, password);
      setData(result);
      setActiveTab("home");
    } catch {
      setError("Failed to fetch data. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!data || loading) return;
    setRefreshing(true);
    try {
      const result = await fetchAcademiaData(username, password);
      setData(result);
    } catch {
      setError("Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (!data || refreshing || window.scrollY > 0) return;

    const touchY = e.touches[0].clientY;
    const pullDistance = touchY - touchStartY.current;

    if (pullDistance > 0 && pullDistance < 200) {
      e.preventDefault();
      if (pullRef.current) {
        pullRef.current.style.transform = `translateY(${pullDistance * 0.6}px)`;
        pullRef.current.style.opacity = Math.min(pullDistance / pullThreshold, 1);
      }
    }
  };

  const handleTouchEnd = () => {
    if (!data || refreshing || !pullRef.current) return;

    const match = pullRef.current.style.transform.match(/-?\d+/);
    const pullDistance = match ? parseInt(match[0], 10) : 0;
    if (pullDistance > pullThreshold) {
      handleRefresh();
    }

    pullRef.current.style.transform = "translateY(-60px)";
    pullRef.current.style.opacity = "0";
  };

  return (
    <div className="app-root dark"> {/* force dark mode */}
      <div className="global-bg"></div>

      {data && (
        <div
          ref={pullRef}
          className="pull-refresh"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="pull-icon">↓</div>
          <div className="pull-text">Pull to refresh...</div>
        </div>
      )}

      <div className="app-content">
        {!data ? (
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        ) : (
          <>
            <main className="main-content">
              {refreshing && (
                <div className="refresh-loader">
                  <div className="spinner"></div>
                  <span>Refreshing...</span>
                </div>
              )}

              {activeTab === "home" && <HomePage data={data} />}
              {activeTab === "attendance" && <AttendanceList attendance={data.attendance} />}
              {activeTab === "marks" && <Marks marks={data.marks} attendance={data.attendance} />}
            </main>

            <BottomNav active={activeTab} onChange={setActiveTab} />
          </>
        )}
      </div>
    </div>
  );
}
