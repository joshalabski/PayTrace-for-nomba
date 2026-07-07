import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { findMerchantByUserId, upsertMerchant } from "../services/userStore.js";

const router = Router();

// GET /merchant/profile — returns name, account no, merchant id for the logged-in user
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const merchant = await findMerchantByUserId(req.user.userId);

    if (!merchant) {
      return res.json({
        ok: true,
        merchant: {
          name: "Not set",
          accountNo: "Not set",
          merchantId: "Not set",
        },
      });
    }

    res.json({
      ok: true,
      merchant: {
        name: merchant.name,
        accountNo: merchant.account_no,
        merchantId: merchant.merchant_id,
      },
    });
  } catch (err) {
    console.error("Fetch merchant profile error:", err);
    res.status(500).json({ ok: false, error: "Could not load merchant profile" });
  }
});

// PUT /merchant/profile — update/create merchant profile
router.put("/profile", requireAuth, async (req, res) => {
  const { name, accountNo, merchantId } = req.body || {};

  try {
    const merchant = await upsertMerchant({
      userId: req.user.userId,
      name,
      accountNo,
      merchantId,
    });

    res.json({
      ok: true,
      merchant: {
        name: merchant.name,
        accountNo: merchant.account_no,
        merchantId: merchant.merchant_id,
      },
    });
  } catch (err) {
    console.error("Update merchant profile error:", err);
    res.status(500).json({ ok: false, error: "Could not update merchant profile" });
  }
});

export default router;
