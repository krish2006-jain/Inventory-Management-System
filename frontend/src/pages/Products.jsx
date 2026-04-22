import WorkspaceLayout from "../components/WorkspaceLayout";

function Products() {
  const actions = (
    <>
      <button className="icon-btn" type="button" aria-label="Notifications">
        !
      </button>
      <button className="subtle-btn" type="button">
        Export Reports
      </button>
      <button className="primary-btn" type="button">
        Add Product
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Product" actions={actions}>
      <section className="products-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search product"
          aria-label="Search products"
        />
        <button className="chip-btn" type="button">
          All Categories
        </button>
        <button className="chip-btn" type="button">
          Stock Status
        </button>
      </section>

      <section className="table-shell">
        <header className="table-head-row">
          <span>Product Details</span>
          <span>SKU</span>
          <span>Category</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Status</span>
        </header>

        <div className="table-body-placeholder" aria-hidden="true" />

        <footer className="table-footer">
          <span>Showing 1 to 10 of 240 products</span>
          <span>1 2 3 4</span>
        </footer>
      </section>
    </WorkspaceLayout>
  );
}

export default Products;
