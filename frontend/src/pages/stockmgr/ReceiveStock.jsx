import WorkspaceLayout from "../../components/WorkspaceLayout";

function ReceiveStock() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export Report</button>
      <button className="primary-btn" type="button">+ Add Product</button>
    </>
  );

  return (
    <WorkspaceLayout title="Receive Stock" actions={actions}>
      {/* Step Progress */}
      <section className="step-progress">
        <div className="step active">
          <div className="step-num">1</div>
          <span>Scan item</span>
        </div>
        <div className="step-line" />
        <div className="step">
          <div className="step-num">2</div>
          <span>Enter Details</span>
        </div>
        <div className="step-line" />
        <div className="step">
          <div className="step-num">3</div>
          <span>Assign Location</span>
        </div>
        <div className="step-line" />
        <div className="step">
          <div className="step-num">4</div>
          <span>Confirm</span>
        </div>
      </section>

      {/* Scan + Pending */}
      <section className="receive-grid">
        <article className="panel-surface receive-scan-panel">
          <div className="scan-area">
            <div className="scan-icon">📸</div>
            <p>Scan item barcode or QR code</p>
            <button className="primary-btn" type="button" style={{ marginTop: 12 }}>Open Scanner</button>
          </div>
        </article>

        <article className="panel-surface receive-pending-panel">
          <h4>Pending Shipments</h4>
          <ul className="list-lines">
            <li>
              <strong>PO-2041 — TechParts Ltd</strong>
              <span>24 items expected</span>
            </li>
            <li>
              <strong>PO-2040 — PackMaster</strong>
              <span>50 items expected</span>
            </li>
            <li>
              <strong>PO-2039 — SafetyFirst Co</strong>
              <span>15 items expected</span>
            </li>
          </ul>
        </article>
      </section>

      {/* Item Details */}
      <section className="panel-surface" style={{ marginTop: 12, minHeight: 200, padding: 20 }}>
        <h4>Item Details</h4>
        <p style={{ color: "#63709c", marginTop: 8 }}>Scan or select an item to view details here.</p>
        <div className="receive-form-grid" style={{ marginTop: 16 }}>
          <label className="settings-field">
            Product Name
            <input type="text" placeholder="Auto-filled after scan" readOnly />
          </label>
          <label className="settings-field">
            Quantity Received
            <input type="number" placeholder="Enter quantity" />
          </label>
          <label className="settings-field">
            Condition
            <select style={{ minHeight: 40, borderRadius: 10, border: "1px solid #dfe4ff", padding: "0 10px" }}>
              <option>Good</option>
              <option>Damaged</option>
              <option>Partial</option>
            </select>
          </label>
          <label className="settings-field">
            Assign Location
            <input type="text" placeholder="e.g. Aisle B, Shelf 3" />
          </label>
        </div>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button className="primary-btn" type="button">Confirm Receipt</button>
          <button className="subtle-btn" type="button">Cancel</button>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default ReceiveStock;
