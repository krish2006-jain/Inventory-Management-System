import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import api from "../services/api";

function StockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAlerts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products/low-stock");
      setAlerts(res.data || []);
    } catch {
      setError("Failed to load stock alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadAlerts}>
        Refresh
      </button>
      <Link
        to="/purchases"
        className="primary-btn"
        style={{ textDecoration: "none" }}
      >
        Create Purchase Order
      </Link>
    </>
  );

  const critical = alerts.filter((a) => (a.stock || 0) === 0);
  const warning = alerts.filter((a) => (a.stock || 0) > 0);

  return (
    <WorkspaceLayout title="Stock Alerts" actions={actions}>
      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      <section
        className="metrics-grid"
        style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
      >
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
        <header
          className="table-head-row"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}
        >
          <span>Product</span>
          <span>SKU</span>
          <span>Current</span>
          <span>Reorder Level</span>
          <span>Status</span>
          <span>Action</span>
        </header>
        <div className="table-body">
          {loading ? (
            <div
              className="table-data-row"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}
            >
              <span>Loading alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div
              className="table-data-row"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}
            >
              <span>No alerts right now</span>
            </div>
          ) : (
            alerts.map((a) => {
              const isCritical = (a.stock || 0) === 0;
              return (
                <div
                  key={a._id}
                  className="table-data-row"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr" }}
                >
                  <span className="product-name">{a.name}</span>
                  <span>{a.sku}</span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: isCritical ? "#e53e3e" : "#d69e2e",
                    }}
                  >
                    {a.stock}
                  </span>
                  <span>{a.reorderLevel}</span>
                  <span
                    className={`status-badge ${isCritical ? "badge-red" : "badge-yellow"}`}
                  >
                    {isCritical ? "Critical" : "Warning"}
                  </span>
                  <span>
                    <Link
                      to="/purchases"
                      className="text-chip"
                      style={{ textDecoration: "none" }}
                    >
                      Open Purchases
                    </Link>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default StockAlerts;
