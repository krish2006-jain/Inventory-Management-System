import { useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products/movements", {
        params: { limit: 150 },
      });
      setLogs(res.data || []);
    } catch {
      setError("Failed to load activity log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const key = search.toLowerCase();
    return logs.filter((log) =>
      [
        log.product?.name,
        log.type,
        log.reason,
        log.reference,
        log.performedBy?.username,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(key)),
    );
  }, [logs, search]);

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadLogs}>
        Refresh
      </button>
      <span className="text-chip">Audit timeline</span>
    </>
  );

  return (
    <WorkspaceLayout title="Activity Log" actions={actions}>
      <section className="products-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search activity"
          aria-label="Search logs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="text-chip" aria-label="Total records">
          Total: {logs.length}
        </span>
        <span className="text-chip" aria-label="Filtered records">
          Filtered: {filteredLogs.length}
        </span>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}

      <section className="table-shell">
        <header
          className="table-head-row"
          style={{
            gridTemplateColumns: "0.7fr 1.3fr 1fr 0.8fr 0.8fr 1fr 0.8fr",
          }}
        >
          <span>Time</span>
          <span>Item</span>
          <span>Action</span>
          <span>Change</span>
          <span>New Qty</span>
          <span>Reason</span>
          <span>By</span>
        </header>

        <div className="table-body">
          {loading ? (
            <div
              className="table-data-row"
              style={{
                gridTemplateColumns: "0.7fr 1.3fr 1fr 0.8fr 0.8fr 1fr 0.8fr",
              }}
            >
              <span>Loading log entries...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div
              className="table-data-row"
              style={{
                gridTemplateColumns: "0.7fr 1.3fr 1fr 0.8fr 0.8fr 1fr 0.8fr",
              }}
            >
              <span>No activity found</span>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const actionLabel =
                log.type === "receive"
                  ? "Received"
                  : log.type === "dispatch"
                    ? "Dispatched"
                    : "Adjusted";

              return (
                <div
                  key={log._id}
                  className="table-data-row"
                  style={{
                    gridTemplateColumns:
                      "0.7fr 1.3fr 1fr 0.8fr 0.8fr 1fr 0.8fr",
                  }}
                >
                  <span>
                    {new Date(log.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="product-name">
                    {log.product?.name || "Unknown"}
                  </span>
                  <span
                    className={`status-badge ${actionLabel === "Received" ? "badge-green" : actionLabel === "Dispatched" ? "badge-blue" : "badge-yellow"}`}
                  >
                    {actionLabel}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      color: log.direction === "in" ? "#38a169" : "#e53e3e",
                    }}
                  >
                    {log.direction === "in" ? "+" : "-"}
                    {log.quantity}
                  </span>
                  <span>{log.newStock}</span>
                  <span>{log.reason || log.reference || "-"}</span>
                  <span>{log.performedBy?.username || "System"}</span>
                </div>
              );
            })
          )}
        </div>

        <footer
          className="table-footer"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          <span>Showing {filteredLogs.length} records</span>
          <span className="pagination">Page 1</span>
        </footer>
      </section>
    </WorkspaceLayout>
  );
}

export default ActivityLog;
