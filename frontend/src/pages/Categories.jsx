import WorkspaceLayout from "../components/WorkspaceLayout";

const categories = [
  { name: "Electronics", count: 48, icon: "🔌", color: "#6c4ef2" },
  { name: "Storage & Shelving", count: 32, icon: "📦", color: "#8b5cf6" },
  { name: "Accessories", count: 65, icon: "🏷️", color: "#a78bfa" },
  { name: "Tools & Equipment", count: 27, icon: "🔧", color: "#7c3aed" },
  { name: "Packaging", count: 41, icon: "📋", color: "#6d28d9" },
  { name: "Safety Gear", count: 19, icon: "🦺", color: "#5b21b6" },
  { name: "Labels & Tags", count: 53, icon: "🏷️", color: "#4c1d95" },
  { name: "Cleaning Supplies", count: 22, icon: "🧹", color: "#7e22ce" },
];

function Categories() {
  const actions = (
    <>
      <button className="subtle-btn" type="button">Export</button>
      <button className="primary-btn" type="button">+ Add Category</button>
    </>
  );

  return (
    <WorkspaceLayout title="Categories" actions={actions}>
      <section className="products-toolbar">
        <input className="search-input" type="search" placeholder="Search categories" aria-label="Search categories" />
        <button className="chip-btn" type="button">Sort by Name</button>
        <button className="chip-btn" type="button">Filter</button>
      </section>

      <section className="category-grid">
        {categories.map((cat) => (
          <article key={cat.name} className="category-card panel-surface">
            <div className="category-icon" style={{ background: cat.color }}>
              {cat.icon}
            </div>
            <h4>{cat.name}</h4>
            <p>{cat.count} products</p>
            <div className="category-actions">
              <button className="text-chip" type="button">Edit</button>
              <button className="text-chip" type="button">View</button>
            </div>
          </article>
        ))}
        <article className="category-card category-add panel-surface">
          <span className="add-icon">+</span>
          <p>Add New Category</p>
        </article>
      </section>
    </WorkspaceLayout>
  );
}

export default Categories;
