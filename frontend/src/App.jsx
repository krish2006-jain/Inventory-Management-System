import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Products from "./pages/Products";
import Purchases from "./pages/Purchases";
import Suppliers from "./pages/Suppliers";
import PlaceholderPage from "./pages/PlaceholderPage";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

function AuthShell({ children }) {
  return (
    <div className="app-shell">
      <div className="bg-shape bg-shape-one" aria-hidden="true" />
      <div className="bg-shape bg-shape-two" aria-hidden="true" />
      <div className="noise-mask" aria-hidden="true" />

      <main className="auth-layout">
        <section className="brand-panel">
          <p className="kicker">Stockly</p>
          <h1>Inventory control with style and speed.</h1>
          <p>
            See stock levels, movement, and product health in one focused
            workspace. This first UI pass is designed for clarity, pace, and
            daily use.
          </p>

          <div className="brand-metrics">
            <article>
              <h2>98.7%</h2>
              <span>Order accuracy</span>
            </article>
            <article>
              <h2>2.4x</h2>
              <span>Faster count cycles</span>
            </article>
            <article>
              <h2>24/7</h2>
              <span>Realtime snapshots</span>
            </article>
          </div>
        </section>

        <section className="auth-panel">{children}</section>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthShell>
              <Login />
            </AuthShell>
          }
        />
        <Route
          path="/register"
          element={
            <AuthShell>
              <Register />
            </AuthShell>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/products" element={<Products />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route
          path="/categories"
          element={
            <PlaceholderPage
              title="Categories"
              description="Category management layout is ready for data integration."
            />
          }
        />
        <Route
          path="/stock-alerts"
          element={
            <PlaceholderPage
              title="Stock Alerts"
              description="Stock alerts panel can now be connected to your inventory API."
            />
          }
        />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
