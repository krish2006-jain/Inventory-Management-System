import { useState, useEffect, useCallback } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weeklySales, setWeeklySales] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [categoryDist, setCategoryDist] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, weeklyRes, activityRes, catRes, topRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/weekly-sales"),
        api.get("/dashboard/recent-activity"),
        api.get("/dashboard/category-distribution"),
        api.get("/dashboard/top-products"),
      ]);
      setStats(statsRes.data);
      setWeeklySales(weeklyRes.data);
      setRecentActivity(activityRes.data);
      setCategoryDist(catRes.data);
      setTopProducts(topRes.data);
    } catch {
      // keep loading false
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  // Calculate max revenue for bar chart scaling
  const maxRevenue = Math.max(...weeklySales.map((d) => d.revenue), 1);
  const maxCatValue = Math.max(...categoryDist.map((d) => d.value), 1);

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="skeleton-grid">
          {[1,2,3,4].map((i) => <div key={i} className="skeleton-card"></div>)}
        </div>
        <div style={{ marginTop: 20 }}>
          {[1,2,3,4,5].map((i) => <div key={i} className="skeleton-row"></div>)}
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      {/* KPI Cards */}
      <div className="kpi-cards">
        <div className="kpi-card">
          <div className="kpi-label">Total Products</div>
          <div className="kpi-value">{stats?.totalProducts || 0}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Categories</div>
          <div className="kpi-value">{stats?.totalCategories || 0}</div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-label">Low Stock</div>
          <div className="kpi-value">{stats?.lowStock || 0}</div>
        </div>
        <div className="kpi-card kpi-danger">
          <div className="kpi-label">Out of Stock</div>
          <div className="kpi-value">{stats?.outOfStock || 0}</div>
        </div>
        {user?.role === "owner" && stats?.totalStockValue !== undefined && (
          <>
            <div className="kpi-card kpi-accent">
              <div className="kpi-label">Inventory Value</div>
              <div className="kpi-value">{fmt(stats.totalStockValue)}</div>
            </div>
            <div className="kpi-card kpi-success">
              <div className="kpi-label">Potential Profit</div>
              <div className="kpi-value">{fmt(stats.potentialProfit)}</div>
            </div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid">
        {/* Weekly Sales Bar Chart */}
        <div className="panel-surface">
          <h4 className="panel-title">Weekly Sales</h4>
          {weeklySales.length === 0 ? (
            <div className="empty-state-mini">No sales data available</div>
          ) : (
            <div className="bar-chart">
              {weeklySales.map((d) => (
                <div key={d.day} className="bar-col">
                  <div className="bar-value">{d.count > 0 ? fmt(d.revenue) : ""}</div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 2)}%` }}
                    ></div>
                  </div>
                  <div className="bar-label">{d.day}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="panel-surface">
          <h4 className="panel-title">Stock by Category</h4>
          {categoryDist.length === 0 ? (
            <div className="empty-state-mini">No categories found</div>
          ) : (
            <div className="distribution-list">
              {categoryDist.map((cat) => (
                <div key={cat.name} className="dist-row">
                  <div className="dist-info">
                    <span className="dist-name">{cat.name}</span>
                    <span className="dist-meta">{cat.products} products | {cat.totalStock} units</span>
                  </div>
                  <div className="dist-bar-track">
                    <div
                      className="dist-bar-fill"
                      style={{ width: `${(cat.value / maxCatValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="dist-value">{fmt(cat.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dashboard-grid">
        {/* Top Products */}
        <div className="panel-surface">
          <h4 className="panel-title">Top Selling Products</h4>
          {topProducts.length === 0 ? (
            <div className="empty-state-mini">No sales recorded yet</div>
          ) : (
            <div className="top-products-list">
              {topProducts.map((p, i) => (
                <div key={i} className="top-product-row">
                  <span className="top-rank">#{i + 1}</span>
                  <div className="top-info">
                    <span className="top-name">{p.name}</span>
                    <span className="top-meta">{p.quantity} sold</span>
                  </div>
                  <span className="top-revenue">{fmt(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="panel-surface">
          <h4 className="panel-title">Recent Activity</h4>
          {recentActivity.length === 0 ? (
            <div className="empty-state-mini">No activity recorded yet</div>
          ) : (
            <div className="activity-list">
              {recentActivity.map((m) => (
                <div key={m._id} className="activity-row">
                  <div className={`activity-badge ${m.direction === "in" ? "badge-in" : "badge-out"}`}>
                    {m.direction === "in" ? "IN" : "OUT"}
                  </div>
                  <div className="activity-info">
                    <span className="activity-product">{m.product?.name || "Unknown"}</span>
                    <span className="activity-meta">
                      {m.quantity} units | {m.type} | {m.performedBy?.username || "System"}
                    </span>
                  </div>
                  <span className="activity-time">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

export default Dashboard;
