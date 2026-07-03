import { Router } from "express";
import { DEFAULT_MERCHANT_ID } from "../config.js";

const router = Router();

const buildConnectResponse = (req) => {
  const webhookUrl = `${req.protocol}://${req.get("host")}/nomba/webhook`;

  return {
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
      merchantId: DEFAULT_MERCHANT_ID,
    },
  };
};

router.all("/", (req, res) => {
  res.json(buildConnectResponse(req));
});

export default router;
