import { disputes, formatCurrency } from "../data/mockData";

// NOTE: the backend has no /disputes endpoint yet — this still reads
// from mockData.js on purpose. Wire this up once a disputes route exists.

export default function DisputesPage() {
  return (
    <section className="view view--active">
      <div className="view-head">
        <h2 className="view-title">Dispute Center</h2>
      </div>
      <p className="view-intro">
        Resolve mismatched or failed payments. One tap reports the issue to
        Nomba support with smart guidance.
      </p>

      <div className="disputes">
        {disputes.length === 0 ? (
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
