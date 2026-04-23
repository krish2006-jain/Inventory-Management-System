import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    if (!user) return navigate("/");
    if (user.role === "cashier") return navigate("/cashier/pos");
    if (user.role === "stockmgr") return navigate("/sm/dashboard");
    return navigate("/dashboard");
  };

  return (
    <div className="error-page">
      <div className="error-page-inner">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-text">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button className="error-btn" onClick={goHome}>
          ← Go to Dashboard
        </button>
      </div>
    </div>
  );
}
