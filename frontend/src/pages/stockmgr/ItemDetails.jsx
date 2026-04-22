import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WorkspaceLayout from "../../components/WorkspaceLayout";
import api from "../../services/api";

function ItemDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProduct = async () => {
    setLoading(true);
    setError("");
    try {
      if (id) {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } else {
        const listRes = await api.get("/products");
        const first = listRes.data?.[0];
        if (!first) {
          setProduct(null);
        } else {
          const details = await api.get(`/products/${first._id}`);
          setProduct(details.data);
        }
      }
    } catch {
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const statusClass =
    product?.status === "In Stock"
      ? "badge-green"
      : product?.status === "Low Stock"
        ? "badge-yellow"
        : "badge-red";

  const actions = (
    <>
      <button className="subtle-btn" type="button" onClick={loadProduct}>
        Refresh
      </button>
      <button className="primary-btn" type="button">
        Live Product Details
      </button>
    </>
  );

  return (
    <WorkspaceLayout
      title={
        <>
          <Link to="/sm/stock-list" className="back-link">
            ← Back to Stock List
          </Link>
        </>
      }
      actions={actions}
    >
      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}
      {loading ? (
        <p style={{ color: "#63709c" }}>Loading product details...</p>
      ) : null}
      {!loading && !product ? (
        <p style={{ color: "#63709c" }}>No products available yet.</p>
      ) : null}

      {product ? (
        <>
          {/* Item Header */}
          <section className="item-header">
            <div className="item-header-info">
              <h2>{product.name}</h2>
              <p>
                SKU: {product.sku} &nbsp; Category:{" "}
                {product.category?.name || "-"}
              </p>
            </div>
            <span
              className={`status-badge ${statusClass}`}
              style={{ fontSize: "0.9rem", padding: "6px 16px" }}
            >
              {product.status}
            </span>
            <div className="item-header-actions">
              <Link
                to={`/sm/receive-stock?product=${product._id}`}
                className="subtle-btn"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                📥 Receive
              </Link>
              <Link
                to={`/sm/dispatch?product=${product._id}`}
                className="subtle-btn"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                📤 Dispatch
              </Link>
              <Link
                to={`/sm/adjust-stock?product=${product._id}`}
                className="subtle-btn"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                📝 Log adjustment
              </Link>
            </div>
          </section>

          {/* Detail Grid */}
          <section className="item-detail-grid">
            <article className="panel-surface item-detail-card">
              <h4>Units currently available</h4>
              <h2
                style={{
                  fontSize: "2.5rem",
                  margin: "12px 0",
                  color:
                    product.stock <= product.reorderLevel
                      ? "#d69e2e"
                      : "#38a169",
                }}
              >
                {product.stock}
              </h2>
              <p style={{ color: "#e53e3e", fontSize: "0.85rem" }}>
                Below reorder point of {product.reorderLevel} units
              </p>
              <div style={{ marginTop: 16 }}>
                <h4>Item details</h4>
                <div className="item-props">
                  <div>
                    <span>Category</span>
                    <strong>{product.category?.name || "-"}</strong>
                  </div>
                  <div>
                    <span>Supplier</span>
                    <strong>{product.supplier?.name || "-"}</strong>
                  </div>
                  <div>
                    <span>Unit</span>
                    <strong>{product.unit || "Unit"}</strong>
                  </div>
                  <div>
                    <span>Price</span>
                    <strong>₹{product.unitPrice}</strong>
                  </div>
                  <div>
                    <span>Reorder Point</span>
                    <strong>{product.reorderLevel} units</strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{product.location || "Not set"}</strong>
                  </div>
                </div>
              </div>
            </article>

            <article className="panel-surface item-detail-card">
              <h4>Storage location</h4>
              <div className="storage-map">
                <div className="storage-slot active">
                  {product.location || "Location TBD"}
                </div>
                <div className="storage-slot">
                  {product.category?.name || "Category"}
                </div>
                <div className="storage-slot">{product.unit || "Unit"}</div>
              </div>
            </article>

            <article className="panel-surface item-detail-card">
              <h4>Movement history</h4>
              <ul className="list-lines">
                {(product.movements || []).length === 0 ? (
                  <li>
                    <strong>No movement history</strong>
                    <span>Start with receive/dispatch/adjust</span>
                  </li>
                ) : null}
                {(product.movements || []).slice(0, 5).map((movement) => (
                  <li key={movement._id}>
                    <strong>
                      {movement.direction === "in" ? "+" : "-"}
                      {movement.quantity} {movement.type}
                    </strong>
                    <span>
                      {new Date(movement.createdAt).toLocaleDateString()} —{" "}
                      {movement.reference || movement.reason || "Manual"}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="panel-surface item-detail-card">
              <h4>Actions</h4>
              <div className="item-action-list">
                <Link
                  to={`/sm/receive-stock?product=${product._id}`}
                  className="action-btn-green"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    justifyContent: "center",
                  }}
                >
                  Receive more stock
                </Link>
                <Link
                  to={`/sm/adjust-stock?product=${product._id}`}
                  className="action-btn-default"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    justifyContent: "center",
                  }}
                >
                  Log Adjustment
                </Link>
                <Link
                  to="/sm/activity-log"
                  className="action-btn-red"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    justifyContent: "center",
                  }}
                >
                  View Full Activity
                </Link>
              </div>
            </article>
          </section>
        </>
      ) : null}
    </WorkspaceLayout>
  );
}

export default ItemDetails;
