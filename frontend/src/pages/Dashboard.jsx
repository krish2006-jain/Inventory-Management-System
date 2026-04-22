import { useEffect, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import api from "../services/api";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/summary");
      setSummary(res.data);
    } catch {
      setError("Failed to load dashboard summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const metrics = summary?.metrics || {};
  const lowStock = summary?.lowStockItems || [];
  const recent = summary?.recentMovements || [];

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadSummary}>
        Refresh
      </button>
      <button className="primary-btn" type="button">
        Live Dashboard
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Dashboard" actions={actions}>
      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      <section className="metrics-grid">
        <article className="metric-card">
          <p>Total Products 📦</p>
          <h3>{loading ? "..." : metrics.totalProducts || 0}</h3>
          <span className="metric-up">Tracked in database</span>
        </article>
        <article className="metric-card">
          <p>Total Categories 🏷️</p>
          <h3>{loading ? "..." : metrics.totalCategories || 0}</h3>
          <span className="metric-up">Catalog segments</span>
        </article>
        <article className="metric-card">
          <p>Low Stock Items ⚠️</p>
          <h3>{loading ? "..." : metrics.lowStockCount || 0}</h3>
          <span className="metric-down">Below reorder point</span>
        </article>
        <article className="metric-card">
          <p>Out Of Stock ❌</p>
          <h3>{loading ? "..." : metrics.outOfStockCount || 0}</h3>
          <span className="metric-down">Immediate attention</span>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <h4>Weekly Sales</h4>
            <button type="button">Inventory Health</button>
          </div>
          <div className="bars-wrap" aria-label="Weekly sales chart">
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.totalProducts || 0) / 2)}%`,
                }}
              />
              <small>SKUs</small>
            </div>
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.totalSuppliers || 0) * 8)}%`,
                }}
              />
              <small>Suppliers</small>
            </div>
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.totalCategories || 0) * 12)}%`,
                }}
              />
              <small>Category</small>
            </div>
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.lowStockCount || 0) * 12)}%`,
                }}
              />
              <small>Low</small>
            </div>
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.outOfStockCount || 0) * 15)}%`,
                }}
              />
              <small>Out</small>
            </div>
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.receivedToday || 0) * 20)}%`,
                }}
              />
              <small>In</small>
            </div>
            <div className="bar-col">
              <span
                style={{
                  height: `${Math.min(100, (metrics.dispatchedToday || 0) * 20)}%`,
                }}
              />
              <small>Out</small>
            </div>
          </div>
          <p className="caption">Live metrics snapshot from database</p>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Low Stock Alerts</h4>
          </div>
          <ul className="list-lines">
            {lowStock.length === 0 ? (
              <li>
                <strong>No alerts</strong>
                <span>All items healthy</span>
              </li>
            ) : null}
            {lowStock.map((item) => (
              <li key={item._id}>
                <strong>{item.name}</strong>
                <span>
                  {item.stock} left (reorder {item.reorderLevel})
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Recents Transaction</h4>
          </div>
          <ul className="list-lines">
            {recent.length === 0 ? (
              <li>
                <strong>No activity</strong>
                <span>Start receiving/dispatching stock</span>
              </li>
            ) : null}
            {recent.slice(0, 3).map((movement) => (
              <li key={movement._id}>
                <strong>
                  {movement.reference ||
                    movement.product?.name ||
                    "Stock Event"}
                </strong>
                <span>
                  {movement.type} {movement.quantity} items
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Top Products</h4>
          </div>
          <ul className="list-lines">
            {lowStock.slice(0, 3).map((item) => (
              <li key={item._id}>
                <strong>{item.name}</strong>
                <span>Reorder target {item.reorderLevel}</span>
              </li>
            ))}
            {lowStock.length === 0 ? (
              <li>
                <strong>Healthy inventory</strong>
                <span>No urgent products</span>
              </li>
            ) : null}
          </ul>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Dashboard;
