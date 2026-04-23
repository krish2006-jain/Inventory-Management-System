import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

/* ── Sidebar configs per role ── */
const ownerSections = [
  {
    title: "Overview",
    links: [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/reports", label: "Reports" },
    ],
  },
  {
    title: "Inventory",
    links: [
      { to: "/products", label: "Products" },
      { to: "/categories", label: "Categories" },
      { to: "/stock-alerts", label: "Stock Alerts" },
    ],
  },
  {
    title: "Transactions",
    links: [
      { to: "/purchases", label: "Purchases" },
      { to: "/suppliers", label: "Suppliers" },
    ],
  },
  {
    title: "Admin",
    links: [
      { to: "/users", label: "Users" },
      { to: "/settings", label: "Settings" },
    ],
  },
];

const stockmgrSections = [
  {
    title: "Overview",
    links: [{ to: "/sm/dashboard", label: "Dashboard" }],
  },
  {
    title: "Inventory",
    links: [
      { to: "/sm/stock-list", label: "Stock List" },
      { to: "/sm/item-details", label: "Item Details" },
    ],
  },
  {
    title: "Operations",
    links: [
      { to: "/sm/receive-stock", label: "Receive Stock" },
      { to: "/sm/dispatch", label: "Dispatch" },
      { to: "/sm/adjust-stock", label: "Adjust Stock" },
    ],
  },
  {
    title: "Logs",
    links: [{ to: "/sm/activity-log", label: "Activity Log" }],
  },
];

function WorkspaceLayout({
  title,
  dateLabel = "Monday, 18 March 2026",
  actions,
  children,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = user?.role === "stockmgr" ? stockmgrSections : ownerSections;
  const displayName = user?.username || "Owner Name";
  const displayRole = user?.role || "owner";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <img src={logo} alt="Stockly" className="brand-logo" />
          <div>
            <h2>Stockly</h2>
            <p>Inventory Management</p>
          </div>
        </div>

        <nav className="workspace-nav" aria-label="Main navigation">
          {sections.map((section) => (
            <div key={section.title} className="workspace-nav-group">
              <p>{section.title}</p>
              {section.links.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? "workspace-link active" : "workspace-link"
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="workspace-user">
          <div className="avatar">
            {displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <strong>{displayName}</strong>
            <span>{displayRole}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            Log out
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="workspace-topbar">
          <div>
            <h1>{title}</h1>
            <p>{dateLabel}</p>
          </div>
          {actions ? <div className="workspace-actions">{actions}</div> : null}
        </header>

        {children}

        <footer className="workspace-footer">
          Built for reliable inventory operations. Copyright © 2026 Stockly
        </footer>
      </main>
    </div>
  );
}

export default WorkspaceLayout;
