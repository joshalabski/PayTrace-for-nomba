import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/format";
import { authFetch } from "../api/auth";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await authFetch("/disputes");
        if (!response.ok) throw new Error("Failed to load disputes");
        const data = await response.json();
        setDisputes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not load disputes");
      }
    };
    load();
  }, []);

  return (
    <section className="view view--active">
      <div className="view-head">
        <h2 className="view-title">Dispute Center</h2>
      </div>
      <p className="view-intro">
        Resolve mismatched or failed payments. One tap reports the issue to
        Nomba support with smart guidance.
      </p>

      {error && <div className="empty">{error}</div>}

      <div className="disputes">
        {!error && disputes.length === 0 ? (
          <div className="empty">No disputes yet.</div>
        ) : (
          disputes.map((item) => (
            <article key={item.id} className="dispute">
              <div className="dispute-top">
                <div className="tx-icon" aria-hidden="true">
                  ⚠
                </div>
                <div className="dispute-info">
                  <div className="dispute-cust">{item.customer}</div>
                  <div className="dispute-meta">
                    {item.id} • {item.status}
                  </div>
                </div>
                <div className="dispute-amt">{formatCurrency(item.amount)}</div>
              </div>
              <div className="dispute-reason">{item.reason}</div>
              <button className="dispute-btn" type="button">
                Resolve dispute
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
