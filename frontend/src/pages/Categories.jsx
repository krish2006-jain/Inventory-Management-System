import { useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const newCategoryState = {
  name: "",
  description: "",
  color: "#6c4ef2",
  icon: "📦",
};

function Categories() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(newCategoryState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canManage = user?.role === "owner" || user?.role === "stockmgr";
  const canDelete = user?.role === "owner";

  const loadCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/categories");
      setCategories(res.data || []);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const key = search.toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(key));
  }, [categories, search]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/categories", form);
      setForm(newCategoryState);
      setShowForm(false);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadCategories}>
        Refresh
      </button>
      {canManage ? (
        <button
          className="primary-btn"
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close" : "+ Add Category"}
        </button>
      ) : null}
    </>
  );

  return (
    <WorkspaceLayout title="Categories" actions={actions}>
      {showForm ? (
        <section className="panel-surface" style={{ marginTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>Create Category</h4>
          <form
            onSubmit={handleCreateCategory}
            className="settings-form-grid"
            style={{ marginTop: 12 }}
          >
            <label className="settings-field">
              Name
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Icon
              <input
                value={form.icon}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, icon: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Color
              <input
                type="color"
                value={form.color}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, color: e.target.value }))
                }
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
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="products-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search categories"
          aria-label="Search categories"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="chip-btn" type="button">
          Count: {categories.length}
        </button>
        <button className="chip-btn" type="button">
          Linked to Products
        </button>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}

      <section className="category-grid">
        {loading ? (
          <article className="category-card panel-surface">
            <p>Loading categories...</p>
          </article>
        ) : filteredCategories.length === 0 ? (
          <article className="category-card panel-surface">
            <p>No categories found</p>
          </article>
        ) : (
          filteredCategories.map((cat) => (
            <article key={cat._id} className="category-card panel-surface">
              <div
                className="category-icon"
                style={{ background: cat.color || "#6c4ef2" }}
              >
                {cat.icon || "📦"}
              </div>
              <h4>{cat.name}</h4>
              <p>{cat.productCount || 0} products</p>
              <div className="category-actions">
                {canDelete ? (
                  <button
                    className="text-chip"
                    type="button"
                    onClick={() => handleDeleteCategory(cat._id)}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </article>
          ))
        )}

        {canManage ? (
          <article
            className="category-card category-add panel-surface"
            onClick={() => setShowForm(true)}
          >
            <span className="add-icon">+</span>
            <p>Add New Category</p>
          </article>
        ) : null}
      </section>
    </WorkspaceLayout>
  );
}

export default Categories;
