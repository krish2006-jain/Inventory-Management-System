import WorkspaceLayout from "../components/WorkspaceLayout";

const alerts = [
  { name: "Wireless Scanner", sku: "WS-001", current: 5, reorder: 20, status: "critical" },
  { name: "Barcode Labels (500)", sku: "BL-500", current: 12, reorder: 50, status: "warning" },
  { name: "Storage Bin XL", sku: "SB-XL1", current: 8, reorder: 25, status: "warning" },
  { name: "Smart Shelving Kit", sku: "SK-001", current: 0, reorder: 15, status: "critical" },
  { name: "Thermal Paper Rolls", sku: "TP-R50", current: 3, reorder: 30, status: "critical" },
  { name: "Cable Ties Pack", sku: "CT-200", current: 18, reorder: 40, status: "warning" },
];

function StockAlerts() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export</button>
      <button className="primary-btn" type="button">Reorder All</button>
    </>
  );

  const critical = alerts.filter((a) => a.status === "critical");
  const warning = alerts.filter((a) => a.status === "warning");

  return (
    <WorkspaceLayout title="Stock Alerts" actions={actions}>
      <section className="metrics-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <article className="metric-card">
          <p>Total Alerts</p>
          <h3>{alerts.length}</h3>
          <span className="metric-down">Items below reorder level</span>
        </article>
        <article className="metric-card">
          <p>Critical (0 stock)</p>
          <h3 style={{ color: "#e53e3e" }}>{critical.length}</h3>
          <span className="metric-down">Out of stock</span>
        </article>
        <article className="metric-card">
          <p>Warning</p>
          <h3 style={{ color: "#d69e2e" }}>{warning.length}</h3>
          <span className="metric-down">Below reorder point</span>
        </article>
      </section>

      <section className="table-shell">
        <header className="table-head-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}>
          <span>Product</span>
          <span>SKU</span>
          <span>Current</span>
          <span>Reorder Level</span>
          <span>Status</span>
          <span>Action</span>
        </header>
        <div className="table-body">
          {alerts.map((a) => (
            <div key={a.sku} className="table-data-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}>
              <span className="product-name">{a.name}</span>
              <span>{a.sku}</span>
              <span style={{ fontWeight: 700, color: a.status === "critical" ? "#e53e3e" : "#d69e2e" }}>{a.current}</span>
              <span>{a.reorder}</span>
              <span className={`status-badge ${a.status === "critical" ? "badge-red" : "badge-yellow"}`}>
                {a.status === "critical" ? "Critical" : "Warning"}
              </span>
              <span>
                <button className="primary-btn" style={{ minHeight: 32, fontSize: "0.75rem", padding: "0 10px" }} type="button">
                  Reorder
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default StockAlerts;
