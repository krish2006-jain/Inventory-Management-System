import { useState, useEffect } from "react";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

export default function DailySummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/sales/today")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <WorkspaceLayout>
      <div className="page-header">
        <h1>Daily Summary</h1>
        <p className="page-subtitle">Your shift performance for today</p>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton-card"></div>)}
        </div>
      ) : !data ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Data Available</h3>
          <p>Could not load today&apos;s summary. Try again later.</p>
        </div>
      ) : (
        <>
          <div className="kpi-cards">
            <div className="kpi-card">
              <div className="kpi-label">Sales Completed</div>
              <div className="kpi-value">{data.summary.totalSales}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{fmt(data.summary.totalRevenue)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Cash</div>
              <div className="kpi-value">{fmt(data.summary.cashTotal)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Card</div>
              <div className="kpi-value">{fmt(data.summary.cardTotal)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">UPI</div>
              <div className="kpi-value">{fmt(data.summary.upiTotal)}</div>
            </div>
          </div>

          <div className="section-header" style={{ marginTop: 32 }}>
            <h2>Today&apos;s Transactions</h2>
          </div>

          {data.sales.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <h3>No sales yet today</h3>
              <p>Complete a sale from POS and it will appear here.</p>
            </div>
          ) : (
            <div className="table-shell">
              <div className="table-head-row" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
                <div>Sale ID</div>
                <div>Time</div>
                <div>Items</div>
                <div>Payment</div>
                <div style={{ textAlign: "right" }}>Total</div>
              </div>
              <div className="table-body">
                {data.sales.map((s) => (
                  <div className="table-data-row" key={s._id} style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr" }}>
                    <div className="product-name">{s.saleId}</div>
                    <div>{new Date(s.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                    <div>{s.items.length} items</div>
                    <div>
                      <span className={`status-pill status-${s.paymentMethod}`}>
                        {s.paymentMethod.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", fontWeight: 600 }}>{fmt(s.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </WorkspaceLayout>
  );
}
