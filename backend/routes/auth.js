import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { JWT_SECRET, JWT_EXPIRES_IN } from "../config.js";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
} from "../services/userStore.js";
import { validatePassword, PASSWORD_RULES_MESSAGE } from "../utils/validatePassword.js";
import { sendWelcomeEmail } from "../services/mailer.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

const issueToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name || "" });

// POST /auth/signup — name + email + password signup
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Email and password are required" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ ok: false, error: PASSWORD_RULES_MESSAGE });
  }

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ ok: false, error: "Account already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({
      email,
      name: name ? name.trim() : "",
      passwordHash,
      provider: "password",
    });

    const token = issueToken(user);

    // Fire-and-forget: never let a slow/broken mail provider hold up signup.
    sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
      console.error("Unexpected welcome email error:", err),
    );

    res.status(201).json({
      ok: true,
      token,
      user: publicUser(user),
      message: "Account created. We've sent you a welcome email — you're signed in already.",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ ok: false, error: "Could not create account" });
  }
});

// POST /auth/login — email + password login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: "Email and password are required" });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

    const token = issueToken(user);
    res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, error: "Could not log in" });
  }
});

// GET /auth/me — current user's basic details
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }
    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ ok: false, error: "Could not load profile" });
  }
});

// PUT /auth/me — update name, email, and/or password
router.put("/me", requireAuth, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body || {};

  try {
    const user = await findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found" });
    }

    const updates = {};

    if (typeof name === "string") {
      updates.name = name.trim();
    }

    if (typeof email === "string" && email.trim() && email.trim() !== user.email) {
      const existing = await findUserByEmail(email.trim());
      if (existing && existing.id !== user.id) {
        return res.status(409).json({ ok: false, error: "That email is already in use" });
      }
      updates.email = email.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ ok: false, error: "Current password is required to set a new password" });
      }
      const matches = await bcrypt.compare(currentPassword, user.password_hash || "");
      if (!matches) {
        return res.status(401).json({ ok: false, error: "Current password is incorrect" });
      }
      if (!validatePassword(newPassword)) {
        return res.status(400).json({ ok: false, error: PASSWORD_RULES_MESSAGE });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await updateUser(user.id, updates);

    // Keep the token's email claim in sync if the email changed.
    const token = issueToken(updated);

    res.json({ ok: true, token, user: publicUser(updated) });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ ok: false, error: "Could not update profile" });
  }
});

export default router;
