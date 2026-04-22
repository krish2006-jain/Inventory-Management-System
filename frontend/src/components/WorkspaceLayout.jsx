import { NavLink } from "react-router-dom";

const sidebarSections = [
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

function WorkspaceLayout({
  title,
  dateLabel = "Monday, 18 March 2026",
  actions,
  children,
}) {
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <div className="brand-badge">S</div>
          <div>
            <h2>Stockly</h2>
            <p>Inventory Management</p>
          </div>
        </div>

        <nav className="workspace-nav" aria-label="Main navigation">
          {sidebarSections.map((section) => (
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
          <div className="avatar">SA</div>
          <div>
            <strong>Owner Name</strong>
            <span>owner</span>
          </div>
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
      </main>
    </div>
  );
}

export default WorkspaceLayout;
