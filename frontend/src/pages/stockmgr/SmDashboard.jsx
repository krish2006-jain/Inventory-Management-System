import WorkspaceLayout from "../../components/WorkspaceLayout";

function SmDashboard() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export Report</button>
      <button className="primary-btn" type="button">+ Add Product</button>
    </>
  );

  return (
    <WorkspaceLayout title="Dashboard" actions={actions}>
      {/* Metric Cards */}
      <section className="metrics-grid">
        <article className="metric-card">
          <p>Total SKUs</p>
          <h3>234</h3>
          <span className="metric-up">Across 4 aisles</span>
        </article>
        <article className="metric-card">
          <p>Out of Stocks</p>
          <h3 style={{ color: "#e53e3e" }}>12</h3>
          <span className="metric-down">Needs reorder</span>
        </article>
        <article className="metric-card">
          <p>Low Stock Alerts</p>
          <h3 style={{ color: "#d69e2e" }}>7</h3>
          <span className="metric-down">Below reorder point</span>
        </article>
        <article className="metric-card">
          <p>Received Today</p>
          <h3 style={{ color: "#38a169" }}>34</h3>
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
            <li>
              <strong>Wireless Scanner</strong>
              <span className="badge-red">0 units — Out of Stock</span>
            </li>
            <li>
              <strong>Thermal Paper</strong>
              <span className="badge-red">2 units — Critical</span>
            </li>
            <li>
              <strong>Smart Shelving Kit</strong>
              <span className="badge-yellow">5 units — Low</span>
            </li>
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Quick Actions</h4>
          </div>
          <div className="quick-actions-grid">
            <a href="/sm/receive-stock" className="quick-action-btn">📥 Receive Stock</a>
            <a href="/sm/dispatch" className="quick-action-btn">📤 Dispatch</a>
            <a href="/sm/adjust-stock" className="quick-action-btn">🔧 Adjust Stock</a>
            <a href="/sm/activity-log" className="quick-action-btn">📝 View Logs</a>
          </div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Recent Movements</h4>
          </div>
          <ul className="list-lines">
            <li>
              <strong>QR Scanner Pro</strong>
              <span className="badge-green">+50 received</span>
            </li>
            <li>
              <strong>RFID Tags</strong>
              <span className="badge-blue">-20 dispatched</span>
            </li>
            <li>
              <strong>Cable Ties</strong>
              <span className="badge-yellow">-5 adjustment</span>
            </li>
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Today's Snapshot</h4>
          </div>
          <div className="snapshot-stats">
            <div className="snapshot-item">
              <h3>12</h3>
              <p>Items Received</p>
            </div>
            <div className="snapshot-item">
              <h3>8</h3>
              <p>Items Dispatched</p>
            </div>
            <div className="snapshot-item">
              <h3>3</h3>
              <p>Adjustments</p>
            </div>
            <div className="snapshot-item">
              <h3>2</h3>
              <p>Flags Raised</p>
            </div>
          </div>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default SmDashboard;
