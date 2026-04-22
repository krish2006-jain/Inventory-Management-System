import WorkspaceLayout from "../components/WorkspaceLayout";

const purchaseOrders = [
  { id: "PO-2041", supplier: "TechParts Ltd", items: 24, total: "₹48,200", status: "Received", date: "18 Mar" },
  { id: "PO-2040", supplier: "PackMaster", items: 50, total: "₹12,500", status: "In Transit", date: "17 Mar" },
  { id: "PO-2039", supplier: "SafetyFirst Co", items: 15, total: "₹22,800", status: "Pending", date: "16 Mar" },
  { id: "PO-2038", supplier: "Label World", items: 100, total: "₹4,500", status: "Received", date: "15 Mar" },
  { id: "PO-2037", supplier: "CleanPro", items: 30, total: "₹9,200", status: "Cancelled", date: "14 Mar" },
];

function Purchases() {
  const actions = (
    <>
      <input className="search-input compact" type="search" placeholder="Search product" aria-label="Search product" />
      <button className="icon-btn" type="button" aria-label="Notifications">🔔</button>
    </>
  );

  return (
    <WorkspaceLayout title="Purchases" actions={actions}>
      <section className="purchase-card-grid">
        <article className="panel-surface purchase-card">
          <span className="purchase-icon">💰</span>
          <h3>₹1,24,800</h3>
          <p>Total Spending</p>
        </article>
        <article className="panel-surface purchase-card">
          <span className="purchase-icon">📋</span>
          <h3>12</h3>
          <p>Active POs</p>
        </article>
        <article className="panel-surface purchase-card">
          <span className="purchase-icon">📥</span>
          <h3>3</h3>
          <p>Receive Today</p>
        </article>
        <article className="panel-surface purchase-card purchase-card-cta">
          <span className="purchase-icon">➕</span>
          <h3>Create</h3>
          <p>New PO</p>
        </article>
      </section>

      <section className="purchase-filter-row panel-surface">
        <button className="text-chip" type="button">Status: All</button>
        <button className="text-chip" type="button">Last 30 Days</button>
        <button className="text-chip" type="button">Sort by Date</button>
        <button className="text-chip" type="button" style={{ marginLeft: "auto" }}>Export CSV</button>
      </section>

      <section className="table-shell">
        <header className="table-head-row" style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 1fr 0.7fr" }}>
          <span>PO #</span><span>Supplier</span><span>Items</span><span>Total</span><span>Status</span><span>Date</span>
        </header>
        <div className="table-body">
          {purchaseOrders.map((po) => (
            <div key={po.id} className="table-data-row" style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 1fr 0.7fr" }}>
              <span style={{ fontWeight: 700 }}>{po.id}</span>
              <span>{po.supplier}</span>
              <span>{po.items}</span>
              <span>{po.total}</span>
              <span className={`status-badge ${po.status === "Received" ? "badge-green" : po.status === "In Transit" ? "badge-blue" : po.status === "Pending" ? "badge-yellow" : "badge-red"}`}>
                {po.status}
              </span>
              <span>{po.date}</span>
            </div>
          ))}
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Purchases;
