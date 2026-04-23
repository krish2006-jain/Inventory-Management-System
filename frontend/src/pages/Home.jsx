import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";
import LogoLoop from "../components/LogoLoop";
import "../styles/home.css";

/* ── Typewriter Hook ── */
function useTypewriter(words, speed = 90, pause = 2200) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const word = words[wordIdx];
    timerRef.current = setTimeout(
      () => {
        if (deleting) {
          setText((t) => t.slice(0, -1));
          if (text.length <= 1) {
            setDeleting(false);
            setWordIdx((i) => (i + 1) % words.length);
          }
        } else {
          setText(word.slice(0, text.length + 1));
          if (text.length === word.length - 1) {
            setTimeout(() => setDeleting(true), pause);
          }
        }
      },
      deleting ? speed / 2 : speed
    );
    return () => clearTimeout(timerRef.current);
  }, [text, deleting, wordIdx, words, speed, pause]);

  return text;
}

/* ── Scroll Observer ── */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── CountUp ── */
function AnimatedNumber({ end, suffix = "", duration = 2200, trigger }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(Math.sin((p * Math.PI) / 2) * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, trigger]);
  return <>{val.toLocaleString()}{suffix}</>;
}

/* ── FadeIn Wrapper ── */
function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={`home-fade-in ${visible ? "home-fade-in--visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Role Table Rows ── */
function PermRows({ allowed = [], restricted = [] }) {
  return (
    <>
      {allowed.map((p, i) => (
        <tr key={`a${i}`}>
          <td>
            <span className="home-perm-name">
              <span className="home-perm-dot home-perm-dot--green"></span>
              {p}
            </span>
          </td>
          <td><span className="home-perm-badge home-perm-badge--allowed">✓ Allowed</span></td>
        </tr>
      ))}
      {restricted.map((p, i) => (
        <tr key={`r${i}`}>
          <td>
            <span className="home-perm-name home-perm-name--restricted">
              <span className="home-perm-dot home-perm-dot--red"></span>
              {p}
            </span>
          </td>
          <td><span className="home-perm-badge home-perm-badge--restricted">✗ Restricted</span></td>
        </tr>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════ */
/*                  HOME PAGE                      */
/* ════════════════════════════════════════════════ */

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("owner");

  const typed = useTypewriter([
    "growing businesses",
    "retail stores",
    "your team",
    "Indian SMBs",
  ]);

  const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const roles = {
    owner: {
      allowed: ["Financial Reports", "User Management", "Add Products", "Supplier Contacts", "Adjust Stock", "View Dashboard", "Process Sales", "System Settings", "Receive Goods"],
      restricted: [],
    },
    stockmgr: {
      allowed: ["Adjust Stock", "Receive Goods", "Dispatch Items", "Activity Logs", "View Stock List", "Item History"],
      restricted: ["Financial Reports", "User Management", "System Settings", "Process Sales"],
    },
    cashier: {
      allowed: ["Process Sales", "View Prices", "Print Receipts"],
      restricted: ["Add Products", "Adjust Stock", "Financial Reports", "User Management", "Supplier Contacts", "System Settings"],
    },
  };

  const features = [
    { icon: "📊", title: "Real-time Dashboard", desc: "Instantly see revenue, stock levels, and daily KPIs at a glance." },
    { icon: "🔔", title: "Smart Stock Alerts", desc: "Get notified before fast-moving items run out of stock." },
    { icon: "⚡", title: "Blazing-fast POS", desc: "Checkout interface optimized for rapid barcode scanning." },
    { icon: "🔐", title: "Role-based Access", desc: "Limit views safely for stock managers and cashiers." },
    { icon: "📄", title: "PDF Reports", desc: "Generate financial and inventory audits in seconds." },
    { icon: "📥", title: "CSV Bulk Import", desc: "Migrate thousands of products seamlessly on day one." },
  ];

  return (
    <div className="stockly-home">
      {/* ── Navbar ── */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <button className="home-nav-brand" onClick={() => scroll("hero")}>
            <img src={logo} alt="Stockly" style={{ width: '28px', height: '28px', borderRadius: '6px' }} />
            <span>Stockly</span>
          </button>

          <div className="home-nav-links">
            <button className="home-nav-link" onClick={() => scroll("features")}>Features</button>
            <button className="home-nav-link" onClick={() => scroll("roles")}>Roles</button>
            <button className="home-nav-link" onClick={() => scroll("how-it-works")}>How it Works</button>
          </div>

          {user ? (
            <button className="home-btn-primary home-btn-sm" onClick={() => {
              if (user.role === 'cashier') navigate('/cashier/pos');
              else if (user.role === 'stockmgr') navigate('/sm/dashboard');
              else navigate('/dashboard');
            }}>Dashboard</button>
          ) : (
            <button className="home-btn-primary home-btn-sm" onClick={() => navigate("/login")}>Log in</button>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section id="hero" className="home-hero">
        <div className="home-bubbles">
          <div className="home-bubble"></div>
          <div className="home-bubble"></div>
          <div className="home-bubble"></div>
          <div className="home-bubble"></div>
          <div className="home-bubble"></div>
          <div className="home-bubble"></div>
        </div>
        <div className="home-hero-inner">
          <div className="home-hero-badge">
            <span className="home-hero-badge-dot"></span>
            Enterprise-grade stock automation
          </div>

          <h1>
            Inventory management for{" "}
            <br />
            <span className="home-hero-typed">{typed}</span>
            <span className="home-hero-cursor"></span>
          </h1>

          <p>
            The clean, blazing-fast workspace to track stock, manage suppliers,
            and empower your retail operations — without the clutter.
          </p>

          <div className="home-hero-actions">
            <button className="home-btn-primary" onClick={() => navigate("/login")}>Get Started Free</button>
            <button className="home-btn-outline" onClick={() => scroll("features")}>See How It Works</button>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="home-mockup-wrap">
          <div className="home-mockup">
            <div className="home-mockup-dots">
              <span className="home-mockup-dot home-mockup-dot--red"></span>
              <span className="home-mockup-dot home-mockup-dot--yellow"></span>
              <span className="home-mockup-dot home-mockup-dot--green"></span>
            </div>

            <div className="home-kpi-row">
              {[
                { label: "Total Revenue", value: "₹1,24,500" },
                { label: "Active Orders", value: "43" },
                { label: "Products", value: "1,204" },
                { label: "Low Stock", value: "12", danger: true },
              ].map((kpi, i) => (
                <div className="home-kpi-card" key={i}>
                  <div className="home-kpi-label">{kpi.label}</div>
                  <div className={`home-kpi-value ${kpi.danger ? "home-kpi-value--danger" : ""}`}>{kpi.value}</div>
                </div>
              ))}
            </div>

            <div className="home-charts-row">
              <div className="home-chart-card">
                <div className="home-chart-title">7-Day Revenue</div>
                <div className="home-bars">
                  {[40, 65, 48, 88, 55, 100, 76].map((h, i) => (
                    <div className="home-bar-col" key={i} style={{ height: "100%" }}>
                      <div
                        className="home-bar-fill"
                        style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="home-chart-card">
                <div className="home-chart-title">Sales by Category</div>
                <div className="home-donut-wrap">
                  <svg viewBox="0 0 36 36">
                    <path className="home-donut-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="home-donut-fill" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="home-stats">
        <div className="home-stats-inner">
          {[
            { end: 100, suffix: "ms", label: "Lightning fast loads" },
            { end: 24, suffix: "/7", label: "Reliable service" },
            { end: 0, suffix: " limits", label: "On your growth" },
          ].map((s, i) => (
            <StatCell key={i} {...s} />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="home-features">
        <div className="home-features-inner">
          <FadeIn>
            <div className="home-section-label">Features</div>
            <h2 className="home-section-title">Everything your team needs</h2>
          </FadeIn>

          <div style={{ marginTop: "40px" }}>
            <LogoLoop
              logos={features}
              speed={100}
              direction="left"
              logoHeight={180}
              gap={32}
              hoverSpeed={20}
              fadeOut
              fadeOutColor="var(--bg-main, #ffffff)"
              renderItem={(f) => (
                <div 
                  className="home-feature-card" 
                  style={{
                    width: "300px", 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    justifyContent: "space-between",
                    padding: "32px",
                    margin: 0,
                    boxShadow: "0 10px 30px rgba(20, 31, 52, 0.08)",
                    border: "1px solid rgba(108, 78, 242, 0.1)"
                  }}
                >
                  <div className="home-feature-icon" style={{ fontSize: "2rem", marginBottom: "16px" }}>{f.icon}</div>
                  <h3 style={{ fontSize: "1.25rem", margin: "0 0 12px 0", color: "#111827" }}>{f.title}</h3>
                  <p style={{ margin: 0, color: "#6b7280", lineHeight: "1.5" }}>{f.desc}</p>
                </div>
              )}
            />
          </div>
        </div>
      </section>

      {/* ── Roles ── */}
      <section id="roles" className="home-roles">
        <div className="home-roles-inner">
          <FadeIn>
            <h2 className="home-section-title" style={{ textAlign: "center" }}>Built for your entire workforce</h2>

            <div className="home-roles-tabs">
              {(["owner", "stockmgr", "cashier"]).map((r) => (
                <button
                  key={r}
                  className={`home-role-tab ${tab === r ? "home-role-tab--active" : ""}`}
                  onClick={() => setTab(r)}
                >
                  {r === "owner" ? "Owner" : r === "stockmgr" ? "Stock Manager" : "Cashier"}
                </button>
              ))}
            </div>

            <table className="home-roles-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th style={{ textAlign: "center" }}>Access</th>
                </tr>
              </thead>
              <tbody>
                <PermRows
                  allowed={roles[tab].allowed}
                  restricted={roles[tab].restricted}
                />
              </tbody>
            </table>
          </FadeIn>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="home-steps">
        <div className="home-steps-inner">
          <FadeIn>
            <h2 className="home-section-title">Go live in three steps</h2>
          </FadeIn>
          <div className="home-steps-row">
            {[
              { n: "1", t: "Setup Store", d: "Import products and configure your store details." },
              { n: "2", t: "Invite Team", d: "Assign roles to managers and cashiers securely." },
              { n: "3", t: "Start Selling", d: "Track live inventory and revenues instantly." },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 120} className="home-step">
                <div className="home-step-num">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <FadeIn>
            <h2>Ready to take control of your inventory?</h2>
            <p>Join hundreds of Indian retail businesses running on Stockly.</p>
            <div className="home-cta-actions">
              <button className="home-btn-primary" onClick={() => navigate("/login")}>Get Started Free</button>
              <button className="home-btn-outline" onClick={() => scroll("features")}>See How It Works</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <div className="home-footer-brand">
            <img src={logo} alt="Stockly" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
          Stockly
        </div>
        <div>&copy; {new Date().getFullYear()} Stockly Inc. All rights reserved.</div>
      </footer>
    </div>
  );
}

/* ── Stat Cell with CountUp ── */
function StatCell({ end, suffix, label }) {
  const [ref, visible] = useFadeIn();
  return (
    <div ref={ref} className="home-stat">
      <div className="home-stat-number">
        <AnimatedNumber end={end} suffix={suffix} trigger={visible} />
      </div>
      <div className="home-stat-label">{label}</div>
    </div>
  );
}
