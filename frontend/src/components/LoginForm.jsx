// src/components/LoginForm.jsx
import React from "react";
import "./LoginForm.css";
import { BeatLoader } from "react-spinners";

function LoginForm({ username, setUsername, password, setPassword, onSubmit, loading, error }) {
  return (
    <div className="login-page">
      {/* Animated Professional Logo + Title */}
      <div className="logo-section">
        <div className="logo-container">
          <div className="logo-glow"></div>
          <div className="logo-arc arc-1"></div>
          <div className="logo-arc arc-2"></div>
          <div className="logo-arc arc-3"></div>
          <div className="logo-core">
            <div className="core-inner"></div>
          </div>
        </div>
        <h1 className="app-title">
          <span className="srm">SRM</span>
          <span className="canvas">Canvas</span>
        </h1>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <form onSubmit={onSubmit} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-input"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
            autoComplete="current-password"
          />

          <div className="form-gap"></div>

          <button type="submit" disabled={loading} className="fetch-button">
            {loading ? (
              <div className="loading-state">
                <BeatLoader color="#e0e7ff" size={7} />
                <span>Fetching Data...</span>
              </div>
            ) : (
              "Fetch Data"
            )}
          </button>

          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginForm;