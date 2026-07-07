import { useEffect, useState } from "react";
import { formatCurrency } from "../utils/format";
import { getDisputes, resolveDispute } from "../api/client";

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDisputes();
        setDisputes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Could not load disputes");
      }
    };
    load();
  }, []);

  const handleResolve = async (id) => {
    setResolvingId(id);
    setError("");
    try {
      const updated = await resolveDispute(id);
      setDisputes((current) =>
        current.map((d) => (d.id === id ? updated : d)),
      );
    } catch (err) {
      setError(err.message || "Could not resolve dispute");
    } finally {
      setResolvingId(null);
    }
  };

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
                  {item.status === "resolved" ? "✓" : "⚠"}
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
              {item.status === "resolved" ? (
                <button className="dispute-btn" type="button" disabled>
                  Resolved
                </button>
              ) : (
                <button
                  className="dispute-btn"
                  type="button"
                  onClick={() => handleResolve(item.id)}
                  disabled={resolvingId === item.id}
                >
                  {resolvingId === item.id ? "Resolving..." : "Resolve dispute"}
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
