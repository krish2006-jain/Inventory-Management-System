import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import { useToast } from "../../components/ToastProvider";
import api from "../../services/api";

function SmDashboard() {
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, alertRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/products/low-stock"),
      ]);
      setData(dashRes.data);
      setAlerts(alertRes.data || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </WorkspaceLayout>
    );
  }

  const criticalAlerts = alerts.filter((p) => p.stock === 0);
  const warningAlerts = alerts.filter((p) => p.stock > 0);

  return (
    <WorkspaceLayout>
      {/* KPI Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-label">Total SKUs</div>
          <div className="kpi-value">{data?.totalProducts || 0}</div>
        </div>
        <div className="kpi-card kpi-danger">
          <div className="kpi-label">Out of Stock</div>
          <div className="kpi-value">{data?.outOfStock || 0}</div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-label">Low Stock Alerts</div>
          <div className="kpi-value">{data?.lowStock || 0}</div>
        </div>
        <div className="kpi-card kpi-accent">
          <div className="kpi-label">Categories</div>
          <div className="kpi-value">{data?.categories || 0}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-grid" style={{ marginTop: 16 }}>
        <div className="panel-surface">
          <h4 className="panel-title">Quick Actions</h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 8,
            }}
          >
            <button
              className="primary-btn"
              style={{ minHeight: 44 }}
              onClick={() => navigate("/sm/receive-stock")}
            >
              Order Stock
            </button>
            <button
              className="subtle-btn"
              style={{ minHeight: 44 }}
              onClick={() => navigate("/sm/adjust-stock")}
            >
              Adjust Stock
            </button>
            <button
              className="subtle-btn"
              style={{ minHeight: 44 }}
              onClick={() => navigate("/sm/stock-list")}
            >
              View Inventory
            </button>
            <button
              className="subtle-btn"
              style={{ minHeight: 44 }}
              onClick={() => navigate("/sm/activity-log")}
            >
              Activity Log
            </button>
          </div>
        </div>

        {/* Urgent Alerts */}
        <div className="panel-surface">
          <h4 className="panel-title">Urgent Alerts ({alerts.length})</h4>
          {alerts.length === 0 ? (
            <div className="empty-state-mini">All stock levels healthy</div>
          ) : (
            <div
              className="top-products-list"
              style={{ maxHeight: 300, overflowY: "auto" }}
            >
              {/* Critical first */}
              {criticalAlerts.slice(0, 5).map((p) => (
                <div
                  key={p._id}
                  className="top-product-row"
                  style={{ borderLeft: "3px solid #dc2626", paddingLeft: 8 }}
                >
                  <div className="top-info">
                    <span className="top-name">{p.name}</span>
                    <span className="top-meta">
                      Stock: {p.stock} / Reorder: {p.reorderLevel}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      className="subtle-btn"
                      style={{
                        fontSize: "0.72rem",
                        minHeight: 28,
                        padding: "0 10px",
                      }}
                      onClick={() =>
                        navigate("/sm/receive-stock", { state: { product: p } })
                      }
                    >
                      Order
                    </button>
                    <span className="status-pill status-Cancelled">
                      CRITICAL
                    </span>
                  </div>
                </div>
              ))}
              {warningAlerts.slice(0, 5).map((p) => (
                <div
                  key={p._id}
                  className="top-product-row"
                  style={{ borderLeft: "3px solid #f59e0b", paddingLeft: 8 }}
                >
                  <div className="top-info">
                    <span className="top-name">{p.name}</span>
                    <span className="top-meta">
                      Stock: {p.stock} / Reorder: {p.reorderLevel}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <button
                      className="subtle-btn"
                      style={{
                        fontSize: "0.72rem",
                        minHeight: 28,
                        padding: "0 10px",
                      }}
                      onClick={() =>
                        navigate("/sm/receive-stock", { state: { product: p } })
                      }
                    >
                      Order
                    </button>
                    <span className="status-pill status-Pending">LOW</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="panel-surface" style={{ marginTop: 16 }}>
        <h4 className="panel-title">Recent Activity</h4>
        {(data?.recentActivity || []).length === 0 ? (
          <div className="empty-state-mini">No recent activity</div>
        ) : (
          <div className="top-products-list">
            {data.recentActivity.slice(0, 8).map((act, i) => (
              <div key={i} className="top-product-row">
                <div className="top-info">
                  <span className="top-name">
                    {act.productName || act.product?.name || "Product"}
                  </span>
                  <span className="top-meta">
                    {act.type} | {act.quantity} units | {act.reason}
                  </span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  {new Date(act.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}

export default SmDashboard;
