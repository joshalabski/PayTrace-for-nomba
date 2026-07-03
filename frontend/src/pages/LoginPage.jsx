import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (email.trim() && password.trim()) {
      navigate("/dashboard");
    }
  };

  const handleGoogle = () => {
    navigate("/dashboard");
  };

  return (
    <section className="auth-screen">
      <aside className="auth-aside" aria-label="App overview">
        <div className="auth-brand">
          <div className="brand-mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 17l5-5 4 4 8-8" />
              <path d="M16 8h4v4" />
            </svg>
          </div>
          <span className="brand-name">
            Pay<span className="brand-accent">Trace</span>
          </span>
        </div>

        <h2 className="auth-aside-title">Every naira, accounted for.</h2>
        <p className="auth-aside-sub">
          Track POS taps, transfers and USSD payments in real time — and resolve
          disputes in a tap.
        </p>

        <ul className="auth-points">
          <li>
            <span className="ap-dot"></span> Live money-gap monitoring
          </li>
          <li>
            <span className="ap-dot"></span> Instant dispute resolution
          </li>
          <li>
            <span className="ap-dot"></span> Friendly 24/7 support
          </li>
        </ul>
      </aside>

      <div className="auth-card">
        <div className="auth-mark">
          <div className="brand-mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 17l5-5 4 4 8-8" />
              <path d="M16 8h4v4" />
            </svg>
          </div>
          <div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-sub">Sign in to your merchant dashboard</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <button className="btn-google" type="button" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">or</div>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@business.com"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <div className="field-pass">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />
              <button
                className="pass-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <div className="auth-row">
            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <a className="auth-link" href="#">
              Forgot password?
            </a>
          </div>

          <button className="btn-signin" type="submit">
            Sign in
          </button>
        </form>
      </div>
    </section>
  );
}
