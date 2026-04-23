import { useEffect, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import api from "../services/api";

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  supplier: "",
  unitPrice: "",
  stock: "",
  reorderLevel: "",
  unit: "Unit",
  location: "",
  description: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadMeta = async () => {
    try {
      const [catRes, supRes] = await Promise.all([
        api.get("/categories"),
        api.get("/suppliers"),
      ]);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
    } catch {
      setError("Failed to load category/supplier lists");
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

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/products", {
        ...form,
        unitPrice: Number(form.unitPrice),
        stock: Number(form.stock || 0),
        reorderLevel: Number(form.reorderLevel || 0),
        supplier: form.supplier || null,
      });
      setForm(emptyForm);
      setSuccess("Product added successfully");
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadProducts}>
        Refresh
      </button>
      <button
        className="primary-btn"
        type="button"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Close" : "Add Product"}
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Product" actions={actions}>
      {showForm ? (
        <section className="panel-surface" style={{ marginTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>Create Product</h4>
          <form
            onSubmit={handleCreate}
            className="settings-form-grid"
            style={{ marginTop: 12 }}
          >
            <label className="settings-field">
              Product Name
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </label>
            <label className="settings-field">
              SKU
              <input
                value={form.sku}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sku: e.target.value.toUpperCase(),
                  }))
                }
                required
              />
            </label>
            <label className="settings-field">
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Supplier
              <select
                value={form.supplier}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, supplier: e.target.value }))
                }
              >
                <option value="">No Supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Unit Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unitPrice: e.target.value }))
                }
                required
              />
            </label>
            <label className="settings-field">
              Opening Stock
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, stock: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Reorder Level
              <input
                type="number"
                min="0"
                value={form.reorderLevel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, reorderLevel: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Unit
              <input
                value={form.unit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unit: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Location
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Aisle B, Shelf 3"
              />
            </label>
            <label className="settings-field">
              Description
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

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
          aria-label="Category filter"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          className="search-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Stock status filter"
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
      {success ? (
        <p style={{ color: "#1e7d4f", fontWeight: 700 }}>{success}</p>
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
            products.map((p) => (
              <div key={p._id} className="table-data-row">
                <span className="product-name">{p.name}</span>
                <span>{p.sku}</span>
                <span>{p.category?.name || "-"}</span>
                <span>{p.stock}</span>
                <span>{priceFormatter.format(p.unitPrice || 0)}</span>
                <span
                  className={`status-badge ${p.status === "In Stock" ? "badge-green" : p.status === "Low Stock" ? "badge-yellow" : "badge-red"}`}
                >
                  {p.status}
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

export default Products;
