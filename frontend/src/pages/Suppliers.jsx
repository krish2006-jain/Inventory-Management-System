import { useState, useEffect, useMemo, useCallback } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";

const emptySupplier = { name: "", email: "", phone: "", address: "", category: "", rating: "" };

function Suppliers() {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySupplier);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data || []);
    } catch {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return suppliers;
    const key = search.toLowerCase();
    return suppliers.filter((s) => s.name?.toLowerCase().includes(key) || s.email?.toLowerCase().includes(key));
  }, [suppliers, search]);

  const openCreate = () => { setForm(emptySupplier); setEditingId(null); setShowForm(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, email: s.email || "", phone: s.phone || "", address: s.address || "", category: s.category || "", rating: s.rating || "" });
    setEditingId(s._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, form);
        toast.success("Supplier updated");
      } else {
        await api.post("/suppliers", form);
        toast.success("Supplier created");
      }
      setShowForm(false);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/suppliers/${confirmDelete._id}`);
      toast.success("Supplier deleted");
      setConfirmDelete(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  const renderStars = (rating) => {
    const r = Math.round(Number(rating) || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < r ? "#f59e0b" : "#d1d5db", fontSize: "0.9rem" }}>&#9733;</span>
    ));
  };

  return (
    <WorkspaceLayout>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="search-input compact"
          type="search"
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 300 }}
        />
        <button className="subtle-btn" onClick={load}>Refresh</button>
        <button className="primary-btn" onClick={openCreate}>+ Add Supplier</button>
      </div>

      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1.5fr" }}>
          <div>Name</div>
          <div>Contact</div>
          <div>Category</div>
          <div>Rating</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        <div className="table-body">
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No suppliers found</h3>
              <p>Add your first supplier to start managing procurement.</p>
            </div>
          ) : (
            filtered.map((s) => (
              <div key={s._id} className="table-data-row" style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1.5fr" }}>
                <div>
                  <span className="product-name">{s.name}</span>
                  {s.address && <span style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af" }}>{s.address}</span>}
                </div>
                <div>
                  <span style={{ display: "block", fontSize: "0.82rem" }}>{s.email}</span>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{s.phone}</span>
                </div>
                <div>{s.category || "—"}</div>
                <div>{renderStars(s.rating)}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button className="text-action" onClick={() => openEdit(s)}>Edit</button>
                  <button className="text-action text-danger" onClick={() => setConfirmDelete(s)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-box modal-form-large">
            <h3>{editingId ? "Edit Supplier" : "Add Supplier"}</h3>
            <form onSubmit={handleSave}>
              <div className="modal-form-grid">
                <div className="form-group full-width">
                  <label>Supplier Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Metro Cash & Carry" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="orders@supplier.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9001234567" />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Wholesale" />
                </div>
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="modal-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="modal-btn-confirm" disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="modal-box">
            <h3>Delete Supplier</h3>
            <p>Are you sure you want to delete &ldquo;{confirmDelete.name}&rdquo;?</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="modal-btn-confirm modal-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default Suppliers;
