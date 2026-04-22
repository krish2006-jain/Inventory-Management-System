import WorkspaceLayout from "../components/WorkspaceLayout";

const suppliers = [
  { name: "TechParts Ltd", category: "Electronics", products: 24, rating: "★★★★★" },
  { name: "PackMaster", category: "Packaging", products: 18, rating: "★★★★☆" },
  { name: "SafetyFirst Co", category: "Safety Gear", products: 12, rating: "★★★★★" },
  { name: "Label World", category: "Labels & Tags", products: 36, rating: "★★★☆☆" },
  { name: "CleanPro", category: "Cleaning", products: 15, rating: "★★★★☆" },
];

function Suppliers() {
  const actions = (
    <>
      <button className="icon-btn" type="button" aria-label="Notifications">🔔</button>
      <button className="subtle-btn" type="button">Export Reports</button>
      <button className="primary-btn" type="button">Add Supplier</button>
    </>
  );

  return (
    <WorkspaceLayout title="Suppliers" actions={actions}>
      <section className="supplier-controls">
        <button className="chip-btn" type="button">Categories</button>
        <button className="chip-btn" type="button">Sort by Name</button>
        <button className="chip-btn right" type="button">Add</button>
      </section>

      <section className="supplier-grid">
        {suppliers.map((s) => (
          <article key={s.name} className="panel-surface supplier-tile">
            <div className="supplier-avatar">{s.name[0]}</div>
            <h4>{s.name}</h4>
            <p className="supplier-cat">{s.category}</p>
            <p className="supplier-meta">{s.products} products &nbsp; {s.rating}</p>
          </article>
        ))}
        <article className="panel-surface supplier-tile create">
          <span className="add-icon">+</span>
          <h4>Create a Supplier</h4>
        </article>
      </section>

      <section className="panel-surface supplier-highlight">
        <h3>Top best seller of this month</h3>
        <div className="top-seller-cards">
          <div className="top-seller-card">
            <strong>TechParts Ltd</strong>
            <span>₹2,48,000 sales</span>
          </div>
          <div className="top-seller-card">
            <strong>PackMaster</strong>
            <span>₹1,12,000 sales</span>
          </div>
          <div className="top-seller-card">
            <strong>SafetyFirst Co</strong>
            <span>₹89,000 sales</span>
          </div>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Suppliers;
