import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpeg";
import "../../styles/cashier.css";

const fruits = [
  { name: "Green Grapes", price: 85, img: "GG" },
  { name: "Banana", price: 45, img: "BN" },
  { name: "Apple", price: 120, img: "AP" },
  { name: "Orange", price: 65, img: "OR" },
  { name: "Black Grapes", price: 95, img: "BG" },
  { name: "Mango", price: 180, img: "MG" },
  { name: "Cherry", price: 140, img: "CH" },
  { name: "Strawberry", price: 160, img: "SB" },
  { name: "Plum", price: 80, img: "PL" },
];

const categories = [
  "Fruits and Vegetables",
  "Dairy",
  "Beverages",
  "Snacks",
  "Personal Care",
];

function CashierPOS() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([
    { name: "Table Flood", qty: 100, price: 250, unit: "Unit" },
    { name: "Orange", qty: 100, price: 65, unit: "Unit" },
    { name: "Black Grapes", qty: 50, price: 95, unit: "Grain" },
    { name: "Enamel", qty: 100, price: 350, unit: "Unit" },
    { name: "Table Cover", qty: 125, price: 90, unit: "Roll" },
  ]);
  const [activeCategory, setActiveCategory] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [numInput, setNumInput] = useState("");

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name);
      if (existing) {
        return prev.map((c) =>
          c.name === item.name ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [
        ...prev,
        { name: item.name, qty: 1, price: item.price, unit: "Unit" },
      ];
    });
  };

  const handleNumPad = (val) => {
    if (val === "C") setNumInput("");
    else setNumInput((p) => p + val);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handlePayment = () => {
    setCart([]);
    setNumInput("");
  };

  return (
    <div className="pos-shell">
      {/* Header */}
      <header className="pos-header">
        <div className="pos-brand">
          <img src={logo} alt="Stockly" className="pos-logo" />
          <span>Dashboard</span>
          <span className="pos-date">Monday, 18 March 2026</span>
        </div>
        <div className="pos-user" onClick={handleLogout} title="Logout">
          <div
            className="avatar"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#e8e3fb",
              display: "grid",
              placeItems: "center",
              color: "#6c4ef2",
              fontWeight: 700,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || "C"}
          </div>
        </div>
      </header>

      <div className="pos-body">
        {/* Left: Order */}
        <aside className="pos-order">
          <div className="order-list">
            {cart.map((item, i) => (
              <div key={i} className="order-item">
                <div className="order-item-info">
                  <strong>{item.name}</strong>
                  <span>
                    {item.qty} {item.unit}
                  </span>
                </div>
                <span className="order-item-price">
                  ₹{(item.qty * item.price).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="order-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString()}</strong>
          </div>

          <div className="order-actions">
            <span className="pos-action-chip">Billing</span>
            <span className="pos-action-chip">Split check</span>
            <span className="pos-action-chip">Order review</span>
          </div>

          <div className="pos-numpad-section">
            <div className="pos-customer">
              <label>Customer</label>
            </div>
            <div className="pos-numpad">
              {[
                "1",
                "2",
                "3",
                "Qty",
                "4",
                "5",
                "6",
                "Del",
                "7",
                "8",
                "9",
                "Disc",
                "+/-",
                "0",
                ".",
                "",
              ].map((key, i) => (
                <button
                  key={i}
                  className={`numpad-btn ${key === "" ? "numpad-empty" : ""}`}
                  type="button"
                  onClick={() => key && handleNumPad(key)}
                >
                  {key}
                </button>
              ))}
            </div>
            <button
              className="pos-payment-btn"
              type="button"
              onClick={handlePayment}
            >
              Proceed to Payment
            </button>
          </div>
        </aside>

        {/* Right: Product grid */}
        <main className="pos-products">
          <div className="pos-floor-tabs">
            <span className="pos-floor active">Main Floor</span>
            <span
              style={{ marginLeft: "auto", fontSize: "0.9rem", color: "#555" }}
            >
              StoreX87
            </span>
          </div>

          <div className="pos-category-bar">
            {categories.map((cat, i) => (
              <button
                key={cat}
                className={`pos-cat-btn ${activeCategory === i ? "active" : ""}`}
                onClick={() => setActiveCategory(i)}
                type="button"
              >
                {cat}
              </button>
            ))}
            <div className="pos-cat-right">
              <input
                className="pos-search"
                type="search"
                placeholder="Search"
              />
            </div>
          </div>

          <div className="pos-product-grid">
            {fruits.map((f) => (
              <button
                key={f.name}
                className="pos-product-card"
                type="button"
                onClick={() => addToCart(f)}
              >
                <div className="pos-product-emoji">{f.img}</div>
                <span className="pos-product-price">₹{f.price}</span>
                <span className="pos-product-name">{f.name}</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CashierPOS;
