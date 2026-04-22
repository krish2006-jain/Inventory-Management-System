import WorkspaceLayout from "../components/WorkspaceLayout";

function Suppliers() {
  const actions = (
    <>
      <button className="icon-btn" type="button" aria-label="Notifications">
        !
      </button>
      <button className="subtle-btn" type="button">
        Export Reports
      </button>
      <button className="primary-btn" type="button">
        Add Supplier
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Suppliers" actions={actions}>
      <section className="supplier-controls">
        <button className="chip-btn" type="button">
          Categories
        </button>
        <button className="chip-btn" type="button">
          Sort by Name
        </button>
        <button className="chip-btn right" type="button">
          Add
        </button>
      </section>

      <section className="supplier-grid">
        <article className="panel-surface supplier-tile">Supplier 1</article>
        <article className="panel-surface supplier-tile">Supplier 2</article>
        <article className="panel-surface supplier-tile">Supplier 3</article>
        <article className="panel-surface supplier-tile">Supplier 4</article>
        <article className="panel-surface supplier-tile">Supplier 5</article>
        <article className="panel-surface supplier-tile create">
          Create a Supplier
        </article>
      </section>

      <section className="panel-surface supplier-highlight">
        Top best seller of this month
      </section>
    </WorkspaceLayout>
  );
}

export default Suppliers;
