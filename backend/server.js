import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const payments = [];

const normalizeStatus = (value) => {
  const status = `${value || ""}`.toLowerCase();

  if (
    ["paid", "successful", "success", "succeeded", "settled"].includes(status)
  ) {
    return "success";
  }

  if (
    ["pending", "processing", "in progress", "in_progress"].includes(status)
  ) {
    return "pending";
  }

  if (["failed", "declined", "error"].includes(status)) {
    return "failed";
  }

  return "pending";
};

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "PayTrace backend ready" });
});

app.post("/nomba/webhook", (req, res) => {
  const payload = req.body || {};

  const payment = {
    id: payload.id || payload.reference || `pay_${Date.now()}`,
    customer:
      payload.customerName ||
      payload.customer?.name ||
      payload.customer ||
      "Customer",
    amount: Number(payload.amount || payload.total || 0),
    status: normalizeStatus(
      payload.status || payload.paymentStatus || payload.state,
    ),
    currency: payload.currency || "NGN",
    merchantId: payload.merchantId || "NMB-18014",
    receivedAt: new Date().toISOString(),
  };

  payments.push(payment);
  console.log("Nomba webhook received:", payment);
  res.status(200).json({ ok: true, received: payment });
});

app.post("/merchant/connect", (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get("host")}/nomba/webhook`;

  res.json({
    ok: true,
    webhookUrl,
    instructions: [
      "In the Nomba merchant dashboard, open Developer / Webhooks or Merchant Settings.",
      "Add the webhook URL above for payment success events.",
      "Save the webhook and test it with a real payment or a replay event.",
    ],
  });
});

app.get("/payments", (_req, res) => {
  res.json(payments);
});

app.listen(PORT, () => {
  console.log(`PayTrace backend running on http://localhost:${PORT}`);
});
