import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

function Dispatch() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(searchParams.get("product") || "");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("Sales dispatch");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === productId),
    [products, productId],
  );

  const dispatchableProducts = useMemo(
    () => products.filter((product) => (product.stock || 0) > 0),
    [products],
  );

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products");
      const allProducts = res.data || [];
      setProducts(allProducts);

      if (allProducts.length === 0) {
        setProductId("");
      } else {
        const selectedExists = allProducts.some(
          (product) => product._id === productId,
        );
        if (!selectedExists) {
          setProductId(allProducts[0]._id);
        }
      }
    } catch {
      setError("Failed to load products for dispatch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDispatch = async () => {
    if (!productId || !quantity) {
      setError("Please select a product and quantity");
      return;
    }

    if (!selectedProduct) {
      setError("Selected product was not found. Please reselect.");
      return;
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if ((selectedProduct.stock || 0) <= 0) {
      setError("This product is out of stock and cannot be dispatched");
      return;
    }

    if (qty > (selectedProduct.stock || 0)) {
      setError("Dispatch quantity cannot exceed available stock");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post(`/products/${productId}/dispatch`, {
        quantity: qty,
        reference,
        reason,
        note,
      });
      setQuantity("");
      setReference("");
      setNote("");
      setSuccess("Stock dispatched successfully");
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch stock");
    } finally {
      setSaving(false);
    }
  };

  const progress =
    selectedProduct && quantity
      ? Math.min(
          100,
          Math.round(
            (Number(quantity) / Math.max(1, selectedProduct.stock)) * 100,
          ),
        )
      : 0;

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadProducts}>
        Refresh
      </button>
      <button
        className="primary-btn"
        type="button"
        onClick={handleDispatch}
        disabled={
          saving || !selectedProduct || (selectedProduct.stock || 0) <= 0
        }
      >
        {saving ? "Saving..." : "Dispatch Now"}
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Dispatch" actions={actions}>
      {/* Order Header */}
      <section className="panel-surface" style={{ marginTop: 14, padding: 20 }}>
        <h3 style={{ margin: 0 }}>Create Dispatch</h3>
      </section>

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      {success ? (
        <p style={{ color: "#1e7d4f", fontWeight: 700 }}>{success}</p>
      ) : null}

      {/* Main Grid */}
      <section className="dispatch-grid">
        <article className="panel-surface dispatch-pick-panel">
          <h4>Dispatch Progress</h4>
          <div className="pick-progress-bar">
            <div className="pick-filled" style={{ width: `${progress}%` }} />
          </div>
          <p style={{ fontSize: "0.82rem", color: "#63709c", marginTop: 6 }}>
            {selectedProduct
              ? `${quantity || 0} of ${selectedProduct.stock} units selected`
              : "Select a product"}
          </p>

          <h4 style={{ marginTop: 20 }}>Dispatch Details</h4>
          <div className="pick-list">
            <label className="settings-field">
              Product
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} ({product.stock} in stock)
                  </option>
                ))}
              </select>
              {!loading && products.length === 0 ? (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: "0.82rem",
                    color: "#63709c",
                  }}
                >
                  No items found. Add products first from product management,
                  then return to this page.
                </p>
              ) : null}
            </label>
            <label className="settings-field">
              Quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </label>
            <label className="settings-field">
              Reference
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="SO-8831"
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
              Note
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
              />
            </label>
          </div>

          <div
            className="dispatch-actions"
            style={{ marginTop: 20, display: "flex", gap: 10 }}
          >
            <button
              className="action-btn-green"
              type="button"
              onClick={handleDispatch}
              disabled={
                saving || !selectedProduct || (selectedProduct.stock || 0) <= 0
              }
            >
              Confirm Dispatch
            </button>
            <button
              className="action-btn-red"
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
        </article>

        <div className="dispatch-side">
          <article className="panel-surface" style={{ padding: 16 }}>
            <h4>Selected Product Info</h4>
            <div className="item-props" style={{ marginTop: 10 }}>
              <div>
                <span>Name</span>
                <strong>{selectedProduct?.name || "-"}</strong>
              </div>
              <div>
                <span>SKU</span>
                <strong>{selectedProduct?.sku || "-"}</strong>
              </div>
              <div>
                <span>Current Stock</span>
                <strong>{selectedProduct?.stock ?? "-"}</strong>
              </div>
              <div>
                <span>Reorder Level</span>
                <strong>{selectedProduct?.reorderLevel ?? "-"}</strong>
              </div>
              <div>
                <span>Category</span>
                <strong>{selectedProduct?.category?.name || "-"}</strong>
              </div>
              <div>
                <span>Unit Price</span>
                <strong>
                  {selectedProduct ? `₹${selectedProduct.unitPrice}` : "-"}
                </strong>
              </div>
            </div>
          </article>

          <article
            className="panel-surface"
            style={{ padding: 16, marginTop: 12 }}
          >
            <h4>Other Pending</h4>
            <ul className="list-lines">
              {dispatchableProducts.length === 0 ? (
                <li>
                  <strong>No dispatchable items</strong>
                  <span>All products are out of stock</span>
                </li>
              ) : null}
              {dispatchableProducts.slice(0, 3).map((product) => (
                <li key={product._id}>
                  <strong>{product.name}</strong>
                  <span>{product.stock} units available</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Dispatch;
