import { useEffect, useMemo, useState } from "react";
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

  const canManage = user?.role === "owner";

  const loadSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data || []);
    } catch {
      setError("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return suppliers;
    const key = search.toLowerCase();
    return suppliers.filter((supplier) =>
      [supplier.name, supplier.category, supplier.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(key)),
    );
  }, [suppliers, search]);

  const topSellers = useMemo(
    () =>
      [...suppliers]
        .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
        .slice(0, 3),
    [suppliers],
  );

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/suppliers", {
        ...form,
        rating: Number(form.rating),
      });
      setForm(supplierFormState);
      setShowForm(false);
      await loadSuppliers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadSuppliers}>
        Refresh
      </button>
      {canManage ? (
        <button
          className="primary-btn"
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close" : "Add Supplier"}
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
          placeholder="Search suppliers"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="chip-btn" type="button">
          Total: {suppliers.length}
        </button>
        <button className="chip-btn right" type="button">
          Top 3 highlighted below
        </button>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}

      <section className="supplier-grid">
        {loading ? (
          <article className="panel-surface supplier-tile">
            <h4>Loading suppliers...</h4>
          </article>
        ) : filteredSuppliers.length === 0 ? (
          <article className="panel-surface supplier-tile">
            <h4>No suppliers found</h4>
          </article>
        ) : (
          filteredSuppliers.map((supplier) => (
            <article key={supplier._id} className="panel-surface supplier-tile">
              <div className="supplier-avatar">
                {supplier.name?.[0]?.toUpperCase() || "S"}
              </div>
              <h4>{supplier.name}</h4>
              <p className="supplier-cat">{supplier.category || "General"}</p>
              <p className="supplier-meta">
                {supplier.productCount || 0} products &nbsp;{" "}
                {Number(supplier.rating || 0).toFixed(1)}★
              </p>
            </article>
          ))
        )}

        {canManage ? (
          <article
            className="panel-surface supplier-tile create"
            onClick={() => setShowForm(true)}
          >
            <span className="add-icon">+</span>
            <h4>Create a Supplier</h4>
          </article>
        ) : null}
      </section>

      <section className="panel-surface supplier-highlight">
        <h3>Top best seller of this month</h3>
        <div className="top-seller-cards">
          {topSellers.map((supplier) => (
            <div className="top-seller-card" key={supplier._id}>
              <strong>{supplier.name}</strong>
              <span>{supplier.productCount || 0} linked products</span>
            </div>
          ))}
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Suppliers;
