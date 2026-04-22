import { Link } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";

function ItemDetails() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export Reports</button>
      <button className="primary-btn" type="button">Add Categories</button>
    </>
  );

  return (
    <WorkspaceLayout title={<><Link to="/sm/stock-list" className="back-link">← Back to Stock List</Link></>} actions={actions}>
      {/* Item Header */}
      <section className="item-header">
        <div className="item-header-info">
          <h2>Shampoo (200ml)</h2>
          <p>SKU: SH-BLK &nbsp; Barcode: 67676767677</p>
        </div>
        <span className="status-badge badge-yellow" style={{ fontSize: "0.9rem", padding: "6px 16px" }}>Low stock</span>
        <div className="item-header-actions">
          <button className="subtle-btn" type="button">📥 Receive</button>
          <button className="subtle-btn" type="button">📤 Dispatch</button>
          <button className="subtle-btn" type="button">📝 Log adjustment</button>
        </div>
      </section>

      {/* Detail Grid */}
      <section className="item-detail-grid">
        <article className="panel-surface item-detail-card">
          <h4>Units currently available</h4>
          <h2 style={{ fontSize: "2.5rem", margin: "12px 0", color: "#d69e2e" }}>15</h2>
          <p style={{ color: "#e53e3e", fontSize: "0.85rem" }}>Below reorder point of 50 units</p>
          <div style={{ marginTop: 16 }}>
            <h4>Item details</h4>
            <div className="item-props">
              <div><span>Category</span><strong>Personal Care</strong></div>
              <div><span>Brand</span><strong>CleanCo</strong></div>
              <div><span>Unit</span><strong>Bottle (200ml)</strong></div>
              <div><span>Price</span><strong>₹180</strong></div>
              <div><span>Reorder Point</span><strong>50 units</strong></div>
              <div><span>Location</span><strong>Aisle B, Shelf 3</strong></div>
            </div>
          </div>
        </article>

        <article className="panel-surface item-detail-card">
          <h4>Storage location</h4>
          <div className="storage-map">
            <div className="storage-slot active">Aisle B</div>
            <div className="storage-slot">Shelf 3</div>
            <div className="storage-slot">Bin 12</div>
          </div>
        </article>

        <article className="panel-surface item-detail-card">
          <h4>Movement history</h4>
          <ul className="list-lines">
            <li><strong>+50 received</strong><span>15 Mar — PO-2041</span></li>
            <li><strong>-20 dispatched</strong><span>16 Mar — SO-8831</span></li>
            <li><strong>-15 adjustment</strong><span>17 Mar — Damaged</span></li>
          </ul>
        </article>

        <article className="panel-surface item-detail-card">
          <h4>Actions</h4>
          <div className="item-action-list">
            <button className="action-btn-green" type="button">Receive more stock</button>
            <button className="action-btn-default" type="button">Log Adjustment</button>
            <button className="action-btn-red" type="button">Flag issue to owner</button>
          </div>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default ItemDetails;
