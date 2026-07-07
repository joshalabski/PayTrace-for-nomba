import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup } from "../api/auth";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_HINT =
  "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) return;
    if (mode === "signup" && !name.trim()) {
      setError("Please tell us your name.");
      return;
    }
    if (mode === "signup" && !PASSWORD_RULE.test(password)) {
      setError(PASSWORD_HINT);
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await signup(name.trim(), email.trim(), password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
            <h1 className="auth-title">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="auth-sub">
              {mode === "login"
                ? "Sign in to your merchant dashboard"
                : "Set up your merchant dashboard in a minute"}
            </p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="field">
              <span className="field-label">Full name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Adaeze Okafor"
                required
              />
            </label>
          )}

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
            {mode === "signup" && (
              <p style={{ fontSize: "0.78rem", opacity: 0.65, margin: "0.35rem 0 0" }}>
                {PASSWORD_HINT}
              </p>
            )}
          </label>

          {mode === "login" && (
            <div className="auth-row">
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span>Remember me</span>
              </label>
              <a className="auth-link" href="#">
                Forgot password?
              </a>
            </div>
          )}

          {error && (
            <p style={{ color: "#e5484d", fontSize: "0.85rem", margin: "-0.25rem 0 0" }}>
              {error}
            </p>
          )}

          <button className="btn-signin" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p style={{ textAlign: "center", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="auth-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
              onClick={() => {
                setError("");
                setMode((m) => (m === "login" ? "signup" : "login"));
              }}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
