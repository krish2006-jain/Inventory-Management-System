import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Barcode from "react-barcode";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import { useToast } from "../../components/ToastProvider";
import api from "../../services/api";

function StockList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [barcodeModal, setBarcodeModal] = useState(null);
  const [showScanner, setShowScanner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

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

  // Scanner
  useEffect(() => {
    if (!showScanner) return;
    let scanner = null;
    const init = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode("sm-qr-reader");
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            scanner.stop().catch(() => {});
            setShowScanner(false);
            try {
              const res = await api.get(`/products/barcode/${decodedText}`);
              if (res.data) {
                navigate("/sm/adjust-stock", { state: { product: res.data } });
              }
            } catch {
              toast.error(`Product not found: ${decodedText}`);
            }
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
  }, [showScanner, navigate, toast]);

  return (
    <WorkspaceLayout>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="search-input compact"
          type="search"
          placeholder="Search product name or SKU..."
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
        <button className="subtle-btn" onClick={load}>Refresh</button>
        <button className="primary-btn" onClick={() => setShowScanner(true)}>Scan Product</button>
      </div>

      {/* Stock Table */}
      <div className="table-shell">
        <div className="table-head-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1.5fr" }}>
          <div>Product</div>
          <div>SKU</div>
          <div>Category</div>
          <div>Stock</div>
          <div>Reorder Level</div>
          <div>Status</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>
        <div className="table-body">
          {loading ? (
            [1,2,3,4,5].map((i) => <div key={i} className="skeleton-row"></div>)
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters.</p>
            </div>
          ) : (
            filtered.map((p) => (
              <div key={p._id} className="table-data-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1.5fr" }}>
                <div>
                  <span className="product-name">{p.name}</span>
                  {p.supplier?.name && <span style={{ display: "block", fontSize: "0.7rem", color: "#9ca3af" }}>{p.supplier.name}</span>}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.8rem", cursor: "pointer" }} onClick={() => setBarcodeModal(p)}>{p.sku}</div>
                <div>{p.category?.name || "—"}</div>
                <div style={{ fontWeight: 700, color: p.stock === 0 ? "#dc2626" : p.stock <= p.reorderLevel ? "#d97706" : "#059669" }}>
                  {p.stock} {p.unit}
                </div>
                <div>{p.reorderLevel}</div>
                <div>
                  <span className={`status-pill ${p.stock === 0 ? "status-Cancelled" : p.stock <= p.reorderLevel ? "status-Pending" : "status-Received"}`}>
                    {p.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", flexWrap: "wrap" }}>
                  <button className="text-action" onClick={() => navigate("/sm/receive-stock", { state: { product: p } })}>
                    Receive
                  </button>
                  <button className="text-action" onClick={() => navigate("/sm/adjust-stock", { state: { product: p } })}>
                    Adjust
                  </button>
                  <button className="text-action" onClick={() => setBarcodeModal(p)}>Barcode</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ padding: "8px 0", fontSize: "0.78rem", color: "#9ca3af" }}>
        Showing {filtered.length} of {products.length} products
      </div>

      {/* Barcode Modal */}
      {barcodeModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setBarcodeModal(null); }}>
          <div className="modal-box">
            <h3>Product Barcode</h3>
            <div className="barcode-print-wrapper">
              <div className="barcode-label-print" style={{ textAlign: "center" }}>
                <h4>{barcodeModal.name}</h4>
                <p style={{ margin: "4px 0" }}>SKU: {barcodeModal.sku}</p>
                <Barcode value={barcodeModal.sku} format="CODE128" width={2} height={50} displayValue={true} fontSize={12} />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="modal-btn-cancel" onClick={() => setBarcodeModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {showScanner && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowScanner(false); }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <h3>Scan Product Barcode</h3>
            <div id="sm-qr-reader" style={{ width: "100%" }}></div>
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Or enter SKU manually:</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  id="sm-manual-sku"
                  type="text"
                  placeholder="e.g. DAI-001"
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && e.target.value) {
                      try {
                        const res = await api.get(`/products/barcode/${e.target.value}`);
                        if (res.data) navigate("/sm/adjust-stock", { state: { product: res.data } });
                      } catch {
                        toast.error(`Product not found: ${e.target.value}`);
                      }
                      setShowScanner(false);
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="modal-btn-cancel" onClick={() => setShowScanner(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default StockList;
