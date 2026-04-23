import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Unauthorized from "../pages/Unauthorized";

/**
 * Route guard that checks authentication AND role authorization.
 * - Not logged in → redirect to /login
 * - Logged in but wrong role → show 401 Unauthorized page (NOT redirect)
 * 
 * This is critical for real security: if a cashier manually types /dashboard
 * in the URL bar, they see a clear "Access Denied" page, not a silent redirect.
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  return children;
}
