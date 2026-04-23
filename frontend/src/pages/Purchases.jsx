import { useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import api from "../services/api";

const moneyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function Purchases() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalSpending: 0,
    activePOs: 0,
    receivedCount: 0,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    poNumber: `PO-${Date.now().toString().slice(-6)}`,
    supplierId: "",
    productId: "",
    quantity: "",
    unitCost: "",
    status: "Pending",
    expectedDate: "",
  });

  const loadMeta = async () => {
    try {
      const [supplierRes, productRes] = await Promise.all([
        api.get("/suppliers"),
        api.get("/products"),
      ]);
      setSuppliers(supplierRes.data || []);
      setProducts(productRes.data || []);
    } catch {
      setError("Failed to load suppliers/products for purchase creation");
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/purchases", { params });
      setOrders(res.data?.purchases || []);
      setSummary(
        res.data?.summary || {
          totalSpending: 0,
          activePOs: 0,
          receivedCount: 0,
        },
      );
    } catch {
      setError("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    if (!search.trim()) return orders;
    const key = search.toLowerCase();
    return orders.filter((order) =>
      [order.poNumber, order.supplier?.name, order.status]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(key)),
    );
  }, [orders, search]);

  const handleCreatePO = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/purchases", {
        poNumber: form.poNumber,
        supplierId: form.supplierId,
        items: [
          {
            productId: form.productId,
            quantity: Number(form.quantity),
            unitCost: Number(form.unitCost),
          },
        ],
        status: form.status,
        expectedDate: form.expectedDate || null,
      });
      setForm({
        poNumber: `PO-${Date.now().toString().slice(-6)}`,
        supplierId: "",
        productId: "",
        quantity: "",
        unitCost: "",
        status: "Pending",
        expectedDate: "",
      });
      setShowForm(false);
      await loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create purchase order",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/purchases/${orderId}/status`, { status });
      await loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update purchase status",
      );
    }
  };

  const actions = (
    <>
      <input
        className="search-input compact"
        type="search"
        placeholder="Search PO"
        aria-label="Search purchase orders"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="subtle-btn" type="button" onClick={loadOrders}>
        Refresh
      </button>
      <button
        className="primary-btn"
        type="button"
        onClick={() => setShowForm((prev) => !prev)}
      >
        {showForm ? "Close" : "Create PO"}
      </button>
    </>
  );

  return (
    <WorkspaceLayout title="Purchases" actions={actions}>
      {showForm ? (
        <section className="panel-surface" style={{ marginTop: 14 }}>
          <h4 style={{ marginTop: 0 }}>Create Purchase Order</h4>
          <form
            onSubmit={handleCreatePO}
            className="settings-form-grid"
            style={{ marginTop: 12 }}
          >
            <label className="settings-field">
              PO Number
              <input
                required
                value={form.poNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, poNumber: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Supplier
              <select
                required
                value={form.supplierId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, supplierId: e.target.value }))
                }
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Product
              <select
                required
                value={form.productId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, productId: e.target.value }))
                }
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="settings-field">
              Quantity
              <input
                type="number"
                min="1"
                required
                value={form.quantity}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Unit Cost
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={form.unitCost}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, unitCost: e.target.value }))
                }
              />
            </label>
            <label className="settings-field">
              Status
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Transit">In Transit</option>
                <option value="Received">Received</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>
            <label className="settings-field">
              Expected Date
              <input
                type="date"
                value={form.expectedDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expectedDate: e.target.value }))
                }
              />
            </label>
            <div style={{ display: "flex", alignItems: "end" }}>
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save PO"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {error ? (
        <p style={{ color: "#b43f47", fontWeight: 700 }}>{error}</p>
      ) : null}

      <section className="purchase-card-grid">
        <article className="panel-surface purchase-card">
          <span className="purchase-icon">TS</span>
          <h3>{moneyFormatter.format(summary.totalSpending || 0)}</h3>
          <p>Total Spending</p>
        </article>
        <article className="panel-surface purchase-card">
          <span className="purchase-icon">PO</span>
          <h3>{summary.activePOs || 0}</h3>
          <p>Active POs</p>
        </article>
        <article className="panel-surface purchase-card">
          <span className="purchase-icon">RC</span>
          <h3>{summary.receivedCount || 0}</h3>
          <p>Received POs</p>
        </article>
        <article
          className="panel-surface purchase-card purchase-card-cta"
          onClick={() => setShowForm(true)}
        >
          <span className="purchase-icon">NP</span>
          <h3>Create</h3>
          <p>New PO</p>
        </article>
      </section>

      <section className="purchase-filter-row panel-surface">
        <select
          className="search-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status: All</option>
          <option value="Pending">Pending</option>
          <option value="In Transit">In Transit</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <span className="text-chip" aria-label="Date range filter">
          Last 30 Days
        </span>
        <span className="text-chip" aria-label="Sort method">
          Sort by Date
        </span>
      </section>

      <section className="table-shell">
        <header
          className="table-head-row"
          style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 1fr 0.7fr" }}
        >
          <span>PO #</span>
          <span>Supplier</span>
          <span>Items</span>
          <span>Total</span>
          <span>Status</span>
          <span>Date</span>
        </header>
        <div className="table-body">
          {loading ? (
            <div
              className="table-data-row"
              style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 1fr 0.7fr" }}
            >
              <span>Loading purchase orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div
              className="table-data-row"
              style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 1fr 0.7fr" }}
            >
              <span>No purchase orders found</span>
            </div>
          ) : (
            filteredOrders.map((po) => (
              <div
                key={po._id}
                className="table-data-row"
                style={{ gridTemplateColumns: "1fr 1.5fr 0.7fr 1fr 1fr 0.7fr" }}
              >
                <span style={{ fontWeight: 700 }}>{po.poNumber}</span>
                <span>{po.supplier?.name || "-"}</span>
                <span>
                  {po.items?.reduce(
                    (sum, item) => sum + (item.quantity || 0),
                    0,
                  ) || 0}
                </span>
                <span>{moneyFormatter.format(po.totalAmount || 0)}</span>
                <span>
                  <select
                    className={`status-badge ${po.status === "Received" ? "badge-green" : po.status === "In Transit" ? "badge-blue" : po.status === "Pending" ? "badge-yellow" : "badge-red"}`}
                    value={po.status}
                    onChange={(e) => updateStatus(po._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Received">Received</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </span>
                <span>{new Date(po.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </WorkspaceLayout>
  );
}

export default Purchases;
