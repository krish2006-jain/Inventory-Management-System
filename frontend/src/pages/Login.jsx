import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import loginimg from "../assets/loginimg.png";
import "../styles/auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 4)
      errs.password = "Password must be at least 4 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const data = await login(email, password);
      // Role-based redirect — auto-detected from server
      if (data.role === "cashier") navigate("/cashier/pos");
      else if (data.role === "stockmgr") navigate("/sm/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setErrors({ general: msg });
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
              <Link
                to="/"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                }}
              >
                <img src={logo} alt="Stockly logo" />
                <div>
                  <h1 className="title">STOCKLY</h1>
                  <p className="subtitle">Inventory Management System</p>
                </div>
              </Link>
            </div>

            <h2>Welcome back</h2>
            <p className="subtext">
              Sign in to continue managing your inventory.
            </p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="login-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  @
                </span>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                  className={errors.email ? "input-error" : ""}
                  required
                />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}

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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  autoComplete="current-password"
                  className={errors.password ? "input-error" : ""}
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
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}

              <div className="form-helper-row">
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {}}
                >
                  Forgot Password?
                </button>
              </div>

              {errors.general && (
                <p className="auth-error" role="alert" aria-live="polite">
                  {errors.general}
                </p>
              )}

              <button
                className="login-btn"
                type="submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              <p className="assistive-note">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  style={{ color: "var(--ws-accent)", fontWeight: 600 }}
                >
                  Sign up
                </Link>
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
        Copyright © {new Date().getFullYear()} Stockly
      </footer>
    </div>
  );
};

export default Login;
