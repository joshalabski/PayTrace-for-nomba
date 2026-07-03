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
  const sandboxPayload =
    payload.data && typeof payload.data === "object" ? payload.data : payload;

  const payment = {
    id:
      sandboxPayload.id ||
      sandboxPayload.paymentId ||
      sandboxPayload.reference ||
      sandboxPayload.transactionReference ||
      payload.id ||
      payload.reference ||
      `pay_${Date.now()}`,
    customer:
      sandboxPayload.customerName ||
      sandboxPayload.customer?.name ||
      sandboxPayload.customer ||
      sandboxPayload.clientName ||
      sandboxPayload.customer_name ||
      payload.customerName ||
      payload.customer?.name ||
      payload.customer ||
      "Customer",
    amount: Number(
      sandboxPayload.amount ||
        sandboxPayload.total ||
        sandboxPayload.amountPaid ||
        sandboxPayload.paymentAmount ||
        payload.amount ||
        payload.total ||
        0,
    ),
    status: normalizeStatus(
      sandboxPayload.status ||
        sandboxPayload.paymentStatus ||
        sandboxPayload.state ||
        sandboxPayload.payment_state ||
        payload.status ||
        payload.paymentStatus ||
        payload.state,
    ),
    currency: sandboxPayload.currency || payload.currency || "NGN",
    merchantId:
      sandboxPayload.merchantId ||
      sandboxPayload.merchant_id ||
      sandboxPayload.merchant?.id ||
      payload.merchantId ||
      "NMB-18014",
    receivedAt: new Date().toISOString(),
  };

  payments.push(payment);
  console.log("Nomba webhook received:", payment);
  res.status(200).json({ ok: true, received: payment });
});

const sendConnectResponse = (req, res) => {
  const webhookUrl = `${req.protocol}://${req.get("host")}/nomba/webhook`;

  res.json({
    ok: true,
    webhookUrl,
    sandboxWebhookUrl: webhookUrl,
    mode: "sandbox-test",
    instructions: [
      "Open the Nomba sandbox or merchant dashboard webhook settings.",
      "Paste the webhook URL above into the webhook configuration.",
      "Save the webhook and trigger a test payment or replay a sample event.",
    ],
    samplePayload: {
      id: "pay_test_001",
      customerName: "Adaeze",
      amount: 250000,
      status: "paid",
      merchantId: "NMB-18014",
    },
  });
};

app.get("/testing/connect", (req, res) => {
  sendConnectResponse(req, res);
});

app.post("/testing/connect", (req, res) => {
  sendConnectResponse(req, res);
});

app.get("/merchant/connect", (req, res) => {
  sendConnectResponse(req, res);
});

app.post("/merchant/connect", (req, res) => {
  sendConnectResponse(req, res);
});

app.get("/payments", (_req, res) => {
  res.json(payments);
});

app.listen(PORT, () => {
  console.log(`PayTrace backend running on http://localhost:${PORT}`);
});
