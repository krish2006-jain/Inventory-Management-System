import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";

function Purchases() {
  const toast = useToast();
  const location = useLocation();
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmReceive, setConfirmReceive] = useState(null);
  const [form, setForm] = useState({
    supplier: "",
    items: [{ product: "", quantity: "", unitCost: "" }],
    notes: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [purRes, prodRes, supRes] = await Promise.all([
        api.get("/purchases"),
        api.get("/products"),
        api.get("/suppliers"),
      ]);
      setPurchases(purRes.data || []);
      setProducts(prodRes.data || []);
      setSuppliers(supRes.data || []);
    } catch {
      toast.error("Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // If navigated from Stock Alerts with a reorder product
  useEffect(() => {
    const reorderProduct = location.state?.reorderProduct;
    if (reorderProduct) {
      setForm({
        supplier: reorderProduct.supplier?._id || reorderProduct.supplier || "",
        items: [{
          product: reorderProduct._id,
          quantity: String(reorderProduct.reorderLevel * 3),
          unitCost: String(reorderProduct.costPrice || reorderProduct.unitPrice || ""),
        }],
        notes: `Reorder for ${reorderProduct.name} (current stock: ${reorderProduct.stock})`,
      });
      setShowForm(true);
      // Clear location state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const addItem = () => setForm({ ...form, items: [...form.items, { product: "", quantity: "", unitCost: "" }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const updateItem = (idx, key, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [key]: val };
    setForm({ ...form, items });
  };

  const calcTotal = () => form.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    const validItems = form.items.filter((item) => item.product && item.quantity > 0);
    if (validItems.length === 0) { toast.error("Add at least one product"); return; }

    setSaving(true);
    try {
      await api.post("/purchases", {
        supplier: form.supplier || null,
        items: validItems.map((item) => ({
          product: item.product,
          quantity: parseInt(item.quantity),
          unitCost: parseFloat(item.unitCost) || 0,
        })),
        notes: form.notes,
      });
      toast.success("Purchase order created");
      setShowForm(false);
      setForm({ supplier: "", items: [{ product: "", quantity: "", unitCost: "" }], notes: "" });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create purchase order");
    } finally {
      setSaving(false);
    }
  };

  const handleReceive = async () => {
    if (!confirmReceive) return;
    try {
      await api.patch(`/purchases/${confirmReceive._id}/receive`);
      toast.success("Purchase order received. Stock updated.");
      setConfirmReceive(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to receive");
    }
  };

  const statusCounts = {
    pending: purchases.filter((p) => p.status === "Pending").length,
    received: purchases.filter((p) => p.status === "Received").length,
    total: purchases.length,
  };

  return (
    <WorkspaceLayout>
      <div className="kpi-cards" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Orders</div>
          <div className="kpi-value">{statusCounts.total}</div>
        </div>
        <div className="kpi-card kpi-warning">
          <div className="kpi-label">Pending</div>
          <div className="kpi-value">{statusCounts.pending}</div>
        </div>
        <div className="kpi-card kpi-success">
          <div className="kpi-label">Received</div>
          <div className="kpi-value">{statusCounts.received}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Purchase Orders</h4>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="subtle-btn" onClick={load}>Refresh</button>
          <button className="primary-btn" onClick={() => { setForm({ supplier: "", items: [{ product: "", quantity: "", unitCost: "" }], notes: "" }); setShowForm(true); }}>
            + Create Order
          </button>
        </div>
      </div>

      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1.5fr" }}>
          <div>Order ID</div>
          <div>Supplier</div>
          <div>Items</div>
          <div>Total</div>
          <div>Status</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        <div className="table-body">
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : purchases.length === 0 ? (
            <div className="empty-state">
              <h3>No purchase orders yet</h3>
              <p>Create a purchase order to restock your inventory.</p>
            </div>
          ) : (
            purchases.map((po) => (
              <div key={po._id} className="table-data-row" style={{ gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1.5fr" }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{po.poNumber || po._id.slice(-6).toUpperCase()}</div>
                <div>
                  <span className="product-name">{po.supplier?.name || "Direct"}</span>
                  <span style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af" }}>
                    {new Date(po.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div>{po.items?.length || 0} items</div>
                <div style={{ fontWeight: 600 }}>{fmt(po.totalCost)}</div>
                <div>
                  <span className={`status-pill ${po.status === "Received" ? "status-Received" : po.status === "Cancelled" ? "status-Cancelled" : "status-Pending"}`}>
                    {po.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  {po.status === "Pending" && (
                    <button
                      className="primary-btn"
                      style={{ fontSize: "0.75rem", minHeight: 30, padding: "0 12px" }}
                      onClick={() => setConfirmReceive(po)}
                    >
                      Mark Received
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create PO Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-box modal-form-large" style={{ maxWidth: 640 }}>
            <h3>Create Purchase Order</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Supplier</label>
                <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Order Items</label>
                <button type="button" className="text-action" onClick={addItem}>+ Add Item</button>
              </div>

              {form.items.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                  <select value={item.product} onChange={(e) => updateItem(idx, "product", e.target.value)} required style={{ padding: "8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.85rem" }}>
                    <option value="">Select product</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} required style={{ padding: "8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.85rem" }} />
                  <input type="number" min="0" placeholder="Cost ₹" value={item.unitCost} onChange={(e) => updateItem(idx, "unitCost", e.target.value)} style={{ padding: "8px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.85rem" }} />
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "1.1rem" }}>x</button>
                  )}
                </div>
              ))}

              <div style={{ textAlign: "right", fontSize: "0.85rem", fontWeight: 600, margin: "8px 0 14px", color: "#2c5cc6" }}>
                Total: {fmt(calcTotal())}
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes..." />
              </div>

              <div className="modal-actions">
                <button type="button" className="modal-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="modal-btn-confirm" disabled={saving}>{saving ? "Creating..." : "Create Order"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Confirm */}
      {confirmReceive && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmReceive(null); }}>
          <div className="modal-box">
            <h3>Receive Purchase Order</h3>
            <p>Mark this order as received? This will automatically increase stock for all items in the order.</p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmReceive(null)}>Cancel</button>
              <button className="modal-btn-confirm" onClick={handleReceive}>Confirm Received</button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default Purchases;
