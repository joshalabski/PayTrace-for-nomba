import { Router } from "express";
import { parseNombaPayload } from "../utils/parsePayload.js";
import { addPayment } from "../services/paymentStore.js";

const router = Router();

router.post("/", (req, res) => {
  const payment = parseNombaPayload(req.body);
  addPayment(payment);
  console.log("Nomba webhook received:", payment);
  res.status(200).json({ ok: true, received: payment });
});

export default router;
