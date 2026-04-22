import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the user's default dashboard
    const home =
      user.role === "cashier" ? "/cashier" : user.role === "stockmgr" ? "/sm/dashboard" : "/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}

export default ProtectedRoute;
