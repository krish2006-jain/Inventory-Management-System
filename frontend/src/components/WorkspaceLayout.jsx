import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.jpeg";

/* ── Sidebar configs per role (no emojis — professional) ── */
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
    links: [{ to: "/sm/stock-list", label: "Stock List" }],
  },
  {
    title: "Operations",
    links: [
      { to: "/sm/receive-stock", label: "Receive Stock" },
      { to: "/sm/adjust-stock", label: "Adjust Stock" },
    ],
  },
  {
    title: "Logs",
    links: [{ to: "/sm/activity-log", label: "Activity Log" }],
  },
];

const cashierSections = [
  {
    title: "Sales",
    links: [
      { to: "/cashier/pos", label: "Point of Sale" },
      { to: "/cashier/summary", label: "Daily Summary" },
    ],
  },
];

/* ── Page titles mapping ── */
const pageTitles = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/products": "Products",
  "/stock-alerts": "Stock Alerts",
  "/purchases": "Purchases",
  "/suppliers": "Suppliers",
  "/users": "Users",
  "/settings": "Settings",
  "/sm/dashboard": "Dashboard",
  "/sm/stock-list": "Stock List",
  "/sm/receive-stock": "Receive Stock",
  "/sm/adjust-stock": "Adjust Stock",
  "/sm/activity-log": "Activity Log",
  "/cashier/pos": "Point of Sale",
  "/cashier/summary": "Daily Summary",
};

function WorkspaceLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sections =
    user?.role === "cashier"
      ? cashierSections
      : user?.role === "stockmgr"
        ? stockmgrSections
        : ownerSections;

  const displayName = user?.username || "User";
  const displayRole =
    user?.role === "owner"
      ? "Owner"
      : user?.role === "stockmgr"
        ? "Stock Manager"
        : "Cashier";

  const pageTitle = pageTitles[location.pathname] || "Stockly";
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
            <h1>{pageTitle}</h1>
            <p>{today}</p>
          </div>
        </header>

        {children}

        <footer className="workspace-footer">
          Built for reliable inventory operations. Copyright &copy; {new Date().getFullYear()} Stockly
        </footer>
      </main>
    </div>
  );
}

export default WorkspaceLayout;
