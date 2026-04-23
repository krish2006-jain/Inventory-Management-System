import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import { useToast } from "../../components/ToastProvider";
import api from "../../services/api";

const adjustmentTypes = [
  { value: "increase", label: "Increase", direction: "in" },
  { value: "decrease", label: "Decrease", direction: "out" },
  { value: "damage", label: "Damage", direction: "out" },
  { value: "lost", label: "Lost", direction: "out" },
  { value: "return", label: "Return", direction: "in" },
  { value: "audit", label: "Audit Correction", direction: "in" },
];

function AdjustStock() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [adjustType, setAdjustType] = useState("increase");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // Pre-fill from navigation state
  useEffect(() => {
    const p = location.state?.product;
    if (p) {
      setSelectedProduct(p);
      setProductSearch(p.name);
    }
  }, [location.state]);

  const filteredProducts = productSearch.trim() && !selectedProduct
    ? products.filter((p) =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  const currentType = adjustmentTypes.find((t) => t.value === adjustType) || adjustmentTypes[0];
  const qty = parseInt(quantity) || 0;
  const newStock = selectedProduct
    ? currentType.direction === "in"
      ? selectedProduct.stock + qty
      : Math.max(0, selectedProduct.stock - qty)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || qty <= 0) {
      toast.error("Select a product and enter a valid quantity");
      return;
    }

    if (currentType.direction === "out" && qty > selectedProduct.stock) {
      toast.error(`Cannot remove ${qty} units. Only ${selectedProduct.stock} in stock.`);
      return;
    }

    setSaving(true);
    try {
      await api.post(`/products/${selectedProduct._id}/stock`, {
        type: "adjustment",
        direction: currentType.direction,
        quantity: qty,
        reason: reason || currentType.label,
        note: note || "",
        reference: `ADJ-${Date.now().toString().slice(-8)}`,
      });
      toast.success(`Stock adjusted: ${currentType.direction === "in" ? "+" : "-"}${qty} units of ${selectedProduct.name}`);
      setSelectedProduct(null);
      setProductSearch("");
      setQuantity("");
      setReason("");
      setNote("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  // Scanner
  useEffect(() => {
    if (!showScanner) return;
    let scanner = null;
    const init = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode("adj-qr-reader");
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            scanner.stop().catch(() => {});
            setShowScanner(false);
            const found = products.find((p) => p.sku === decodedText.toUpperCase());
            if (found) { setSelectedProduct(found); setProductSearch(found.name); toast.success(`Found: ${found.name}`); }
            else toast.error(`Product not found: ${decodedText}`);
          },
          () => {}
        );
      } catch {
        toast.error("Camera not available");
        setShowScanner(false);
      }
    };
    init();
    return () => { scanner?.stop().catch(() => {}); };
  }, [showScanner, products, toast]);

  return (
    <WorkspaceLayout>
      <div style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="panel-surface">
          <h4 className="panel-title">Adjust Stock</h4>

          {/* Product search */}
          <div className="form-group" style={{ marginBottom: 14, position: "relative" }}>
            <label>Product</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                  placeholder="Search product name or SKU..."
                  autoComplete="off"
                />
                {filteredProducts.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                    background: "#fff", border: "1px solid #d1d5db", borderRadius: 6,
                    maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                    {filteredProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => { setSelectedProduct(p); setProductSearch(p.name); }}
                        style={{ padding: "8px 12px", cursor: "pointer", fontSize: "0.85rem", borderBottom: "1px solid #f1f5f9" }}
                        onMouseEnter={(e) => e.target.style.background = "#f1f5f9"}
                        onMouseLeave={(e) => e.target.style.background = "#fff"}
                      >
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span style={{ color: "#94a3b8", marginLeft: 8 }}>{p.sku}</span>
                        <span style={{ float: "right", color: "#6b7280" }}>Stock: {p.stock}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="button" className="primary-btn" style={{ whiteSpace: "nowrap" }} onClick={() => setShowScanner(true)}>
                Scan
              </button>
            </div>
          </div>

          {/* Selected product + preview */}
          {selectedProduct && (
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700 }}>{selectedProduct.name}</span>
                <span style={{ fontFamily: "monospace", color: "#6b7280" }}>{selectedProduct.sku}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{ textAlign: "center", padding: 8, background: "#fff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>Current</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{selectedProduct.stock}</div>
                </div>
                <div style={{ textAlign: "center", padding: 8, background: currentType.direction === "in" ? "#dbeafe" : "#fee2e2", borderRadius: 6 }}>
                  <div style={{ fontSize: "0.7rem", color: currentType.direction === "in" ? "#2563eb" : "#dc2626" }}>
                    {currentType.label}
                  </div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: currentType.direction === "in" ? "#2563eb" : "#dc2626" }}>
                    {currentType.direction === "in" ? "+" : "-"}{qty}
                  </div>
                </div>
                <div style={{ textAlign: "center", padding: 8, background: "#dcfce7", borderRadius: 6, border: "1px solid #86efac" }}>
                  <div style={{ fontSize: "0.7rem", color: "#059669" }}>New Stock</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#059669" }}>{newStock}</div>
                </div>
              </div>
            </div>
          )}

          {/* Adjustment type */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Adjustment Type</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {adjustmentTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={adjustType === t.value ? "primary-btn" : "subtle-btn"}
                  style={{ fontSize: "0.78rem", minHeight: 36 }}
                  onClick={() => setAdjustType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="modal-form-grid">
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" required value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Enter quantity" />
            </div>
            <div className="form-group">
              <label>Reason</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder={`e.g. ${currentType.label}`} />
            </div>
            <div className="form-group full-width">
              <label>Note</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Additional details..." />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button type="submit" className="primary-btn" disabled={saving || !selectedProduct}>
              {saving ? "Adjusting..." : "Confirm Adjustment"}
            </button>
            <button type="button" className="subtle-btn" onClick={() => navigate("/sm/stock-list")}>Back to Inventory</button>
          </div>
        </form>
      </div>

      {/* Scanner */}
      {showScanner && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowScanner(false); }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <h3>Scan Barcode</h3>
            <div id="adj-qr-reader" style={{ width: "100%" }}></div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button className="modal-btn-cancel" onClick={() => setShowScanner(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default AdjustStock;
