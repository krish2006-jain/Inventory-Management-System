import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="auth-card card-enter">
      <div className="auth-head">
        <p className="eyebrow">Get Started</p>
        <h2>Create your account</h2>
        <p>
          Set up your workspace and start organizing your inventory in minutes.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          placeholder="Ava Martinez"
          required
        />

        <label htmlFor="register-email">Work email</label>
        <input
          id="register-email"
          type="email"
          placeholder="you@company.com"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          placeholder="At least 8 characters"
          required
        />

        <label htmlFor="register-confirm">Confirm password</label>
        <input
          id="register-confirm"
          type="password"
          placeholder="Repeat your password"
          required
        />

        <label className="inline-check" htmlFor="terms-accept">
          <input id="terms-accept" type="checkbox" required />
          <span>I agree to the Terms and Privacy Policy</span>
        </label>

        <button type="submit" className="cta-btn">
          Create account
        </button>
      </form>

      <p className="switch-auth">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
