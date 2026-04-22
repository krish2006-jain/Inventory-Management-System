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
    <div className="page-wrapper">
      <div className="container">
        {/* Left panel */}
        <div className="left-bar">
          <div className="logo">
            <img src={logo} alt="Stockly logo" />
            <div>
              <h1 className="title">STOCKLY</h1>
              <p className="subtitle">INVENTORY MANAGEMENT SYSTEM</p>
            </div>
          </div>

          <h2>Welcome Back !!</h2>
          <p className="subtext">Login to your account</p>

          <div className="roles">
            <button
              className={role === "owner" ? "active-role" : ""}
              onClick={() => setRole("owner")}
              type="button"
            >
              👑 Owner
            </button>
            <button
              className={role === "stockmgr" ? "active-role" : ""}
              onClick={() => setRole("stockmgr")}
              type="button"
            >
              📦 Stock mgr
            </button>
            <button
              className={role === "cashier" ? "active-role" : ""}
              onClick={() => setRole("cashier")}
              type="button"
            >
              💰 Cashier
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="eye-icon" onClick={() => setShowPw(!showPw)}>
                {showPw ? "🙈" : "👁"}
              </span>
            </div>

            <p className="forget">Forget password ?</p>

            {error && <p className="auth-error">{error}</p>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "Login in"}
            </button>

            <p className="or">OR</p>

            <button className="google-btn" type="button">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.9 33.5 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.8 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.2-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.5 18.8 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.9 5.8 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.4-4.7l-6.2-5.2C29.2 35.9 26.7 36 24 36c-5.4 0-9.9-3.5-11.3-8.5l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C36.7 39.2 44 34 44 24c0-1.3-.2-2.7-.4-3.9z"/>
              </svg>
              Login With Google
            </button>

            <p className="signup">
              Don't Have An Account ?<Link to="/register">Sign Up</Link>
            </p>
          </form>
        </div>

        {/* Right panel */}
        <div className="image-section">
          <img src={loginimg} alt="inventory illustration" />
          <h3>The Easiest Way to Maintain your Inventory !!!</h3>
        </div>
      </div>

      <footer className="footer">
        Made With ❤️ <br />
        Copyright © 2026 Stockly
      </footer>
    </div>
  );
};

export default Login;
