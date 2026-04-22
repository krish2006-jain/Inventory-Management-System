import WorkspaceLayout from "../../components/WorkspaceLayout";

const pickList = [
  { item: "QR Scanner Pro", aisle: "A", shelf: "1", qty: 3, picked: true },
  { item: "Barcode Labels", aisle: "A", shelf: "3", qty: 10, picked: true },
  { item: "Storage Bin XL", aisle: "B", shelf: "2", qty: 2, picked: false },
  { item: "RFID Tags", aisle: "C", shelf: "1", qty: 5, picked: false },
];

function Dispatch() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export Report</button>
      <button className="primary-btn" type="button">+ Add Product</button>
    </>
  );

  return (
    <WorkspaceLayout title="Dispatch" actions={actions}>
      {/* Order Header */}
      <section className="panel-surface" style={{ marginTop: 14, padding: 20 }}>
        <h3 style={{ margin: 0 }}>Order #6767</h3>
      </section>

      {/* Main Grid */}
      <section className="dispatch-grid">
        <article className="panel-surface dispatch-pick-panel">
          <h4>Picking Progress</h4>
          <div className="pick-progress-bar">
            <div className="pick-filled" style={{ width: "50%" }} />
          </div>
          <p style={{ fontSize: "0.82rem", color: "#63709c", marginTop: 6 }}>2 of 4 items picked</p>

          <h4 style={{ marginTop: 20 }}>Pick List — sorted by aisle</h4>
          <div className="pick-list">
            {pickList.map((item, i) => (
              <div key={i} className={`pick-item ${item.picked ? "picked" : ""}`}>
                <span className="pick-check">{item.picked ? "✅" : "⬜"}</span>
                <div className="pick-info">
                  <strong>{item.item}</strong>
                  <span>Aisle {item.aisle}, Shelf {item.shelf} — Qty: {item.qty}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="dispatch-actions" style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <button className="action-btn-green" type="button">Mark all as dispatched</button>
            <button className="action-btn-red" type="button">Flag issue to owner</button>
          </div>
        </article>

        <div className="dispatch-side">
          <article className="panel-surface" style={{ padding: 16 }}>
            <h4>Order Info</h4>
            <div className="item-props" style={{ marginTop: 10 }}>
              <div><span>Customer</span><strong>ABC Corp</strong></div>
              <div><span>Order Date</span><strong>18 Mar 2026</strong></div>
              <div><span>Priority</span><strong>High</strong></div>
              <div><span>Items</span><strong>4 products, 20 units</strong></div>
              <div><span>Warehouse</span><strong>Main Floor</strong></div>
            </div>
          </article>

          <article className="panel-surface" style={{ padding: 16, marginTop: 12 }}>
            <h4>Other Pending</h4>
            <ul className="list-lines">
              <li>
                <strong>Order #6768</strong>
                <span>5 items — DEF Inc</span>
              </li>
              <li>
                <strong>Order #6769</strong>
                <span>3 items — JKL Mart</span>
              </li>
              <li>
                <strong>Order #6770</strong>
                <span>8 items — XYZ Ltd</span>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Dispatch;
