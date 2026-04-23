import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import { useToast } from "../../components/ToastProvider";
import api from "../../services/api";

function ReceiveStock() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, supRes] = await Promise.all([
        api.get("/products"),
        api.get("/suppliers"),
      ]);
      setProducts(prodRes.data || []);
      setSuppliers(supRes.data || []);
    } catch {
      toast.error("Failed to load products/suppliers");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Pre-fill from navigation state
  useEffect(() => {
    const p = location.state?.product;
    if (p) {
      setSelectedProduct(p);
      setProductSearch(p.name);
      setSupplierId(p.supplier?._id || p.supplier || "");
    }
  }, [location.state]);

  // Backward compatibility: support ?product=<id> links as a prefill source.
  useEffect(() => {
    if (selectedProduct) return;
    const productId = searchParams.get("product");
    if (!productId || products.length === 0) return;

    const found = products.find((p) => String(p._id) === String(productId));
    if (!found) return;

    setSelectedProduct(found);
    setProductSearch(found.name);
    setSupplierId(found.supplier?._id || found.supplier || "");
  }, [searchParams, products, selectedProduct]);

  const filteredProducts = productSearch.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(productSearch.toLowerCase()),
        )
        .slice(0, 8)
    : [];

  const selectedSupplier =
    suppliers.find((s) => String(s._id) === String(supplierId)) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
      toast.error("Select a product and enter a valid quantity");
      return;
    }

    if (!supplierId) {
      toast.error("Select a supplier to place the order");
      return;
    }

    if (suppliers.length === 0) {
      toast.error("No suppliers found. Ask the owner to add suppliers first.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/purchases", {
        supplier: supplierId,
        status: "Pending",
        items: [
          {
            product: selectedProduct._id,
            quantity: parseInt(quantity),
            unitCost: 0,
          },
        ],
        notes: note || "",
      });
      toast.success(
        `Order placed for ${quantity} units of ${selectedProduct.name}${selectedSupplier?.name ? ` to ${selectedSupplier.name}` : ""}`,
      );
      setSelectedProduct(null);
      setProductSearch("");
      setQuantity("");
      setSupplierId("");
      setNote("");
      load();
      navigate("/sm/purchases");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
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
      scanner = new Html5Qrcode("rcv-qr-reader");
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            scanner.stop().catch(() => {});
            setShowScanner(false);
            const found = products.find(
              (p) => p.sku === decodedText.toUpperCase(),
            );
            if (found) {
              setSelectedProduct(found);
              setProductSearch(found.name);
              setSupplierId(found.supplier?._id || found.supplier || "");
              toast.success(`Product found: ${found.name}`);
            } else {
              toast.error(`Product not found: ${decodedText}`);
            }
          },
          () => {},
        );
      } catch {
        toast.error("Camera not available");
        setShowScanner(false);
      }
    };
    init();
    return () => {
      scanner?.stop().catch(() => {});
    };
  }, [showScanner, products, toast]);

  return (
    <WorkspaceLayout>
      <div style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit} className="panel-surface">
          <h4 className="panel-title">Order Stock</h4>

          {/* Product search */}
          <div
            className="form-group"
            style={{ marginBottom: 14, position: "relative" }}
          >
            <label>Product</label>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, position: "relative" }}>
                <input
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setSelectedProduct(null);
                  }}
                  placeholder="Search product name or SKU..."
                  autoComplete="off"
                />
                {/* Dropdown */}
                {filteredProducts.length > 0 && !selectedProduct && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      background: "#fff",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      maxHeight: 200,
                      overflowY: "auto",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  >
                    {filteredProducts.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setProductSearch(p.name);
                          setSupplierId(p.supplier?._id || p.supplier || "");
                        }}
                        style={{
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.background = "#f1f5f9")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.background = "#fff")
                        }
                      >
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                        <span style={{ color: "#94a3b8", marginLeft: 8 }}>
                          {p.sku}
                        </span>
                        <span style={{ float: "right", color: "#6b7280" }}>
                          Stock: {p.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="primary-btn"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => setShowScanner(true)}
              >
                Scan
              </button>
            </div>
          </div>

          {/* Selected product preview */}
          {selectedProduct && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontWeight: 700 }}>{selectedProduct.name}</span>
                <span style={{ fontFamily: "monospace", color: "#6b7280" }}>
                  {selectedProduct.sku}
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    padding: 8,
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    Current Stock
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color:
                        selectedProduct.stock === 0 ? "#dc2626" : "#0f172a",
                    }}
                  >
                    {selectedProduct.stock}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: 8,
                    background: "#dbeafe",
                    borderRadius: 6,
                    border: "1px solid #93c5fd",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "#2563eb" }}>
                    Ordering
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#2563eb",
                    }}
                  >
                    {parseInt(quantity) || 0}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "center",
                    padding: 8,
                    background: "#fff",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    Reorder Level
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {selectedProduct.reorderLevel}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="modal-form-grid">
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            <div className="form-group">
              <label>Supplier</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <label>Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional order note..."
              />
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              type="submit"
              className="primary-btn"
              disabled={saving || !selectedProduct}
            >
              {saving ? "Placing order..." : "Place Order"}
            </button>
            <button
              type="button"
              className="subtle-btn"
              onClick={() => navigate("/sm/stock-list")}
            >
              Back to Inventory
            </button>
          </div>
        </form>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowScanner(false);
          }}
        >
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <h3>Scan Barcode</h3>
            <div id="rcv-qr-reader" style={{ width: "100%" }}></div>
            <div className="modal-actions" style={{ marginTop: 12 }}>
              <button
                className="modal-btn-cancel"
                onClick={() => setShowScanner(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

export default ReceiveStock;
