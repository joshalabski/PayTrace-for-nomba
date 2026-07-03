import { Router } from "express";
import { getPayments } from "../services/paymentStore.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getPayments());
});

export default router;
