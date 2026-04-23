import { useState, useEffect, useMemo, useCallback } from "react";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import { useToast } from "../../components/ToastProvider";
import api from "../../services/api";

function ActivityLog() {
  const toast = useToast();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/stock-movements");
      setMovements(res.data || []);
    } catch {
      toast.error("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = movements;
    if (search.trim()) {
      const key = search.toLowerCase();
      list = list.filter((m) =>
        m.product?.name?.toLowerCase().includes(key) ||
        m.product?.sku?.toLowerCase().includes(key)
      );
    }
    if (filterAction) list = list.filter((m) => m.type === filterAction);
    if (filterDate) {
      const dateStr = new Date(filterDate).toDateString();
      list = list.filter((m) => new Date(m.createdAt).toDateString() === dateStr);
    }
    return list;
  }, [movements, search, filterAction, filterDate]);

  // CSV export
  const exportCSV = () => {
    const headers = ["Time", "Product", "SKU", "Action", "Direction", "Quantity", "Previous Stock", "New Stock", "Reason", "Performed By"];
    const rows = filtered.map((m) => [
      new Date(m.createdAt).toLocaleString("en-IN"),
      m.product?.name || "",
      m.product?.sku || "",
      m.type || "",
      m.direction || "",
      m.quantity || "",
      m.previousStock || "",
      m.newStock || "",
      m.reason || "",
      m.performedBy?.username || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_log_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  return (
    <WorkspaceLayout>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="search-input compact"
          type="search"
          placeholder="Search by product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 240 }}
        />
        <select className="subtle-btn" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} style={{ minWidth: 120 }}>
          <option value="">All Actions</option>
          <option value="receive">Receive</option>
          <option value="adjustment">Adjustment</option>
          <option value="sale">Sale</option>
          <option value="return">Return</option>
        </select>
        <input
          type="date"
          className="subtle-btn"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ minWidth: 140 }}
        />
        <button className="subtle-btn" onClick={() => { setFilterAction(""); setFilterDate(""); setSearch(""); }}>Clear</button>
        <button className="subtle-btn" onClick={load}>Refresh</button>
        <button className="primary-btn" onClick={exportCSV} disabled={filtered.length === 0}>Export CSV</button>
      </div>

      {/* Activity Table */}
      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: "1.2fr 2fr 1fr 0.8fr 1fr 1fr 1.5fr 1.5fr" }}>
          <div>Time</div>
          <div>Product</div>
          <div>Action</div>
          <div>Change</div>
          <div>Previous</div>
          <div>New Stock</div>
          <div>Reason</div>
          <div>Performed By</div>
        </div>
        <div className="table-body">
          {loading ? (
            [1,2,3,4,5].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No activity records</h3>
              <p>Stock movement history will appear here.</p>
            </div>
          ) : (
            filtered.map((m) => (
              <div key={m._id} className="table-data-row" style={{ gridTemplateColumns: "1.2fr 2fr 1fr 0.8fr 1fr 1fr 1.5fr 1.5fr" }}>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {new Date(m.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </div>
                <div>
                  <span className="product-name">{m.product?.name || "—"}</span>
                  <span style={{ display: "block", fontSize: "0.68rem", color: "#9ca3af", fontFamily: "monospace" }}>{m.product?.sku}</span>
                </div>
                <div>
                  <span className={`status-pill ${m.type === "receive" ? "status-Received" : m.type === "sale" ? "status-Pending" : "status-Cancelled"}`}>
                    {m.type}
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: m.direction === "in" ? "#059669" : "#dc2626" }}>
                  {m.direction === "in" ? "+" : "-"}{m.quantity}
                </div>
                <div>{m.previousStock}</div>
                <div style={{ fontWeight: 600 }}>{m.newStock}</div>
                <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{m.reason || "—"}</div>
                <div style={{ fontSize: "0.78rem" }}>{m.performedBy?.username || "System"}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: "8px 0", fontSize: "0.78rem", color: "#9ca3af" }}>
        Showing {filtered.length} of {movements.length} records
      </div>
    </WorkspaceLayout>
  );
}

export default ActivityLog;
