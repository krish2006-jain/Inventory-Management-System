import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import loginimg from "../assets/loginimg.png";
import api from "../services/api";
import "../styles/auth.css";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    companyName: "",
    phone: "",
    password: ""
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Check if setup is needed
  useEffect(() => {
    api.get("/auth/setup-check")
      .then((res) => {
        if (!res.data.needsSetup) {
          // If setup is already done, only Owner exists.
          // The backend allows register ONLY if setup is true. 
          // But user wants to create account. We will let the API reject it or handle it.
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.companyName.trim()) errs.companyName = "Company Name is required";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        role: "owner" // First user is owner
      };
      await api.post("/auth/register", payload);
      // Registration successful, navigate to login
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="page-wrapper login-page">
      <div className="container">
        <div className="left-bar">
          <div className="login-shell" style={{ marginTop: "20px", marginBottom: "20px" }}>
            <div className="logo">
              <Link to="/" style={{display: "flex", alignItems: "center", gap: "12px", textDecoration: "none"}}>
                <img src={logo} alt="Stockly logo" />
                <div>
                  <h1 className="title">STOCKLY</h1>
                  <p className="subtitle">Inventory Management System</p>
                </div>
              </Link>
            </div>

            <p className="auth-kicker">Owner Setup</p>
            <h2>Create Account</h2>
            <p className="subtext">
              Set up the initial owner account to get started.
            </p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              
              <label htmlFor="reg-name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">U</span>
                <input
                  id="reg-name"
                  type="text"
                  name="username"
                  placeholder="Your Name"
                  value={form.username}
                  onChange={handleChange}
                  className={errors.username ? "input-error" : ""}
                  required
                />
              </div>
              {errors.username && <p className="field-error">{errors.username}</p>}

              <label htmlFor="reg-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">@</span>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="owner@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "input-error" : ""}
                  required
                />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}

              <label htmlFor="reg-company">Company Name</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">C</span>
                <input
                  id="reg-company"
                  type="text"
                  name="companyName"
                  placeholder="Acme Corp"
                  value={form.companyName}
                  onChange={handleChange}
                  className={errors.companyName ? "input-error" : ""}
                  required
                />
              </div>
              {errors.companyName && <p className="field-error">{errors.companyName}</p>}

              <label htmlFor="reg-phone">Phone Number</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">#</span>
                <input
                  id="reg-phone"
                  type="tel"
                  name="phone"
                  placeholder="9876543210 (Optional)"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <label htmlFor="reg-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">*</span>
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  name="password"
                  placeholder="Choose a strong password"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error" : ""}
                  required
                />
                <button
                  className="eye-toggle"
                  onClick={() => setShowPw(!showPw)}
                  type="button"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}

              {errors.general && (
                <p className="auth-error" role="alert" aria-live="polite" style={{marginTop: "8px"}}>
                  {errors.general}
                </p>
              )}

              <button
                className="login-btn"
                type="submit"
                disabled={loading}
                aria-busy={loading}
                style={{marginTop: "16px"}}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="btn-spinner"></span>
                    Registering...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              <p className="assistive-note" style={{marginTop: "16px"}}>
                Already have an account? <Link to="/login" style={{ color: "var(--ws-accent)", fontWeight: 600 }}>Sign in</Link>
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

export default Register;
