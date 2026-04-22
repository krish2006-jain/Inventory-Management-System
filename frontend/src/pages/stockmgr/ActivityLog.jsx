import WorkspaceLayout from "../../components/WorkspaceLayout";

const logs = [
  { time: "14:32", item: "QR Scanner Pro", action: "Received", change: "+50", newQty: "170", reason: "PO-2041", by: "Ravi M." },
  { time: "13:15", item: "Barcode Labels", action: "Dispatched", change: "-20", newQty: "12", reason: "SO-8831", by: "Ravi M." },
  { time: "11:45", item: "Storage Bin XL", action: "Adjusted", change: "-5", newQty: "8", reason: "Damaged", by: "Ravi M." },
  { time: "10:20", item: "RFID Tags", action: "Received", change: "+100", newQty: "340", reason: "PO-2040", by: "Jake W." },
  { time: "09:50", item: "Smart Shelving", action: "Dispatched", change: "-15", newQty: "0", reason: "SO-8830", by: "Jake W." },
  { time: "09:10", item: "Cable Ties", action: "Adjusted", change: "-3", newQty: "18", reason: "Count Error", by: "Ravi M." },
  { time: "08:30", item: "Thermal Paper", action: "Received", change: "+30", newQty: "32", reason: "PO-2039", by: "Jake W." },
];

function ActivityLog() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export Reports</button>
      <button className="primary-btn" type="button">Add Product</button>
    </>
  );

  return (
    <WorkspaceLayout title="Activity Log" actions={actions}>
      <section className="products-toolbar">
        <input className="search-input" type="search" placeholder="Search product" aria-label="Search logs" />
        <button className="chip-btn" type="button">All Categories</button>
        <button className="chip-btn" type="button">Stock Status</button>
      </section>

      <section className="table-shell">
        <header className="table-head-row" style={{ gridTemplateColumns: "0.7fr 1.3fr 1fr 0.8fr 0.8fr 1fr 0.8fr" }}>
          <span>Time</span>
          <span>Item</span>
          <span>Action</span>
          <span>Change</span>
          <span>New Qty</span>
          <span>Reason</span>
          <span>By</span>
        </header>

        <div className="table-body">
          {logs.map((l, i) => (
            <div key={i} className="table-data-row" style={{ gridTemplateColumns: "0.7fr 1.3fr 1fr 0.8fr 0.8fr 1fr 0.8fr" }}>
              <span>{l.time}</span>
              <span className="product-name">{l.item}</span>
              <span className={`status-badge ${l.action === "Received" ? "badge-green" : l.action === "Dispatched" ? "badge-blue" : "badge-yellow"}`}>
                {l.action}
              </span>
              <span style={{ fontWeight: 700, color: l.change.startsWith("+") ? "#38a169" : "#e53e3e" }}>{l.change}</span>
              <span>{l.newQty}</span>
              <span>{l.reason}</span>
              <span>{l.by}</span>
            </div>
          ))}
        </div>

        <footer className="table-footer" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <span>Showing 1-7 of 240 products</span>
          <span className="pagination">
            <button>1</button><button>2</button><button>3</button><button>4</button><button>5</button>
          </span>
        </footer>
      </section>
    </WorkspaceLayout>
  );
}

export default ActivityLog;
