import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Barcode from "react-barcode";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";
import logo from "../assets/logo.jpeg";

function CashierPOS() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [heldOrders, setHeldOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountTendered, setAmountTendered] = useState("");
  const [discount, setDiscount] = useState({ type: "none", value: 0 });
  const [showReceipt, setShowReceipt] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const searchRef = useRef(null);

  // Load products and categories
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // Focus search on mount
  useEffect(() => { searchRef.current?.focus(); }, []);

  // Filtered products
  const filtered = useMemo(() => {
    let list = products.filter((p) => p.stock > 0);
    if (search.trim()) {
      const key = search.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(key) || p.sku?.toLowerCase().includes(key));
    }
    if (filterCat) list = list.filter((p) => (p.category?._id || p.category) === filterCat);
    return list;
  }, [products, search, filterCat]);

  // Cart operations
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.warning(`Only ${product.stock} units available`);
          return prev;
        }
        return prev.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, [toast]);

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id !== id) return item;
          const newQty = item.quantity + delta;
          if (newQty > item.stock) {
            toast.warning(`Only ${item.stock} units available`);
            return item;
          }
          return { ...item, quantity: Math.max(1, newQty) };
        })
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item._id !== id));
  const clearCart = () => { setCart([]); setDiscount({ type: "none", value: 0 }); setAmountTendered(""); };

  // Hold & recall
  const holdOrder = () => {
    if (cart.length === 0) return;
    setHeldOrders((prev) => [...prev, { id: Date.now(), items: cart, time: new Date() }]);
    setCart([]);
    toast.info("Order held");
  };

  const recallOrder = (id) => {
    const order = heldOrders.find((o) => o.id === id);
    if (order) {
      setCart(order.items);
      setHeldOrders((prev) => prev.filter((o) => o.id !== id));
      toast.info("Order recalled");
    }
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountAmount = discount.type === "percent" ? subtotal * (discount.value / 100)
    : discount.type === "fixed" ? discount.value : 0;
  const taxRate = 18;
  const taxAmount = Math.round((subtotal - discountAmount) * (taxRate / 100));
  const total = subtotal - discountAmount + taxAmount;
  const changeDue = paymentMethod === "cash" ? Math.max(0, parseFloat(amountTendered || 0) - total) : 0;

  const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  // Barcode scan handler
  const handleBarcodeScan = useCallback(async (sku) => {
    try {
      const res = await api.get(`/products/barcode/${sku}`);
      if (res.data) {
        addToCart(res.data);
        toast.success(`Added: ${res.data.name}`);
      }
    } catch {
      toast.error(`Product not found: ${sku}`);
    }
    setShowScanner(false);
  }, [addToCart, toast]);

  // Initialize QR scanner
  useEffect(() => {
    if (!showScanner) return;
    let scanner = null;

    const initScanner = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode("qr-reader");
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            handleBarcodeScan(decodedText);
            scanner.stop().catch(() => {});
          },
          () => {}
        );
      } catch (err) {
        toast.error("Camera access denied or not available");
        setShowScanner(false);
      }
    };

    initScanner();
    return () => { scanner?.stop().catch(() => {}); };
  }, [showScanner, handleBarcodeScan, toast]);

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "cash" && parseFloat(amountTendered || 0) < total) {
      toast.error("Amount tendered is less than total");
      return;
    }

    setProcessing(true);
    try {
      const saleData = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.unitPrice * item.quantity,
        })),
        subtotal,
        discountType: discount.type,
        discountValue: discount.value,
        discountAmount,
        taxRate,
        taxLabel: "GST",
        taxAmount,
        total,
        paymentMethod,
        amountTendered: paymentMethod === "cash" ? parseFloat(amountTendered) : 0,
        changeDue,
        cashier: user?.id,
        cashierName: user?.username,
      };

      const res = await api.post("/sales", saleData);
      setShowReceipt({ ...res.data, ...saleData });
      setCart([]);
      setDiscount({ type: "none", value: 0 });
      setAmountTendered("");
      toast.success("Sale completed");

      // Refresh products to update stock
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete sale");
    } finally {
      setProcessing(false);
    }
  };

  // Print receipt
  const printReceipt = () => {
    if (!showReceipt) return;
    const receiptWin = window.open("", "_blank", "width=320,height=600");
    const items = showReceipt.items || [];
    receiptWin.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
      body{margin:0;padding:8mm;font-family:monospace;font-size:11px;width:72mm;}
      h2{text-align:center;margin:0 0 4px;font-size:14px;}
      p{margin:2px 0;}
      .center{text-align:center;}
      .line{border-top:1px dashed #000;margin:6px 0;}
      table{width:100%;border-collapse:collapse;}
      td{padding:2px 0;}
      .right{text-align:right;}
      .bold{font-weight:bold;}
    </style></head><body>
      <h2>STOCKLY</h2>
      <p class="center">Rajesh General Store</p>
      <p class="center">Shop No. 12, MG Road, Indore</p>
      <div class="line"></div>
      <p>Receipt: ${showReceipt.saleId || ""}</p>
      <p>Date: ${new Date(showReceipt.createdAt || Date.now()).toLocaleString("en-IN")}</p>
      <p>Cashier: ${showReceipt.cashierName || user?.username}</p>
      <div class="line"></div>
      <table>
        <tr class="bold"><td>Item</td><td class="right">Qty</td><td class="right">Amt</td></tr>
        ${items.map((i) => `<tr><td>${i.name}</td><td class="right">${i.quantity}</td><td class="right">₹${i.lineTotal}</td></tr>`).join("")}
      </table>
      <div class="line"></div>
      <table>
        <tr><td>Subtotal</td><td class="right">₹${subtotal}</td></tr>
        ${discountAmount > 0 ? `<tr><td>Discount</td><td class="right">-₹${discountAmount}</td></tr>` : ""}
        <tr><td>GST (18%)</td><td class="right">₹${taxAmount}</td></tr>
        <tr class="bold"><td>TOTAL</td><td class="right">₹${total}</td></tr>
        <tr><td>Paid (${paymentMethod.toUpperCase()})</td><td class="right">₹${showReceipt.amountTendered || total}</td></tr>
        ${changeDue > 0 ? `<tr><td>Change</td><td class="right">₹${changeDue}</td></tr>` : ""}
      </table>
      <div class="line"></div>
      <p class="center">Thank you for shopping!</p>
      <p class="center" style="font-size:9px;color:#666;">GST No: XXAAX0000A1Z5</p>
      <script>setTimeout(()=>{window.print();window.close();},300)<\/script>
    </body></html>`);
    receiptWin.document.close();
  };

  return (
    <div className="pos-layout">
      {/* LEFT — Cart */}
      <div className="pos-cart">
        <div className="pos-cart-header">
          <div className="pos-brand">
            <img src={logo} alt="Stockly" style={{ width: 28, height: 28, borderRadius: 6 }} />
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>Stockly POS</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="pos-btn-sm" onClick={holdOrder} disabled={cart.length === 0}>Hold</button>
            <button className="pos-btn-sm pos-btn-danger" onClick={clearCart} disabled={cart.length === 0}>Clear</button>
          </div>
        </div>

        {/* Held orders indicator */}
        {heldOrders.length > 0 && (
          <div className="pos-held-bar">
            <span>{heldOrders.length} held order{heldOrders.length > 1 ? "s" : ""}</span>
            <div style={{ display: "flex", gap: 4 }}>
              {heldOrders.map((o) => (
                <button key={o.id} className="pos-btn-sm" onClick={() => recallOrder(o.id)}>
                  Recall
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cart items */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div className="pos-cart-empty">
              <p>Cart is empty</p>
              <span>Add products to start billing</span>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="pos-cart-row">
                <div className="pos-cart-info">
                  <span className="pos-cart-name">{item.name}</span>
                  <span className="pos-cart-sku">{item.sku} | {fmt(item.unitPrice)}/unit</span>
                </div>
                <div className="pos-qty-ctrl">
                  <button onClick={() => updateQty(item._id, -1)} disabled={item.quantity <= 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, 1)}>+</button>
                </div>
                <span className="pos-cart-total">{fmt(item.unitPrice * item.quantity)}</span>
                <button className="pos-remove-btn" onClick={() => removeFromCart(item._id)}>x</button>
              </div>
            ))
          )}
        </div>

        {/* Cart summary */}
        <div className="pos-cart-summary">
          <div className="pos-summary-row">
            <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>{fmt(subtotal)}</span>
          </div>

          {/* Discount */}
          <div className="pos-summary-row">
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span>Discount</span>
              <select
                value={discount.type}
                onChange={(e) => setDiscount({ type: e.target.value, value: discount.value })}
                className="pos-select-mini"
              >
                <option value="none">None</option>
                <option value="percent">%</option>
                <option value="fixed">Fixed</option>
              </select>
              {discount.type !== "none" && (
                <input
                  type="number"
                  min="0"
                  value={discount.value}
                  onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
                  className="pos-input-mini"
                  placeholder={discount.type === "percent" ? "%" : "₹"}
                />
              )}
            </div>
            <span>-{fmt(discountAmount)}</span>
          </div>

          <div className="pos-summary-row">
            <span>GST (18%)</span>
            <span>{fmt(taxAmount)}</span>
          </div>

          <div className="pos-summary-total">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
        </div>
      </div>

      {/* CENTER — Products */}
      <div className="pos-products">
        <div className="pos-search-bar">
          <input
            ref={searchRef}
            className="pos-search"
            type="search"
            placeholder="Search product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="pos-btn-scan" onClick={() => setShowScanner(true)}>
            Scan
          </button>
        </div>

        {/* Category filters */}
        <div className="pos-cat-row">
          <button
            className={`pos-cat-btn ${!filterCat ? "active" : ""}`}
            onClick={() => setFilterCat("")}
          >All</button>
          {categories.map((c) => (
            <button
              key={c._id}
              className={`pos-cat-btn ${filterCat === c._id ? "active" : ""}`}
              onClick={() => setFilterCat(c._id)}
            >{c.name}</button>
          ))}
        </div>

        {/* Product grid */}
        <div className="pos-product-grid">
          {loading ? (
            Array.from({ length: 12 }, (_, i) => <div key={i} className="pos-tile-skeleton"></div>)
          ) : filtered.length === 0 ? (
            <div className="pos-no-products">No products found</div>
          ) : (
            filtered.map((p) => (
              <button key={p._id} className="pos-tile" onClick={() => addToCart(p)}>
                <span className="pos-tile-name">{p.name}</span>
                <span className="pos-tile-price">{fmt(p.unitPrice)}</span>
                <span className="pos-tile-stock">{p.stock} in stock</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT — Checkout */}
      <div className="pos-checkout">
        <div className="pos-checkout-header">
          <h3>Checkout</h3>
          <div className="pos-user-label">
            {user?.username} <span style={{ color: "#94a3b8", fontWeight: 400 }}>| Cashier</span>
          </div>
        </div>

        {/* Payment method */}
        <div className="pos-pay-methods">
          <label className="pos-pay-label">Payment Method</label>
          <div className="pos-pay-btns">
            {["cash", "card", "upi"].map((pm) => (
              <button
                key={pm}
                className={`pos-pay-btn ${paymentMethod === pm ? "active" : ""}`}
                onClick={() => setPaymentMethod(pm)}
              >
                {pm.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Amount tendered (cash only) */}
        {paymentMethod === "cash" && (
          <div className="pos-tendered">
            <label>Amount Received</label>
            <input
              type="number"
              min="0"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              placeholder={`Min ₹${Math.ceil(total)}`}
              className="pos-tendered-input"
            />
            {changeDue > 0 && (
              <div className="pos-change">Change: {fmt(changeDue)}</div>
            )}
            {/* Quick amount buttons */}
            <div className="pos-quick-amounts">
              {[100, 200, 500, 1000, 2000].map((amt) => (
                <button key={amt} className="pos-btn-sm" onClick={() => setAmountTendered(String(amt))}>
                  ₹{amt}
                </button>
              ))}
              <button className="pos-btn-sm" onClick={() => setAmountTendered(String(Math.ceil(total)))}>
                Exact
              </button>
            </div>
          </div>
        )}

        {/* Checkout totals */}
        <div className="pos-checkout-total">
          <span>Total Due</span>
          <span className="pos-grand-total">{fmt(total)}</span>
        </div>

        <button
          className="pos-checkout-btn"
          disabled={cart.length === 0 || processing || (paymentMethod === "cash" && parseFloat(amountTendered || 0) < total)}
          onClick={handleCheckout}
        >
          {processing ? "Processing..." : `Complete Sale  ${fmt(total)}`}
        </button>

        <button
          className="pos-logout-btn"
          onClick={() => { logout(); window.location.href = "/login"; }}
        >
          End Shift / Log Out
        </button>
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowScanner(false); }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <h3>Scan Barcode</h3>
            <div id="qr-reader" ref={scannerRef} style={{ width: "100%" }}></div>
            {/* Manual entry fallback */}
            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: "0.75rem", color: "#6b7280" }}>Or enter SKU manually:</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  id="manual-sku"
                  type="text"
                  placeholder="e.g. DAI-001"
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.85rem" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBarcodeScan(e.target.value);
                      e.target.value = "";
                    }
                  }}
                />
                <button className="modal-btn-confirm" onClick={() => {
                  const input = document.getElementById("manual-sku");
                  if (input?.value) { handleBarcodeScan(input.value); input.value = ""; }
                }}>Add</button>
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="modal-btn-cancel" onClick={() => setShowScanner(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowReceipt(null); }}>
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <div className="pos-receipt">
              <h3 style={{ textAlign: "center", margin: "0 0 4px" }}>STOCKLY</h3>
              <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#6b7280", margin: "0 0 12px" }}>Rajesh General Store</p>

              <div style={{ borderTop: "1px dashed #d1d5db", margin: "8px 0" }}></div>

              <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ textAlign: "left", padding: "4px 0" }}>Item</th>
                    <th style={{ textAlign: "right", padding: "4px 0" }}>Qty</th>
                    <th style={{ textAlign: "right", padding: "4px 0" }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {(showReceipt.items || []).map((item, i) => (
                    <tr key={i}>
                      <td style={{ padding: "3px 0" }}>{item.name}</td>
                      <td style={{ textAlign: "right" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right" }}>{fmt(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: "1px dashed #d1d5db", margin: "8px 0" }}></div>

              <div style={{ fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Subtotal</span><span>{fmt(showReceipt.subtotal)}</span></div>
                {showReceipt.discountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Discount</span><span>-{fmt(showReceipt.discountAmount)}</span></div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>GST (18%)</span><span>{fmt(showReceipt.taxAmount)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", marginTop: 6 }}>
                  <span>TOTAL</span><span>{fmt(showReceipt.total)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span>Payment</span><span>{(showReceipt.paymentMethod || "").toUpperCase()}</span>
                </div>
              </div>

              <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9ca3af", marginTop: 12 }}>
                Thank you for shopping!
              </p>
            </div>

            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="modal-btn-cancel" onClick={() => setShowReceipt(null)}>Close</button>
              <button className="modal-btn-confirm" onClick={printReceipt}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CashierPOS;
