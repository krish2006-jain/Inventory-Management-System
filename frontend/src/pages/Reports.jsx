import WorkspaceLayout from "../components/WorkspaceLayout";

function Reports() {
  const actions = (
    <>
      <span className="text-chip">Export options available soon</span>
    </>
  );

  return (
    <WorkspaceLayout title="Sales Report" actions={actions}>
      {/* Category Filter */}
      <section className="panel-surface report-filter-panel">
        <h4>Category Filter</h4>
        <div className="filter-chips">
          <span className="chip-btn active">All</span>
          <span className="chip-btn">Electronics</span>
          <span className="chip-btn">Accessories</span>
          <span className="chip-btn">Storage</span>
          <span className="chip-btn">Tools</span>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="report-kpi-grid">
        <article className="panel-surface report-kpi-card">
          <span className="kpi-icon">REV</span>
          <h3>₹4,85,200</h3>
          <p>Total Revenues</p>
        </article>
        <article className="panel-surface report-kpi-card">
          <span className="kpi-icon">INV</span>
          <h3>1,247</h3>
          <p>Total Invoices</p>
        </article>
        <article className="panel-surface report-kpi-card">
          <span className="kpi-icon">RET</span>
          <h3>38</h3>
          <p>Return Products</p>
        </article>
        <article className="panel-surface report-kpi-card">
          <span className="kpi-icon">LOS</span>
          <h3>₹12,400</h3>
          <p>Damage Product Loss</p>
        </article>
      </section>

      {/* Charts */}
      <section className="report-chart-grid">
        <article className="panel-surface report-chart">
          <h4>Income Trends</h4>
          <div className="chart-placeholder">
            <div className="mini-bars">
              <span style={{ height: "40%" }} />
              <span style={{ height: "65%" }} />
              <span style={{ height: "50%" }} />
              <span style={{ height: "80%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "90%" }} />
            </div>
          </div>
        </article>
        <article className="panel-surface report-chart">
          <h4>Sales by Category</h4>
          <div className="chart-placeholder">
            <div className="donut-ring">
              <div
                className="donut-segment"
                style={{ "--pct": "35%", "--clr": "#6c4ef2" }}
              />
              <div
                className="donut-segment"
                style={{ "--pct": "25%", "--clr": "#8b5cf6" }}
              />
              <div
                className="donut-segment"
                style={{ "--pct": "20%", "--clr": "#a78bfa" }}
              />
              <div
                className="donut-segment"
                style={{ "--pct": "20%", "--clr": "#c4b5fd" }}
              />
            </div>
            <div className="donut-legend">
              <span>
                <i style={{ background: "#6c4ef2" }} />
                Electronics 35%
              </span>
              <span>
                <i style={{ background: "#8b5cf6" }} />
                Storage 25%
              </span>
              <span>
                <i style={{ background: "#a78bfa" }} />
                Tools 20%
              </span>
              <span>
                <i style={{ background: "#c4b5fd" }} />
                Other 20%
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* Transaction Log */}
      <section className="panel-surface report-log">
        <h4>Transaction Log</h4>
        <div className="log-table">
          <div className="log-row log-header">
            <span>Date</span>
            <span>Invoice</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          <div className="log-row">
            <span>18 Mar</span>
            <span>INV-1001</span>
            <span>ABC Corp</span>
            <span>₹12,500</span>
            <span className="badge-green">Paid</span>
          </div>
          <div className="log-row">
            <span>17 Mar</span>
            <span>INV-1000</span>
            <span>XYZ Ltd</span>
            <span>₹8,200</span>
            <span className="badge-green">Paid</span>
          </div>
          <div className="log-row">
            <span>17 Mar</span>
            <span>INV-0999</span>
            <span>DEF Inc</span>
            <span>₹3,400</span>
            <span className="badge-yellow">Pending</span>
          </div>
          <div className="log-row">
            <span>16 Mar</span>
            <span>INV-0998</span>
            <span>GHI Stores</span>
            <span>₹15,800</span>
            <span className="badge-green">Paid</span>
          </div>
          <div className="log-row">
            <span>16 Mar</span>
            <span>INV-0997</span>
            <span>JKL Mart</span>
            <span>₹6,100</span>
            <span className="badge-red">Refunded</span>
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Reports;
