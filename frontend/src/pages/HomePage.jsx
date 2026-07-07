import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format";
import { getMerchantProfile } from "../api/client";

export default function HomePage() {
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [merchantName, setMerchantName] = useState("");

  useEffect(() => {
    const loadMerchant = async () => {
      try {
        const profile = await getMerchantProfile();
        setMerchantName(profile?.name && profile.name !== "Not set" ? profile.name : "Merchant");
      } catch (err) {
        console.warn("Could not load merchant profile:", err.message);
        setMerchantName("Merchant");
      }
    };
    loadMerchant();
  }, []);

  const successful = dashboardTransactions.filter(
    (tx) => tx.status === "success",
  ).length;
  const pending = dashboardTransactions.filter(
    (tx) => tx.status === "pending",
  ).length;
  const failed = dashboardTransactions.filter(
    (tx) => tx.status === "failed",
  ).length;
  const received = dashboardTransactions
    .filter((tx) => tx.status === "success")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expected = dashboardTransactions.reduce(
    (sum, tx) => sum + tx.amount,
    0,
  );
  const gap = expected - received;
  const rawPercent = expected ? Math.round((received / expected) * 100) : 0;
  const percent = Math.max(0, Math.min(100, rawPercent));
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (percent / 100) * circumference;
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState(
    "Checking connection...",
  );
  const [connectionState, setConnectionState] = useState("pending");

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

    const checkConnection = async () => {
      try {
        const response = await fetch(`${backendUrl}/health`);
        if (response.ok) {
          setConnectionStatus("Connected. Ready to receive payments.");
          setConnectionState("connected");
        } else {
          setConnectionStatus(
            "Backend not reachable yet. Start the server and refresh the page.",
          );
          setConnectionState("error");
        }
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setConnectionStatus(
          "Backend not reachable yet. Start the server and refresh the page.",
        );
        setConnectionState("error");
      }
    };

    const loadTransactions = async () => {
      try {
        const response = await fetch(`${backendUrl}/payments`);
        if (!response.ok) {
          return;
        }

        const incoming = await response.json();
        if (!Array.isArray(incoming)) {
          return;
        }

        setDashboardTransactions((current) => {
          const existing = new Map(current.map((item) => [item.id, item]));
          const next = [...current];
          let newPaymentToast = null;

          incoming.forEach((payment) => {
            const normalizedPayment = {
              id: payment.id || `nomba-${payment.receivedAt || Date.now()}`,
              customer: payment.customer || "Customer",
              method: payment.method || "card",
              status:
                payment.status === "success"
                  ? "success"
                  : payment.status === "failed"
                    ? "failed"
                    : "pending",
              amount: Number(payment.amount || 0),
              date: payment.receivedAt || new Date().toISOString(),
            };

            if (!existing.has(normalizedPayment.id)) {
              next.unshift(normalizedPayment);
              existing.set(normalizedPayment.id, normalizedPayment);
              newPaymentToast = normalizedPayment;
            }
          });

          if (newPaymentToast) {
            const statusMessage =
              newPaymentToast.status === "success"
                ? "settled"
                : newPaymentToast.status === "failed"
                  ? "failed"
                  : "is pending";
            if (toastTimeoutRef.current) {
              window.clearTimeout(toastTimeoutRef.current);
            }
            setToast(
              `${newPaymentToast.customer} ${statusMessage} a payment of ${formatCurrency(newPaymentToast.amount)}.`,
            );
            setToastVisible(true);
            toastTimeoutRef.current = window.setTimeout(() => {
              setToastVisible(false);
              toastTimeoutRef.current = null;
            }, 2600);
          }

          return next;
        });
      } catch (error) {
        console.error("Unable to load payments", error);
      }
    };

    checkConnection();
    loadTransactions();
    const poller = window.setInterval(() => {
      checkConnection();
      loadTransactions();
    }, 5000);

    return () => window.clearInterval(poller);
  }, []);

  return (
    <section className="view view--active">
      <div className="greeting">
        <p className="greeting-hi">Good day,</p>
        <h1 className="greeting-name">{merchantName || "..."}</h1>
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
          {dashboardTransactions.length === 0
            ? "No payments received yet."
            : failed > 0
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

      <article className="card nomba-card">
        <div className="nomba-card-head">
          <div>
            <p className="nomba-card-label">Nomba connection</p>
            <h2 className="nomba-card-title">Merchant link status</h2>
          </div>
          <span className={`nomba-pill nomba-pill--${connectionState}`}>
            {connectionState === "connected"
              ? "Live"
              : connectionState === "error"
                ? "Offline"
                : "Checking"}
          </span>
        </div>

        <p className="nomba-card-copy">{connectionStatus}</p>
      </article>

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
        className={`toast ${toastVisible && toast ? "show" : ""}`}
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
