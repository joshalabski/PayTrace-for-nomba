import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <section className="view view--active">
      <div className="greeting">
        <p className="greeting-hi">About</p>
        <h1 className="greeting-name">PayTrace</h1>
      </div>

      <article className="card" style={{ padding: "1.25rem", display: "grid", gap: "0.9rem" }}>
        <p style={{ margin: 0 }}>
          PayTrace helps merchants keep every payment accounted for. It watches your
          linked Nomba merchant account in real time, flags any gap between what you
          expected to receive and what actually landed, and gives you a simple place
          to track disputes.
        </p>

        <div>
          <h3 style={{ margin: "0 0 0.35rem" }}>What you can do here</h3>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: "0.35rem" }}>
            <li>Watch successful, pending, and failed payments as they come in</li>
            <li>See your daily "money gap" — expected vs. received</li>
            <li>Link your Nomba merchant account so payments show up automatically</li>
            <li>Track and resolve payment disputes</li>
          </ul>
        </div>

        <div>
          <h3 style={{ margin: "0 0 0.35rem" }}>Version</h3>
          <p style={{ margin: 0, opacity: 0.75 }}>PayTrace v1.0.0</p>
        </div>

        <div>
          <h3 style={{ margin: "0 0 0.35rem" }}>Need help?</h3>
          <p style={{ margin: 0, opacity: 0.75 }}>
            Reach us any time at{" "}
            <a className="auth-link" href="mailto:support@paytrace.app">
              support@paytrace.app
            </a>
            .
          </p>
        </div>
      </article>

      <Link className="qa qa--primary" to="/dashboard" style={{ marginTop: "1rem" }}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span>Back to dashboard</span>
      </Link>
    </section>
  );
}
