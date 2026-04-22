import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

const reasons = [
  { id: "damaged", label: "Damaged", icon: "🔧" },
  { id: "lost", label: "Lost/Missing", icon: "❓" },
  { id: "return", label: "Customer return", icon: "🔄" },
  { id: "count", label: "Count Correction", icon: "📋" },
];

function AdjustStock() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(searchParams.get("product") || "");
  const [direction, setDirection] = useState("out");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === productId),
    [products, productId],
  );

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products");
      const allProducts = res.data || [];
      setProducts(allProducts);

      if (!productId && allProducts.length > 0) {
        setProductId(allProducts[0]._id);
      }
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdjust = async () => {
    if (!productId || !quantity || !reason) {
      setError("Please choose product, quantity and reason");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/products/${productId}/adjust`, {
        direction,
        quantity: Number(quantity),
        reason,
        note,
        reference,
      });
      setQuantity("");
      setNote("");
      setReference("");
      setSuccess("Stock adjustment saved");
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to adjust stock");
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadProducts}>
        Refresh
      </button>
      <button
        className="primary-btn"
        type="button"
        onClick={handleAdjust}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Adjustment"}
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Log Stock Adjustment" actions={actions}>
      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      {success ? (
        <p style={{ color: "#1e7d4f", fontWeight: 700 }}>{success}</p>
      ) : null}
      {/* Select Item */}
      <section className="panel-surface" style={{ marginTop: 14, padding: 20 }}>
        <h4>Select Item</h4>
        <div className="settings-form-grid" style={{ marginTop: 12 }}>
          <label className="settings-field">
            Product
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </label>
          <label className="settings-field">
            Current Stock
            <input
              type="text"
              value={
                loading ? "Loading..." : `${selectedProduct?.stock ?? 0} units`
              }
              readOnly
            />
          </label>
        </div>
      </section>

      {/* Adjustment Details */}
      <section className="panel-surface" style={{ marginTop: 12, padding: 20 }}>
        <h4>Adjustment Details</h4>
        <div className="settings-form-grid" style={{ marginTop: 12 }}>
          <label className="settings-field">
            Adjustment Type
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="out">Decrease</option>
              <option value="in">Increase</option>
            </select>
          </label>
          <label className="settings-field">
            Quantity
            <input
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label className="settings-field">
            Reference
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="AUDIT-1001"
            />
          </label>
        </div>
      </section>

      {/* Reason Code */}
      <section className="panel-surface" style={{ marginTop: 12, padding: 20 }}>
        <h4>
          Reason Code{" "}
          <span style={{ color: "#e53e3e", fontSize: "0.8rem" }}>required</span>
        </h4>
        <div className="reason-grid">
          {reasons.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`reason-card ${reason === r.id ? "active" : ""}`}
              onClick={() => setReason(r.id)}
            >
              <span className="reason-icon">{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Note & Evidence */}
      <section className="panel-surface" style={{ marginTop: 12, padding: 20 }}>
        <h4>Note & Evidence</h4>
        <textarea
          className="note-textarea"
          placeholder="Add notes about this adjustment..."
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div style={{ marginTop: 10 }}>
          <button className="subtle-btn" type="button">
            📎 Attach Photo
          </button>
        </div>
      </section>

      {/* Actions */}
      <section style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button
          className="action-btn-green"
          type="button"
          style={{ flex: 1 }}
          onClick={handleAdjust}
          disabled={saving}
        >
          Save adjustment — will be flagged to owner
        </button>
        <button
          className="subtle-btn"
          type="button"
          style={{ minWidth: 100 }}
          onClick={() => {
            setQuantity("");
            setNote("");
            setReference("");
            setReason("");
          }}
        >
          Cancel
        </button>
      </section>
    </WorkspaceLayout>
  );
}

export default AdjustStock;
