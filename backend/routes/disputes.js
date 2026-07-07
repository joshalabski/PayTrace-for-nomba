import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getDisputes,
  addDispute,
  resolveDispute,
  findDisputeByPaymentId,
} from "../services/disputeStore.js";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json(getDisputes());
});

// POST /disputes — file a new dispute against a payment
router.post("/", requireAuth, (req, res) => {
  const { paymentId, customer, amount, reason } = req.body || {};

  if (!reason || !reason.trim()) {
    return res.status(400).json({ ok: false, error: "A reason is required to file a dispute" });
  }

  if (paymentId) {
    const existing = findDisputeByPaymentId(paymentId);
    if (existing) {
      return res.status(409).json({ ok: false, error: "A dispute already exists for this payment", dispute: existing });
    }
  }

  const dispute = addDispute({
    paymentId,
    customer: customer || "Customer",
    amount: Number(amount || 0),
    reason: reason.trim(),
  });

  res.status(201).json({ ok: true, dispute });
});

// PATCH /disputes/:id/resolve — mark a dispute as resolved
router.patch("/:id/resolve", requireAuth, (req, res) => {
  const { id } = req.params;
  const dispute = resolveDispute(id);

  if (!dispute) {
    return res.status(404).json({ ok: false, error: "Dispute not found" });
  }

  res.json({ ok: true, dispute });
});

export default router;
