import { useState } from "react";
import WorkspaceLayout from "../../components/WorkspaceLayout";

const reasons = [
  { id: "damaged", label: "Damaged", icon: "🔧" },
  { id: "lost", label: "Lost/Missing", icon: "❓" },
  { id: "return", label: "Customer return", icon: "🔄" },
  { id: "count", label: "Count Correction", icon: "📋" },
];

function AdjustStock() {
  const [reason, setReason] = useState("");

  const actions = (
    <>
      <button className="subtle-btn" type="button">Export Report</button>
      <button className="primary-btn" type="button">+ Add Product</button>
    </>
  );

  return (
    <WorkspaceLayout title="Log Stock Adjustment" actions={actions}>
      {/* Select Item */}
      <section className="panel-surface" style={{ marginTop: 14, padding: 20 }}>
        <h4>Select Item</h4>
        <div className="settings-form-grid" style={{ marginTop: 12 }}>
          <label className="settings-field">
            Search Product
            <input type="text" placeholder="Type product name or scan barcode" />
          </label>
          <label className="settings-field">
            Current Stock
            <input type="text" value="45 units" readOnly />
          </label>
        </div>
      </section>

      {/* Adjustment Details */}
      <section className="panel-surface" style={{ marginTop: 12, padding: 20 }}>
        <h4>Adjustment Details</h4>
        <div className="settings-form-grid" style={{ marginTop: 12 }}>
          <label className="settings-field">
            Adjustment Type
            <select style={{ minHeight: 40, borderRadius: 10, border: "1px solid #dfe4ff", padding: "0 10px" }}>
              <option>Decrease</option>
              <option>Increase</option>
            </select>
          </label>
          <label className="settings-field">
            Quantity
            <input type="number" placeholder="Enter quantity" />
          </label>
        </div>
      </section>

      {/* Reason Code */}
      <section className="panel-surface" style={{ marginTop: 12, padding: 20 }}>
        <h4>Reason Code <span style={{ color: "#e53e3e", fontSize: "0.8rem" }}>required</span></h4>
        <div className="reason-grid">
          {reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`reason-card ${reason === r.id ? "active" : ""}`}
              onClick={() => setReason(r.id)}
            >
              <span className="reason-icon">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Note & Evidence */}
      <section className="panel-surface" style={{ marginTop: 12, padding: 20 }}>
        <h4>Note & Evidence</h4>
        <textarea
          className="note-textarea"
          placeholder="Add notes about this adjustment..."
          rows={4}
        />
        <div style={{ marginTop: 10 }}>
          <button className="subtle-btn" type="button">📎 Attach Photo</button>
        </div>
      </section>

      {/* Actions */}
      <section style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button className="action-btn-green" type="button" style={{ flex: 1 }}>
          Save adjustment — will be flagged to owner
        </button>
        <button className="subtle-btn" type="button" style={{ minWidth: 100 }}>Cancel</button>
      </section>
    </WorkspaceLayout>
  );
}

export default AdjustStock;
