import WorkspaceLayout from "../components/WorkspaceLayout";

function Dashboard() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">
        Export Report
      </button>
      <button className="primary-btn" type="button">
        + Add Product
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Dashboard" actions={actions}>
      <section className="metrics-grid">
        <article className="metric-card">
          <p>Total Revenue</p>
          <h3>$248,500</h3>
          <span className="metric-up">+12% this month</span>
        </article>
        <article className="metric-card">
          <p>Total Products</p>
          <h3>348</h3>
          <span className="metric-up">+8 added this week</span>
        </article>
        <article className="metric-card">
          <p>Low Stock Items</p>
          <h3>12</h3>
          <span className="metric-down">Needs reorder</span>
        </article>
        <article className="metric-card">
          <p>Today's Sales</p>
          <h3>$18,240</h3>
          <span className="metric-down">-3% vs yesterday</span>
        </article>
      </section>

      <section className="analytics-grid">
        <article className="panel chart-panel">
          <div className="panel-head">
            <h4>Weekly Sales</h4>
            <button type="button">View Report</button>
          </div>
          <div className="bars-wrap" aria-label="Weekly sales chart">
            <span style={{ height: "38%" }} />
            <span style={{ height: "58%" }} />
            <span style={{ height: "51%" }} />
            <span style={{ height: "72%" }} />
            <span style={{ height: "56%" }} />
            <span style={{ height: "84%" }} />
            <span style={{ height: "32%" }} />
          </div>
          <p className="caption">Peak: Saturday Total: $112,400</p>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Low Stock Alerts</h4>
          </div>
          <ul className="list-lines">
            <li>
              <strong>Wireless Scanner</strong>
              <span>5 units left</span>
            </li>
            <li>
              <strong>Barcode Labels</strong>
              <span>12 units left</span>
            </li>
            <li>
              <strong>Storage Bin XL</strong>
              <span>8 units left</span>
            </li>
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Recent Transactions</h4>
          </div>
          <ul className="list-lines">
            <li>
              <strong>PO-1942</strong>
              <span>Received 45 items</span>
            </li>
            <li>
              <strong>SO-8831</strong>
              <span>Dispatched 12 items</span>
            </li>
            <li>
              <strong>RT-1209</strong>
              <span>2 items returned</span>
            </li>
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h4>Top Products</h4>
          </div>
          <ul className="list-lines">
            <li>
              <strong>Smart Shelving Kit</strong>
              <span>1,240 sold</span>
            </li>
            <li>
              <strong>QR Scanner Pro</strong>
              <span>980 sold</span>
            </li>
            <li>
              <strong>Label Printer Mini</strong>
              <span>770 sold</span>
            </li>
          </ul>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Dashboard;
