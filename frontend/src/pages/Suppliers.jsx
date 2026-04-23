import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const supplierFormState = {
  name: "",
  category: "General",
  email: "",
  phone: "",
  address: "",
  rating: "4.5",
};

function Suppliers() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(supplierFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManage = user?.role === "owner";

  const loadSuppliers = useCallback(async (keyword = "") => {
    setLoading(true);
    setError("");
    try {
      const params = keyword.trim() ? { search: keyword.trim() } : {};
      const res = await api.get("/suppliers", { params });
      setSuppliers(res.data || []);
    } catch {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuppliers(search);
    }, 220);

    return () => clearTimeout(timer);
  }, [search, loadSuppliers]);

  const supplierMetrics = useMemo(() => {
    const categories = new Set();
    let totalRating = 0;
    let totalProducts = 0;

    suppliers.forEach((supplier) => {
      categories.add(supplier.category || "General");
      totalRating += Number(supplier.rating || 0);
      totalProducts += Number(supplier.productCount || 0);
    });

    return {
      categoryCount: categories.size,
      averageRating: suppliers.length
        ? (totalRating / suppliers.length).toFixed(1)
        : "0.0",
      totalProducts,
    };
  }, [suppliers]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/suppliers", {
        ...form,
        rating: Number(form.rating),
      });
      setForm(supplierFormState);
      setShowForm(false);
      setSuccess("Supplier created successfully");
      await loadSuppliers(search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <>
      {canManage ? (
        <button
          className="primary-btn"
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Form" : "Add Supplier"}
        </button>
      ) : null}
    </>
  );

  return (
    <WorkspaceLayout title="Suppliers" actions={actions}>
      {showForm ? (
        <section className="panel-surface" style={{ marginTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>Create Supplier</h4>
          <form
            onSubmit={handleCreate}
            className="settings-form-grid"
            style={{ marginTop: 12 }}
          >
            <label className="settings-field">
              Supplier Name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Category
              <input
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Phone
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Address
              <input
                value={form.address}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Rating (0-5)
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, rating: e.target.value }))
                }
              />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Supplier"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="supplier-controls">
        <input
          className="search-input"
          type="search"
          value={search}
          placeholder="Search by supplier, category, or email"
          aria-label="Search suppliers"
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="supplier-metrics">
          <span className="supplier-pill">{suppliers.length} suppliers</span>
          <span className="supplier-pill">
            {supplierMetrics.categoryCount} categories
          </span>
          <span className="supplier-pill">
            Avg rating {supplierMetrics.averageRating}
          </span>
          <span className="supplier-pill">
            {supplierMetrics.totalProducts} linked products
          </span>
        </div>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      {success ? <p className="supplier-success">{success}</p> : null}

      <section className="supplier-grid">
        {loading ? (
          <article className="panel-surface supplier-tile">
            <h4>Loading suppliers...</h4>
          </article>
        ) : suppliers.length === 0 ? (
          <article className="panel-surface supplier-tile">
            <h4>No suppliers found</h4>
            <p className="supplier-meta">
              Try a different search term or create a new supplier.
            </p>
          </article>
        ) : (
          suppliers.map((supplier) => (
            <article key={supplier._id} className="panel-surface supplier-tile">
              <div className="supplier-tile-head">
                <div className="supplier-avatar">
                  {supplier.name?.[0]?.toUpperCase() || "S"}
                </div>
                <div>
                  <h4>{supplier.name}</h4>
                  <p className="supplier-cat">
                    {supplier.category || "General"}
                  </p>
                </div>
              </div>
              <p className="supplier-contact">
                {supplier.email || "No email on file"}
                {supplier.phone ? ` | ${supplier.phone}` : ""}
              </p>
              <p className="supplier-address">
                {supplier.address || "Address not provided"}
              </p>
              <p className="supplier-meta">
                {supplier.productCount || 0} linked products | Rating{" "}
                {Number(supplier.rating || 0).toFixed(1)}
              </p>
            </article>
          ))
        )}
      </section>
    </WorkspaceLayout>
  );
}

export default Suppliers;
