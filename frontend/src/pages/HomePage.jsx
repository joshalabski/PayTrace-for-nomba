import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { merchant, transactions, formatCurrency } from "../data/mockData";

export default function HomePage() {
  const successful = transactions.filter(
    (tx) => tx.status === "success",
  ).length;
  const pending = transactions.filter((tx) => tx.status === "pending").length;
  const failed = transactions.filter((tx) => tx.status === "failed").length;
  const received = transactions
    .filter((tx) => tx.status === "success")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expected = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const gap = expected - received;
  const rawPercent = expected ? Math.round((received / expected) * 100) : 0;
  const percent = Math.max(0, Math.min(100, rawPercent));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percent / 100) * circumference;
  const [toast, setToast] = useState("A new transfer is now in review.");
  const [toastVisible, setToastVisible] = useState(true);

  useEffect(() => {
    const messages = [
      "Amina paid NGN 128,500 for a card purchase.",
      "Tunde's transfer is pending settlement.",
      "Ngozi's payment settled successfully.",
      "Bola's dispute is now under review.",
    ];

    let index = 0;
    let timeoutId;

    const cycleToast = () => {
      setToast(messages[index % messages.length]);
      setToastVisible(true);
      index += 1;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => setToastVisible(false), 2600);
    };

    cycleToast();
    const timer = window.setInterval(cycleToast, 9000);

    return () => {
      window.clearInterval(timer);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <section className="view view--active">
      <div className="greeting">
        <p className="greeting-hi">Good day,</p>
        <h1 className="greeting-name">{merchant.business}</h1>
      </div>

      <article className="card moneygap" id="moneyGapCard">
        <div className="moneygap-head">
          <span className="chip">
            {percent >= 100 ? "All Good" : "Action Required"}
          </span>
          <span className="moneygap-title">Today's money gap</span>
        </div>

        <div className="moneygap-body">
          <div className="gauge-wrap">
            <svg className="gauge" viewBox="0 0 120 120" aria-hidden="true">
              <circle className="gauge-track" cx="60" cy="60" r="52" />
              <circle
                className="gauge-fill"
                cx="60"
                cy="60"
                r={radius}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeOffset,
                }}
              />
            </svg>
            <div className="gauge-center">
              <span className="gauge-pct">{percent}%</span>
              <span className="gauge-label">received</span>
            </div>
          </div>

          <div className="moneygap-figures">
            <div className="figure">
              <span className="figure-label">Expected Today</span>
              <span className="figure-value">{formatCurrency(expected)}</span>
            </div>
            <div className="figure figure--received">
              <span className="figure-label">Received Today</span>
              <span className="figure-value">{formatCurrency(received)}</span>
            </div>
            <div className="figure figure--gap">
              <span className="figure-label">Outstanding Gap</span>
              <span className="figure-value">{formatCurrency(gap)}</span>
            </div>
          </div>
        </div>

        <p className="moneygap-note">
          {failed > 0
            ? `${failed} failed payment${failed > 1 ? "s" : ""} need attention.`
            : "Every expected payment has landed."}
        </p>
      </article>

      <div className="ministats">
        <div className="ministat">
          <span className="ministat-num">{successful}</span>
          <span className="ministat-lbl">Successful</span>
        </div>
        <div className="ministat ministat--pending">
          <span className="ministat-num">{pending}</span>
          <span className="ministat-lbl">Pending</span>
        </div>
        <div className="ministat ministat--failed">
          <span className="ministat-num">{failed}</span>
          <span className="ministat-lbl">Failed</span>
        </div>
      </div>

      <div className="quick-actions">
        <Link className="qa qa--primary" to="/activity">
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M7 14l4-4 3 3 5-6" />
          </svg>
          <span>View Reports</span>
        </Link>
        <button className="qa qa--ghost" type="button" disabled>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Customer Care</span>
        </button>
      </div>

      <div
        className={`toast ${toastVisible ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M5 12l4 4 10-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{toast}</span>
      </div>
    </section>
  );
}
