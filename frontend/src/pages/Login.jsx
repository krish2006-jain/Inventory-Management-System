import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-card card-enter">
      <div className="auth-head">
        <p className="eyebrow">Welcome Back</p>
        <h2>Sign in to your workspace</h2>
        <p>
          Track products, watch trends, and manage inventory decisions in real
          time.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          placeholder="you@company.com"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <div className="row-between">
          <label className="inline-check" htmlFor="remember-me">
            <input id="remember-me" type="checkbox" />
            <span>Remember me</span>
          </label>
          <button type="button" className="link-btn">
            Forgot password?
          </button>
        </div>

        <button type="submit" className="cta-btn">
          Sign in
        </button>
      </form>

      <p className="switch-auth">
        New to Stockly? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
}

export default Login;
