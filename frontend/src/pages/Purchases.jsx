import WorkspaceLayout from "../components/WorkspaceLayout";

function Purchases() {
  const actions = (
    <>
      <input
        className="search-input compact"
        type="search"
        placeholder="Search product"
        aria-label="Search product"
      />
      <button className="icon-btn" type="button" aria-label="Notifications">
        !
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Purchases" actions={actions}>
      <section className="purchase-card-grid">
        <article className="panel-surface purchase-card">
          Total Spending
        </article>
        <article className="panel-surface purchase-card">Active POs</article>
        <article className="panel-surface purchase-card">Receive Today</article>
        <article className="panel-surface purchase-card">Create New PO</article>
      </section>

      <section className="purchase-filter-row panel-surface">
        <button className="text-chip" type="button">
          Status All
        </button>
        <button className="text-chip" type="button">
          Last 30 Days
        </button>
        <button className="text-chip" type="button">
          Sort by Date
        </button>
        <button className="text-chip" type="button">
          Export CSV
        </button>
      </section>

      <section className="panel-surface purchase-list-panel">
        All Products
      </section>
    </WorkspaceLayout>
  );
}

export default Purchases;
