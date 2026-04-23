import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Barcode from "react-barcode";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { useToast } from "../components/ToastProvider";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const emptyProduct = { name: "", sku: "", category: "", supplier: "", unitPrice: "", costPrice: "", stock: "", reorderLevel: "10", unit: "pcs", description: "" };

function Products() {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [barcodeModal, setBarcodeModal] = useState(null);
  const fileRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
        api.get("/suppliers"),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const key = search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(key) || p.sku?.toLowerCase().includes(key));
    }
    if (filterCat) list = list.filter((p) => (p.category?._id || p.category) === filterCat);
    if (filterStatus) list = list.filter((p) => p.status?.toLowerCase().replace(/\s+/g, "-") === filterStatus);
    return list;
  }, [products, search, filterCat, filterStatus]);

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const openCreate = () => { setForm(emptyProduct); setEditingId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, sku: p.sku, category: p.category?._id || p.category || "",
      supplier: p.supplier?._id || p.supplier || "", unitPrice: p.unitPrice, costPrice: p.costPrice || "",
      stock: p.stock, reorderLevel: p.reorderLevel, unit: p.unit || "pcs", description: p.description || "",
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
        toast.success("Product updated");
      } else {
        await api.post("/products", form);
        toast.success("Product created");
      }
      setShowForm(false);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/products/${confirmDelete._id}`);
      toast.success("Product deleted");
      setConfirmDelete(null);
      await loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

  // CSV Import
  const handleCSVImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) { toast.error("CSV file is empty or has no data rows"); return; }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const errors = [];
    let imported = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });

      // Match category by name
      const cat = categories.find((c) => c.name.toLowerCase() === (row.category || "").toLowerCase());
      const sup = suppliers.find((s) => s.name.toLowerCase() === (row.supplier || "").toLowerCase());

      if (!row.name || !row.sku || !cat) {
        errors.push(`Row ${i + 1}: Missing name, SKU, or invalid category "${row.category}"`);
        continue;
      }

      try {
        await api.post("/products", {
          name: row.name,
          sku: row.sku.toUpperCase(),
          category: cat._id,
          supplier: sup?._id || null,
          unitPrice: parseFloat(row.unitprice || row.price) || 0,
          costPrice: parseFloat(row.costprice || row.cost) || 0,
          stock: parseInt(row.stock) || 0,
          reorderLevel: parseInt(row.reorderlevel || row.reorder) || 10,
          unit: row.unit || "pcs",
          description: row.description || "",
        });
        imported++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${err.response?.data?.message || "Failed"}`);
      }
    }

    if (errors.length > 0) {
      toast.warning(`Imported ${imported} products. ${errors.length} errors.`);
      console.log("CSV Import Errors:", errors);
    } else {
      toast.success(`Successfully imported ${imported} products`);
    }

    await loadAll();
    if (fileRef.current) fileRef.current.value = "";
  };

  // Print barcode label
  const printBarcode = (product) => {
    const printWin = window.open("", "_blank", "width=400,height=300");
    printWin.document.write(`
      <!DOCTYPE html>
      <html><head><title>Barcode Label</title>
      <style>
        body { margin: 0; padding: 10mm; font-family: Arial, sans-serif; text-align: center; }
        h4 { margin: 0 0 2mm; font-size: 12pt; }
        p { margin: 0 0 3mm; font-size: 9pt; color: #666; }
        .price { margin-top: 3mm; font-size: 14pt; font-weight: bold; }
        svg { max-width: 50mm; }
      </style></head><body>
      <h4>${product.name}</h4>
      <p>SKU: ${product.sku}</p>
      <div id="bc"></div>
      <div class="price">₹${Number(product.unitPrice).toLocaleString("en-IN")}</div>
      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3/dist/JsBarcode.all.min.js"><\/script>
      <script>
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        document.getElementById("bc").appendChild(svg);
        JsBarcode(svg, "${product.sku}", { format: "CODE128", width: 2, height: 40, displayValue: true, fontSize: 10 });
        setTimeout(function(){ window.print(); window.close(); }, 300);
      <\/script></body></html>
    `);
    printWin.document.close();
  };

  return (
    <WorkspaceLayout>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="search-input compact"
          type="search"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 280 }}
        />
        <select className="subtle-btn" value={filterCat} onChange={(e) => setFilterCat(e.target.value)} style={{ minWidth: 130 }}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="subtle-btn" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ minWidth: 120 }}>
          <option value="">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <button className="subtle-btn" onClick={loadAll}>Refresh</button>
        <label className="subtle-btn" style={{ cursor: "pointer" }}>
          Import CSV
          <input type="file" accept=".csv" ref={fileRef} onChange={handleCSVImport} style={{ display: "none" }} />
        </label>
        <button className="primary-btn" onClick={openCreate}>+ Add Product</button>
      </div>

      {/* Products Table */}
      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: user?.role === "owner" ? "2fr 1fr 1fr 1fr 1fr 1fr 1fr 1.2fr" : "2fr 1fr 1fr 1fr 1fr 1fr 1.2fr" }}>
          <div>Product</div>
          <div>SKU / Barcode</div>
          <div>Category</div>
          <div>Price</div>
          {user?.role === "owner" && <div>Cost</div>}
          <div>Stock</div>
          <div>Status</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        <div className="table-body">
          {loading ? (
            [1,2,3,4,5].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or add a new product.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p._id} className="table-data-row" style={{ gridTemplateColumns: user?.role === "owner" ? "2fr 1fr 1fr 1fr 1fr 1fr 1fr 1.2fr" : "2fr 1fr 1fr 1fr 1fr 1fr 1.2fr" }}>
                <div>
                  <span className="product-name">{p.name}</span>
                  {p.supplier?.name && <span style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af" }}>{p.supplier.name}</span>}
                </div>
                <div className="barcode-cell">
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{p.sku}</span>
                </div>
                <div>{p.category?.name || "—"}</div>
                <div style={{ fontWeight: 600 }}>{fmt(p.unitPrice)}</div>
                {user?.role === "owner" && <div style={{ color: "#6b7280" }}>{fmt(p.costPrice)}</div>}
                <div>{p.stock} {p.unit}</div>
                <div>
                  <span className={`status-pill ${p.status === "In Stock" ? "status-Received" : p.status === "Low Stock" ? "status-Pending" : "status-Cancelled"}`}>
                    {p.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="text-action" onClick={() => setBarcodeModal(p)}>Barcode</button>
                  <button className="text-action" onClick={() => openEdit(p)}>Edit</button>
                  <button className="text-action text-danger" onClick={() => setConfirmDelete(p)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: "8px 0", fontSize: "0.78rem", color: "#9ca3af" }}>
        Showing {filtered.length} of {products.length} products
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal-box modal-form-large">
            <h3>{editingId ? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSave}>
              <div className="modal-form-grid">
                <div className="form-group full-width">
                  <label>Product Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amul Butter 500g" />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })} placeholder="e.g. DAI-001" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>
                    <option value="">Select supplier</option>
                    {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Selling Price (₹)</label>
                  <input type="number" required min="0" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
                </div>
                {user?.role === "owner" && (
                  <div className="form-group">
                    <label>Cost Price (₹)</label>
                    <input type="number" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Reorder Level</label>
                  <input type="number" min="0" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="L">Litres</option>
                    <option value="pack">Pack</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 20 }}>
                <button type="button" className="modal-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="modal-btn-confirm" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Barcode Modal ── */}
      {barcodeModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setBarcodeModal(null); }}>
          <div className="modal-box">
            <h3>Product Barcode</h3>
            <div className="barcode-print-wrapper">
              <div className="barcode-label-print">
                <h4>{barcodeModal.name}</h4>
                <p>SKU: {barcodeModal.sku}</p>
                <Barcode value={barcodeModal.sku} format="CODE128" width={2} height={50} displayValue={true} fontSize={12} />
                <div className="price-tag">{fmt(barcodeModal.unitPrice)}</div>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="modal-btn-cancel" onClick={() => setBarcodeModal(null)}>Close</button>
              <button className="subtle-btn" onClick={() => printBarcode(barcodeModal)}>Print Label</button>
              <button className="modal-btn-confirm" onClick={() => {
                const svg = document.querySelector(".barcode-label-print svg");
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const blob = new Blob([svgData], { type: "image/svg+xml" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${barcodeModal.sku}_barcode.svg`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Barcode downloaded");
                }
              }}>Download</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}>
          <div className="modal-box">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete &ldquo;{confirmDelete.name}&rdquo;? This will also delete all stock movement history for this product.</p>
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

export default Products;
