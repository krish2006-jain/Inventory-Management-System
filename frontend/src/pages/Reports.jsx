import { useState, useEffect, useCallback } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/summary");
      setData(res.data);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/reports/pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "_");
      link.href = url;
      link.setAttribute("download", `Stockly_Report_${dateStr}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="skeleton-grid">
          {[1,2,3,4].map((i) => <div key={i} className="skeleton-card"></div>)}
        </div>
      </WorkspaceLayout>
    );
  }

  if (!data) {
    return (
      <WorkspaceLayout>
        <div className="empty-state">
          <h3>No report data available</h3>
          <p>There is no data in the system to generate reports from.</p>
        </div>
      </WorkspaceLayout>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "sales", label: "Sales Analysis" },
    { id: "inventory", label: "Inventory" },
    { id: "payments", label: "Payments" },
  ];

  const maxTrend = Math.max(...(data.revenueTrend || []).map((r) => r.revenue), 1);
  const catEntries = Object.entries(data.categorySales || {}).filter(([, v]) => v > 0);
  const maxCat = Math.max(...catEntries.map(([, v]) => v), 1);

  return (
    <WorkspaceLayout>
      {/* Tab row + download */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={activeTab === t.id ? "primary-btn" : "subtle-btn"}
              style={{ minHeight: 34, fontSize: "0.8rem" }}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button className="primary-btn" onClick={downloadPDF} disabled={downloading}>
          {downloading ? "Generating..." : "Download PDF"}
        </button>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <>
          <div className="kpi-cards">
            <div className="kpi-card kpi-accent">
              <div className="kpi-label">Revenue</div>
              <div className="kpi-value">{fmt(data.revenue)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Invoices</div>
              <div className="kpi-value">{data.invoices}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">GST Collected</div>
              <div className="kpi-value">{fmt(data.taxCollected)}</div>
            </div>
            <div className="kpi-card kpi-danger">
              <div className="kpi-label">Loss (Adjustments)</div>
              <div className="kpi-value">{fmt(data.loss)}</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel-surface">
              <h4 className="panel-title">Inventory Snapshot</h4>
              <div className="top-products-list">
                {[
                  ["Total Products", data.totalProducts],
                  ["Categories", data.totalCategories],
                  ["Low Stock Items", data.lowStock],
                  ["Out of Stock", data.outOfStock],
                  ["Inventory Value", fmt(data.totalStockValue)],
                ].map(([label, value]) => (
                  <div key={label} className="top-product-row">
                    <div className="top-info"><span className="top-name">{label}</span></div>
                    <span className="top-revenue">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-surface">
              <h4 className="panel-title">Revenue Trend (6 Months)</h4>
              {(data.revenueTrend || []).length === 0 ? (
                <div className="empty-state-mini">No trend data</div>
              ) : (
                <div className="distribution-list">
                  {data.revenueTrend.map((m) => (
                    <div key={m.month} className="dist-row">
                      <div className="dist-info" style={{ minWidth: 80 }}>
                        <span className="dist-name">{m.month}</span>
                        <span className="dist-meta">{m.count} sales</span>
                      </div>
                      <div className="dist-bar-track">
                        <div className="dist-bar-fill" style={{ width: `${(m.revenue / maxTrend) * 100}%` }}></div>
                      </div>
                      <span className="dist-value">{fmt(m.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Sales Analysis Tab ── */}
      {activeTab === "sales" && (
        <>
          <div className="kpi-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="kpi-card kpi-accent">
              <div className="kpi-label">Total Revenue</div>
              <div className="kpi-value">{fmt(data.revenue)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Average Sale</div>
              <div className="kpi-value">{data.invoices > 0 ? fmt(data.revenue / data.invoices) : "₹0"}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Total Invoices</div>
              <div className="kpi-value">{data.invoices}</div>
            </div>
          </div>

          <div className="panel-surface" style={{ marginTop: 14 }}>
            <h4 className="panel-title">Sales by Category</h4>
            {catEntries.length === 0 ? (
              <div className="empty-state-mini">No category sales data</div>
            ) : (
              <div className="distribution-list">
                {catEntries.sort((a, b) => b[1] - a[1]).map(([name, value]) => (
                  <div key={name} className="dist-row">
                    <div className="dist-info" style={{ minWidth: 120 }}>
                      <span className="dist-name">{name}</span>
                    </div>
                    <div className="dist-bar-track">
                      <div className="dist-bar-fill" style={{ width: `${(value / maxCat) * 100}%` }}></div>
                    </div>
                    <span className="dist-value">{fmt(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Inventory Tab ── */}
      {activeTab === "inventory" && (
        <>
          <div className="kpi-cards" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="kpi-card">
              <div className="kpi-label">Total Products</div>
              <div className="kpi-value">{data.totalProducts}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Categories</div>
              <div className="kpi-value">{data.totalCategories}</div>
            </div>
            <div className="kpi-card kpi-warning">
              <div className="kpi-label">Low Stock</div>
              <div className="kpi-value">{data.lowStock}</div>
            </div>
            <div className="kpi-card kpi-danger">
              <div className="kpi-label">Out of Stock</div>
              <div className="kpi-value">{data.outOfStock}</div>
            </div>
          </div>
          <div className="kpi-cards" style={{ marginTop: 14, gridTemplateColumns: "1fr" }}>
            <div className="kpi-card kpi-accent">
              <div className="kpi-label">Total Inventory Value</div>
              <div className="kpi-value">{fmt(data.totalStockValue)}</div>
            </div>
          </div>
        </>
      )}

      {/* ── Payments Tab ── */}
      {activeTab === "payments" && (
        <>
          <div className="kpi-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            <div className="kpi-card">
              <div className="kpi-label">Cash</div>
              <div className="kpi-value">{fmt(data.paymentBreakdown?.cash)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Card</div>
              <div className="kpi-value">{fmt(data.paymentBreakdown?.card)}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">UPI</div>
              <div className="kpi-value">{fmt(data.paymentBreakdown?.upi)}</div>
            </div>
          </div>

          <div className="panel-surface" style={{ marginTop: 14 }}>
            <h4 className="panel-title">Payment Method Distribution</h4>
            {(() => {
              const total = (data.paymentBreakdown?.cash || 0) + (data.paymentBreakdown?.card || 0) + (data.paymentBreakdown?.upi || 0);
              if (total === 0) return <div className="empty-state-mini">No payment data</div>;
              return (
                <div className="distribution-list">
                  {[
                    { name: "Cash", value: data.paymentBreakdown.cash },
                    { name: "Card", value: data.paymentBreakdown.card },
                    { name: "UPI", value: data.paymentBreakdown.upi },
                  ].map((pm) => (
                    <div key={pm.name} className="dist-row">
                      <div className="dist-info" style={{ minWidth: 60 }}>
                        <span className="dist-name">{pm.name}</span>
                        <span className="dist-meta">{total > 0 ? ((pm.value / total) * 100).toFixed(1) : 0}%</span>
                      </div>
                      <div className="dist-bar-track">
                        <div className="dist-bar-fill" style={{ width: `${total > 0 ? (pm.value / total) * 100 : 0}%` }}></div>
                      </div>
                      <span className="dist-value">{fmt(pm.value)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </>
      )}
    </WorkspaceLayout>
  );
}

export default Reports;
