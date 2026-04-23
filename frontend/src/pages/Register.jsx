import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import loginimg from "../assets/loginimg.png";
import "../styles/auth.css";

const Register = () => {
  const [role, setRole] = useState("cashier");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register({ username, email, password, phone, role });
      const r = data.role || role;
      if (r === "cashier") navigate("/cashier");
      else if (r === "stockmgr") navigate("/sm/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="left-bar">
          <div className="logo">
            <img src={logo} alt="Stockly logo" />
            <div>
              <h1 className="title">STOCKLY</h1>
              <p className="subtitle">Inventory Management System</p>
            </div>
          </div>

          <h2>Create your account</h2>
          <p className="subtext">Set up your team access in seconds.</p>

          <div className="roles">
            <button
              className={role === "owner" ? "active-role" : ""}
              onClick={() => setRole("owner")}
              type="button"
            >
              Owner
            </button>
            <button
              className={role === "stockmgr" ? "active-role" : ""}
              onClick={() => setRole("stockmgr")}
              type="button"
            >
              Stock Manager
            </button>
            <button
              className={role === "cashier" ? "active-role" : ""}
              onClick={() => setRole("cashier")}
              type="button"
            >
              Cashier
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="register-name">Name</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                U
              </span>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <label htmlFor="register-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                @
              </span>
              <input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <label htmlFor="register-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                *
              </span>
              <input
                id="register-password"
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                className="eye-icon"
                onClick={() => setShowPw(!showPw)}
                type="button"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <label htmlFor="register-phone">Phone Number</label>
            <div className="input-wrapper">
              <span className="input-icon" aria-hidden="true">
                +
              </span>
              <input
                id="register-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing up…" : "Sign up"}
            </button>

            <p className="signup">
              Already have an account?<Link to="/login">Sign in</Link>
            </p>
          </form>
        </div>

        <div className="image-section">
          <img src={loginimg} alt="inventory illustration" />
          <h3>Build accurate inventory workflows from day one.</h3>
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

export default Register;
