import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <div className="error-page-inner">
        <div className="error-code">401</div>
        <h1 className="error-title">Access Denied</h1>
        <p className="error-text">
          You don't have permission to view this page.
          <br />
          Please contact your administrator if you believe this is an error.
        </p>
        <button className="error-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      </div>
    </div>
  );
}
