import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

function ReceiveStock() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pendingPOs, setPendingPOs] = useState([]);
  const [productId, setProductId] = useState(searchParams.get("product") || "");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("Purchase received");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === productId),
    [products, productId],
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResult, poResult] = await Promise.allSettled([
        api.get("/products"),
        api.get("/purchases"),
      ]);

      if (productsResult.status === "fulfilled") {
        const allProducts = productsResult.value.data || [];
        setProducts(allProducts);

        if (!productId && allProducts.length > 0) {
          setProductId(allProducts[0]._id);
        }
      } else {
        setProducts([]);
        setError("Failed to load products. Please refresh or login again.");
      }

      if (poResult.status === "fulfilled") {
        const allPOs = poResult.value.data?.purchases || [];
        setPendingPOs(
          allPOs
            .filter((po) => ["Pending", "In Transit"].includes(po.status))
            .slice(0, 5),
        );
      } else {
        setPendingPOs([]);
      }
    } catch {
      setError("Failed to load receive stock data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceive = async () => {
    if (!productId || !quantity) {
      setError("Please select a product and quantity");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/products/${productId}/receive`, {
        quantity: Number(quantity),
        reference,
        reason,
        note,
      });
      setQuantity("");
      setReference("");
      setNote("");
      setSuccess("Stock received successfully");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to receive stock");
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadData}>
        Refresh
      </button>
      <button
        className="primary-btn"
        type="button"
        onClick={handleReceive}
        disabled={saving}
      >
        {saving ? "Saving..." : "Confirm Receipt"}
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Receive Stock" actions={actions}>
      {/* Step Progress */}
      <section className="step-progress">
        <div className="step active">
          <div className="step-num">1</div>
          <span>Select item</span>
        </div>
        <div className="step-line" />
        <div className="step active">
          <div className="step-num">2</div>
          <span>Enter Details</span>
        </div>
        <div className="step-line" />
        <div className="step active">
          <div className="step-num">3</div>
          <span>Confirm</span>
        </div>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      {success ? (
        <p style={{ color: "#1e7d4f", fontWeight: 700 }}>{success}</p>
      ) : null}

      {/* Scan + Pending */}
      <section className="receive-grid">
        <article className="panel-surface receive-scan-panel">
          <div className="scan-area">
            <div className="scan-icon">IN</div>
            <p>Select product and receive stock quantity</p>
            <select
              className="search-input"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
            {!loading && products.length === 0 ? (
              <p
                style={{ marginTop: 10, fontSize: "0.82rem", color: "#63709c" }}
              >
                No items found. Add products first from product management, then
                return to this page.
              </p>
            ) : null}
          </div>
        </article>

        <article className="panel-surface receive-pending-panel">
          <h4>Pending Shipments</h4>
          <ul className="list-lines">
            {pendingPOs.length === 0 ? (
              <li>
                <strong>No pending POs</strong>
                <span>All shipments cleared</span>
              </li>
            ) : null}
            {pendingPOs.map((po) => (
              <li key={po._id}>
                <strong>
                  {po.poNumber} — {po.supplier?.name || "Supplier"}
                </strong>
                <span>{po.items?.length || 0} items expected</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Item Details */}
      <section
        className="panel-surface"
        style={{ marginTop: 12, minHeight: 200, padding: 20 }}
      >
        <h4>Item Details</h4>
        {loading ? (
          <p style={{ color: "#63709c", marginTop: 8 }}>Loading products...</p>
        ) : null}
        {!loading && !selectedProduct ? (
          <p style={{ color: "#63709c", marginTop: 8 }}>
            Select an item to receive stock.
          </p>
        ) : null}
        {selectedProduct ? (
          <>
            <p style={{ color: "#63709c", marginTop: 8 }}>
              Current stock: {selectedProduct.stock} | Reorder level:{" "}
              {selectedProduct.reorderLevel}
            </p>
            <div className="receive-form-grid" style={{ marginTop: 16 }}>
              <label className="settings-field">
                Product Name
                <input type="text" value={selectedProduct.name} readOnly />
              </label>
              <label className="settings-field">
                Quantity Received
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>
              <label className="settings-field">
                Reason
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <label className="settings-field">
                Reference (PO)
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="PO-2041"
                />
              </label>
            </div>
            <label className="settings-field" style={{ marginTop: 10 }}>
              Note
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
              />
            </label>
            <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
              <button
                className="primary-btn"
                type="button"
                onClick={handleReceive}
                disabled={saving}
              >
                {saving ? "Saving..." : "Confirm Receipt"}
              </button>
              <button
                className="subtle-btn"
                type="button"
                onClick={() => {
                  setQuantity("");
                  setReference("");
                  setNote("");
                }}
              >
                Clear
              </button>
            </div>
          </>
        ) : null}
      </section>
    </WorkspaceLayout>
  );
}

export default ReceiveStock;
