import { useEffect, useState } from "react";
import {
  transactions as mockTransactions,
  formatCurrency,
  formatDate,
} from "../data/mockData";
import { getPayments, toTransaction } from "../api/client";

const methodLabel = {
  card: "POS Card Tap",
  transfer: "Bank Transfer",
  ussd: "USSD Payment",
};

export default function ActivityPage() {
  const [filter, setFilter] = useState("all");
  const [transactions, setTransactions] = useState(mockTransactions);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const payments = await getPayments();
        const real = payments.map(toTransaction);

        setTransactions((current) => {
          const existing = new Map(current.map((tx) => [tx.id, tx]));
          real.forEach((tx) => {
            if (!existing.has(tx.id)) {
              existing.set(tx.id, tx);
            }
          });
          // Keep newest first, real payments included alongside seed data.
          return Array.from(existing.values()).sort(
            (a, b) => new Date(b.date) - new Date(a.date),
          );
        });
        setIsLive(true);
      } catch (error) {
        console.error("Unable to load payments", error);
        setIsLive(false);
      }
    };

    load();
    const poller = window.setInterval(load, 5000);
    return () => window.clearInterval(poller);
  }, []);

  const visibleTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((tx) => tx.status === filter);

  return (
    <section className="view view--active">
      <div className="view-head">
        <h2 className="view-title">Activity Feed</h2>
        <span className="live-badge">
          <span className="live-dot"></span> {isLive ? "Live" : "Offline"}
        </span>
      </div>

      <div className="filters" role="tablist" aria-label="Transaction filters">
        {[
          { value: "all", label: "All" },
          { value: "success", label: "Success" },
          { value: "pending", label: "Pending" },
          { value: "failed", label: "Failed" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            className={`filter${filter === item.value ? " filter--active" : ""}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="feed" aria-live="polite">
        {visibleTransactions.length === 0 ? (
          <div className="empty">No transactions yet.</div>
        ) : (
          visibleTransactions.map((tx) => (
            <li key={tx.id} className={`tx tx--${tx.status}`}>
              <div className="tx-icon" aria-hidden="true">
                {tx.status === "success"
                  ? "✓"
                  : tx.status === "pending"
                    ? "⏱"
                    : "✕"}
              </div>
              <div className="tx-main">
                <div className="tx-title">{tx.customer}</div>
                <div className="tx-method">
                  {methodLabel[tx.method] || tx.method}
                  <span className="dot"></span>
                  {formatDate(tx.date)}
                </div>
              </div>
              <div className="tx-right">
                <span className="tx-amount">{formatCurrency(tx.amount)}</span>
                <span className={`tx-tag tag--${tx.status}`}>{tx.status}</span>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
