import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getDisputes } from "../services/disputeStore.js";

const router = Router();

router.get("/", requireAuth, (_req, res) => {
  res.json(getDisputes());
});

export default router;
