import { useState } from "react";
import { formatCurrency, formatDate, formatMethod } from "../utils/format";
import { createDispute } from "../api/client";

export default function TransactionModal({ transaction, onClose, onDisputeFiled }) {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [filed, setFiled] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleShare = async () => {
    const summary =
      `PayTrace receipt\n` +
      `Customer: ${transaction.customer}\n` +
      `Reference: ${transaction.id}\n` +
      `Method: ${formatMethod(transaction.method)}\n` +
      `Amount: ${formatCurrency(transaction.amount)}\n` +
      `Status: ${transaction.status}\n` +
      `Date: ${formatDate(transaction.date)}`;

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy receipt to clipboard");
    }
  };

  const handleFileDispute = async (event) => {
    event.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Tell us what went wrong before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const dispute = await createDispute({
        paymentId: transaction.id,
        customer: transaction.customer,
        amount: transaction.amount,
        reason: reason.trim(),
      });
      setFiled(true);
      setShowDisputeForm(false);
      onDisputeFiled?.(dispute);
    } catch (err) {
      setError(err.message || "Could not file dispute");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="md-head">
          <div className={`tx-icon tx--${transaction.status}`} aria-hidden="true">
            {transaction.status === "success" ? "✓" : transaction.status === "pending" ? "⏱" : "✕"}
          </div>
          <div>
            <div className="md-amount">{formatCurrency(transaction.amount)}</div>
            <div className="md-sub">{formatDate(transaction.date)}</div>
          </div>
        </div>

        <div className="md-rows">
          <div className="md-row">
            <span className="k">Customer</span>
            <span className="v">{transaction.customer}</span>
          </div>
          <div className="md-row">
            <span className="k">Reference</span>
            <span className="v">{transaction.id}</span>
          </div>
          <div className="md-row">
            <span className="k">Method</span>
            <span className="v">{formatMethod(transaction.method)}</span>
          </div>
          <div className="md-row">
            <span className="k">Status</span>
            <span className="v" style={{ textTransform: "capitalize" }}>
              {transaction.status}
            </span>
          </div>
        </div>

        {transaction.status === "failed" && (
          <div className="md-error">
            <div className="err-code">Payment not settled</div>
            <div className="err-msg">
              This payment did not land in your account. File a dispute and we'll flag it to
              Nomba support on your behalf.
            </div>
          </div>
        )}

        {filed && <p className="md-dispute-note success">Dispute filed — track it on the Disputes page.</p>}
        {error && <p className="md-dispute-note">{error}</p>}
        {copied && <p className="md-dispute-note success">Receipt copied to clipboard.</p>}

        {showDisputeForm ? (
          <form onSubmit={handleFileDispute} style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
            <label className="field">
              <span className="field-label">What went wrong?</span>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. Customer was charged twice for one order"
                style={{
                  width: "100%",
                  resize: "vertical",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                }}
                required
              />
            </label>
            <div className="md-actions">
              <button type="button" className="btn-share" onClick={() => setShowDisputeForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-dispute" disabled={submitting}>
                {submitting ? "Filing..." : "Submit dispute"}
              </button>
            </div>
          </form>
        ) : (
          !filed && (
            <div className="md-actions">
              <button type="button" className="btn-share" onClick={handleShare}>
                Copy receipt
              </button>
              <button type="button" className="btn-dispute" onClick={() => setShowDisputeForm(true)}>
                Report dispute
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
