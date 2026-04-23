import "./App.css";
import "./styles/pos.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./components/ToastProvider";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Owner pages
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Products from "./pages/Products";
import StockAlerts from "./pages/StockAlerts";
import Purchases from "./pages/Purchases";
import Suppliers from "./pages/Suppliers";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

// Stock Manager pages
import SmDashboard from "./pages/stockmgr/SmDashboard";
import StockList from "./pages/stockmgr/StockList";
import ReceiveStock from "./pages/stockmgr/ReceiveStock";
import AdjustStock from "./pages/stockmgr/AdjustStock";
import ActivityLog from "./pages/stockmgr/ActivityLog";

// Cashier
import CashierPOS from "./pages/CashierPOS";
import DailySummary from "./pages/cashier/DailySummary";

function RedirectByRole() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "cashier") return <Navigate to="/cashier/pos" replace />;
  if (user.role === "stockmgr") return <Navigate to="/sm/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Owner routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Products />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock-alerts"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <StockAlerts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Purchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Suppliers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={["owner"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Stock Manager routes */}
            <Route
              path="/sm/dashboard"
              element={
                <ProtectedRoute allowedRoles={["stockmgr"]}>
                  <SmDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sm/stock-list"
              element={
                <ProtectedRoute allowedRoles={["stockmgr"]}>
                  <StockList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sm/receive-stock"
              element={
                <ProtectedRoute allowedRoles={["stockmgr"]}>
                  <ReceiveStock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sm/adjust-stock"
              element={
                <ProtectedRoute allowedRoles={["stockmgr"]}>
                  <AdjustStock />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sm/activity-log"
              element={
                <ProtectedRoute allowedRoles={["stockmgr"]}>
                  <ActivityLog />
                </ProtectedRoute>
              }
            />

            {/* Cashier routes */}
            <Route
              path="/cashier/pos"
              element={
                <ProtectedRoute allowedRoles={["cashier"]}>
                  <CashierPOS />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cashier/summary"
              element={
                <ProtectedRoute allowedRoles={["cashier"]}>
                  <DailySummary />
                </ProtectedRoute>
              }
            />
            {/* Legacy cashier route redirect */}
            <Route path="/cashier" element={<Navigate to="/cashier/pos" replace />} />

            {/* Landing Page */}
            <Route path="/go" element={<RedirectByRole />} />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
