import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";

function StockAlerts() {
  const toast = useToast();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/low-stock");
      setAlerts(res.data || []);
    } catch {
      toast.error("Failed to load stock alerts");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const critical = alerts.filter((p) => p.stock === 0);
  const warning = alerts.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel);

  return (
    <WorkspaceLayout>
      {/* Summary */}
      <div className="kpi-cards" style={{ marginBottom: 16 }}>
        <div className="kpi-card kpi-danger">
          <div className="kpi-label">Critical (Out of Stock)</div>
          <div className="kpi-value">{critical.length}</div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-label">Warning (Low Stock)</div>
          <div className="kpi-value">{warning.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Alerts</div>
          <div className="kpi-value">{alerts.length}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Active Stock Alerts</h4>
        <button className="subtle-btn" onClick={load}>Refresh</button>
      </div>

      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1.5fr" }}>
          <div>Product</div>
          <div>SKU</div>
          <div>Category</div>
          <div>Current Stock</div>
          <div>Reorder Level</div>
          <div>Severity</div>
          <div style={{ textAlign: "right" }}>Action</div>
        </div>
        <div className="table-body">
          {loading ? (
            [1,2,3,4].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <h3>All stock levels are healthy</h3>
              <p>No products are below their reorder threshold.</p>
            </div>
          ) : (
            alerts.map((p) => (
              <div key={p._id} className="table-data-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1.5fr" }}>
                <div>
                  <span className="product-name">{p.name}</span>
                  {p.supplier?.name && <span style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af" }}>{p.supplier.name}</span>}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.sku}</div>
                <div>{p.category?.name || "—"}</div>
                <div style={{ fontWeight: 700, color: p.stock === 0 ? "#dc2626" : "#d97706" }}>{p.stock}</div>
                <div>{p.reorderLevel}</div>
                <div>
                  <span className={`status-pill ${p.stock === 0 ? "status-Cancelled" : "status-Pending"}`}>
                    {p.stock === 0 ? "CRITICAL" : "WARNING"}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    className="primary-btn"
                    style={{ fontSize: "0.75rem", minHeight: 30, padding: "0 12px" }}
                    onClick={() => navigate("/purchases", { state: { reorderProduct: p } })}
                  >
                    Create PO
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default StockAlerts;
