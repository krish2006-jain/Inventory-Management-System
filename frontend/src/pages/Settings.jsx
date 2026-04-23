import { useState, useEffect, useCallback } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";

// Category management is embedded in Settings
function Settings() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", description: "" });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catSaving, setCatSaving] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);
  const [activeTab, setActiveTab] = useState("store");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, catRes] = await Promise.all([
        api.get("/settings"),
        api.get("/categories"),
      ]);
      setSettings(settingsRes.data);
      setCategories(catRes.data || []);
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/settings", settings);
      setSettings(res.data);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    setCatSaving(true);
    try {
      await api.post("/categories", catForm);
      setCatForm({ name: "", description: "" });
      setShowCatForm(false);
      await load();
      toast.success("Category created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setCatSaving(false);
    }
  };

  const deleteCategory = async () => {
    if (!confirmDeleteCat) return;
    try {
      await api.delete(`/categories/${confirmDeleteCat._id}`);
      setConfirmDeleteCat(null);
      await load();
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot delete — products exist in this category");
    }
  };

  const tabs = [
    { id: "store", label: "Store Info" },
    { id: "tax", label: "Tax & Currency" },
    { id: "categories", label: "Categories" },
  ];

  if (loading) {
    return (
      <WorkspaceLayout>
        <div className="skeleton-grid">
          {[1,2,3].map((i) => <div key={i} className="skeleton-card" style={{ height: 60 }}></div>)}
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={activeTab === t.id ? "primary-btn" : "subtle-btn"}
            style={{ minHeight: 34, fontSize: "0.8rem" }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Store Tab ── */}
      {activeTab === "store" && settings && (
        <form onSubmit={handleSave} className="panel-surface" style={{ maxWidth: 600 }}>
          <h4 className="panel-title">Store Information</h4>
          <div className="modal-form-grid">
            <div className="form-group full-width">
              <label>Store Name</label>
              <input value={settings.storeName || ""} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label>Address</label>
              <textarea value={settings.storeAddress || ""} onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })} rows={2} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={settings.storePhone || ""} onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })} placeholder="9876543210" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={settings.storeEmail || ""} onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })} />
            </div>
            <div className="form-group full-width">
              <label>UPI ID</label>
              <input value={settings.storeUpiId || ""} onChange={(e) => setSettings({ ...settings, storeUpiId: e.target.value })} placeholder="storename@upi" />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      )}

      {/* ── Tax Tab ── */}
      {activeTab === "tax" && settings && (
        <form onSubmit={handleSave} className="panel-surface" style={{ maxWidth: 600 }}>
          <h4 className="panel-title">Tax & Currency Settings</h4>
          <div className="modal-form-grid">
            <div className="form-group">
              <label>Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={settings.taxRate || 18} onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Tax Label</label>
              <input value={settings.taxLabel || "GST"} onChange={(e) => setSettings({ ...settings, taxLabel: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={settings.currency || "INR"} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                <option value="INR">INR (Indian Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Currency Symbol</label>
              <input value={settings.currencySymbol || "₹"} onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>
        </form>
      )}

      {/* ── Categories Tab ── */}
      {activeTab === "categories" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h4 style={{ margin: 0 }}>Categories ({categories.length})</h4>
            <button className="primary-btn" onClick={() => setShowCatForm(true)}>+ Add Category</button>
          </div>

          <div className="table-shell">
            <div className="table-head-row" style={{ gridTemplateColumns: "2fr 3fr 1fr 1fr" }}>
              <div>Name</div>
              <div>Description</div>
              <div>Products</div>
              <div style={{ textAlign: "right" }}>Actions</div>
            </div>
            <div className="table-body">
              {categories.length === 0 ? (
                <div className="empty-state">
                  <h3>No categories yet</h3>
                  <p>Create your first product category to get started.</p>
                </div>
              ) : (
                categories.map((c) => (
                  <div key={c._id} className="table-data-row" style={{ gridTemplateColumns: "2fr 3fr 1fr 1fr" }}>
                    <div className="product-name">{c.name}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>{c.description || "—"}</div>
                    <div>{c.productCount ?? "—"}</div>
                    <div style={{ textAlign: "right" }}>
                      <button className="text-action text-danger" onClick={() => setConfirmDeleteCat(c)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Category Modal */}
      {showCatForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCatForm(false); }}>
          <div className="modal-box">
            <h3>Add Category</h3>
            <form onSubmit={createCategory}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Category Name</label>
                <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Dairy" />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Description</label>
                <textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowCatForm(false)}>Cancel</button>
                <button type="submit" className="modal-btn-confirm" disabled={catSaving}>{catSaving ? "Creating..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Confirm */}
      {confirmDeleteCat && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeleteCat(null); }}>
          <div className="modal-box">
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete &ldquo;{confirmDeleteCat.name}&rdquo;? Categories with existing products cannot be deleted.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmDeleteCat(null)}>Cancel</button>
              <button className="modal-btn-confirm modal-btn-danger" onClick={deleteCategory}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default Settings;
