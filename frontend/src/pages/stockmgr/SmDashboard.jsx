import { useEffect, useState } from "react";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

function SmDashboard() {
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
      setError("Failed to load dashboard data");
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
        Live Mode
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Dashboard" actions={actions}>
      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      {/* Metric Cards */}
      <section className="metrics-grid">
        <article className="metric-card">
          <p>Total SKUs</p>
          <h3>{loading ? "..." : metrics.totalProducts || 0}</h3>
          <span className="metric-up">Across 4 aisles</span>
        </article>
        <article className="metric-card">
          <p>Out of Stocks</p>
          <h3 style={{ color: "#e53e3e" }}>
            {loading ? "..." : metrics.outOfStockCount || 0}
          </h3>
          <span className="metric-down">Needs reorder</span>
        </article>
        <article className="metric-card">
          <p>Low Stock Alerts</p>
          <h3 style={{ color: "#d69e2e" }}>
            {loading ? "..." : metrics.lowStockCount || 0}
          </h3>
          <span className="metric-down">Below reorder point</span>
        </article>
        <article className="metric-card">
          <p>Received Today</p>
          <h3 style={{ color: "#38a169" }}>
            {loading ? "..." : metrics.receivedToday || 0}
          </h3>
          <span className="metric-up">Units logged in</span>
        </article>
      </section>

      {/* Panels Grid */}
      <section className="analytics-grid">
        <article className="panel">
          <div className="panel-head">
            <h4>Urgent Alerts</h4>
          </div>
          <ul className="list-lines">
            {lowStock.length === 0 ? (
              <li>
                <strong>No urgent alerts</strong>
                <span>All inventory healthy</span>
              </li>
            ) : null}
            {lowStock.slice(0, 3).map((product) => (
              <li key={product._id}>
                <strong>{product.name}</strong>
                <span
                  className={
                    (product.stock || 0) === 0 ? "badge-red" : "badge-yellow"
                  }
                >
                  {product.stock} units — reorder at {product.reorderLevel}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Quick Actions</h4>
          </div>
          <div className="quick-actions-grid">
            <a href="/sm/receive-stock" className="quick-action-btn">
              📥 Receive Stock
            </a>
            <a href="/sm/dispatch" className="quick-action-btn">
              📤 Dispatch
            </a>
            <a href="/sm/adjust-stock" className="quick-action-btn">
              🔧 Adjust Stock
            </a>
            <a href="/sm/activity-log" className="quick-action-btn">
              📝 View Logs
            </a>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Recent Movements</h4>
          </div>
          <ul className="list-lines">
            {recent.length === 0 ? (
              <li>
                <strong>No movements</strong>
                <span>No recent operations</span>
              </li>
            ) : null}
            {recent.slice(0, 3).map((movement) => (
              <li key={movement._id}>
                <strong>{movement.product?.name || "Unknown Product"}</strong>
                <span
                  className={
                    movement.type === "receive"
                      ? "badge-green"
                      : movement.type === "dispatch"
                        ? "badge-blue"
                        : "badge-yellow"
                  }
                >
                  {movement.direction === "in" ? "+" : "-"}
                  {movement.quantity} {movement.type}
                </span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Today's Snapshot</h4>
          </div>
          <div className="snapshot-stats">
            <div className="snapshot-item">
              <h3>{metrics.receivedToday || 0}</h3>
              <p>Items Received</p>
            </div>
            <div className="snapshot-item">
              <h3>{metrics.dispatchedToday || 0}</h3>
              <p>Items Dispatched</p>
            </div>
            <div className="snapshot-item">
              <h3>{metrics.adjustedToday || 0}</h3>
              <p>Adjustments</p>
            </div>
            <div className="snapshot-item">
              <h3>{metrics.lowStockCount || 0}</h3>
              <p>Flags Raised</p>
            </div>
          </div>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default SmDashboard;
