import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function StockList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeta = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch {
      setError("Failed to load category list");
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/products", { params });
      setProducts(res.data || []);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, categoryFilter, statusFilter]);

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadProducts}>
        Refresh
      </button>
      <Link
        to="/sm/receive-stock"
        className="primary-btn"
        style={{
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        Receive Stock
      </Link>
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="search-input"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          className="search-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Stock Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}

      <section className="table-shell">
        <header className="table-head-row">
          <span>Product Details</span>
          <span>SKU</span>
          <span>Category</span>
          <span>Stock</span>
          <span>Price</span>
          <span>Status</span>
        </header>

        <div className="table-body">
          {loading ? (
            <div className="table-data-row">
              <span>Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="table-data-row">
              <span>No products found</span>
            </div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="table-data-row">
                <span className="product-name">
                  <Link
                    to={`/sm/item-details/${product._id}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {product.name}
                  </Link>
                </span>
                <span>{product.sku}</span>
                <span>{product.category?.name || "-"}</span>
                <span>{product.stock}</span>
                <span>{priceFormatter.format(product.unitPrice || 0)}</span>
                <span
                  className={`status-badge ${product.status === "In Stock" ? "badge-green" : product.status === "Low Stock" ? "badge-yellow" : "badge-red"}`}
                >
                  {product.status}
                </span>
              </div>
            ))
          )}
        </div>

        <footer className="table-footer">
          <span>Showing {products.length} products</span>
          <span className="pagination">Page 1</span>
        </footer>
      </section>
    </WorkspaceLayout>
  );
}

export default StockList;
