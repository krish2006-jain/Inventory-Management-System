import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import loginimg from "../assets/loginimg.png";
import "../styles/auth.css";

const Login = () => {
  const [role, setRole] = useState("cashier");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password, role);
      const r = data.role || role;
      if (r === "cashier") navigate("/cashier");
      else if (r === "stockmgr") navigate("/sm/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper login-page">
      <div className="container">
        <div className="left-bar">
          <div className="login-shell">
            <div className="logo">
              <img src={logo} alt="Stockly logo" />
              <div>
                <h1 className="title">STOCKLY</h1>
                <p className="subtitle">Inventory Management System</p>
              </div>
            </div>

            <p className="auth-kicker">Secure Access</p>
            <h2>Welcome back</h2>
            <p className="subtext">
              Sign in to continue managing your inventory.
            </p>

            <div
              className="roles"
              role="tablist"
              aria-label="Choose account role"
            >
              <button
                className={role === "owner" ? "active-role" : ""}
                onClick={() => setRole("owner")}
                type="button"
                aria-pressed={role === "owner"}
              >
                Owner
              </button>
              <button
                className={role === "stockmgr" ? "active-role" : ""}
                onClick={() => setRole("stockmgr")}
                type="button"
                aria-pressed={role === "stockmgr"}
              >
                Stock Manager
              </button>
              <button
                className={role === "cashier" ? "active-role" : ""}
                onClick={() => setRole("cashier")}
                type="button"
                aria-pressed={role === "cashier"}
              >
                Cashier
              </button>
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="login-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  @
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  *
                </span>
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="eye-toggle"
                  onClick={() => setShowPw(!showPw)}
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>

              <p className="assistive-note">
                Need help signing in? Contact your administrator.
              </p>

              {error && (
                <p className="auth-error" role="alert" aria-live="polite">
                  {error}
                </p>
              )}

              <button
                className="login-btn"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <p className="signup">
                Don&apos;t have an account?
                <Link to="/register">Create one</Link>
              </p>
            </form>
          </div>
        </div>

        <div className="image-section">
          <img src={loginimg} alt="inventory illustration" />
          <h3>Run your inventory operations with clarity and control.</h3>
          <p className="image-caption">
            Track products, monitor movement, and keep every team aligned.
          </p>
        </div>
      </div>

      <footer className="footer">
        Built for accurate inventory management.
        <br />
        Copyright © 2026 Stockly
      </footer>
    </div>
  );
};

export default Login;
