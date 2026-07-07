import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
  FRONTEND_URL,
} from "../config.js";

// If SMTP isn't configured, we don't want signup/login to break -
// we just log a warning and skip sending. This makes local dev painless
// while still sending real emails once SMTP_* env vars are set in production.
const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;
if (isConfigured) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export const sendWelcomeEmail = async ({ to, name }) => {
  if (!isConfigured) {
    console.warn(
      `[mailer] SMTP is not configured — skipping welcome email to ${to}. ` +
        "Set SMTP_HOST, SMTP_USER, SMTP_PASS in the backend .env to enable real emails.",
    );
    return { sent: false, reason: "not_configured" };
  }

  const loginUrl = `${FRONTEND_URL}/login`;
  const displayName = name || "there";

  try {
    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to,
      subject: "Welcome to PayTrace — your account is ready",
      text:
        `Hi ${displayName},\n\n` +
        `Your PayTrace account has been created successfully.\n\n` +
        `You can sign in now at: ${loginUrl}\n\n` +
        `If you didn't create this account, you can safely ignore this email.\n\n` +
        `— The PayTrace team`,
      html:
        `<p>Hi ${displayName},</p>` +
        `<p>Your PayTrace account has been created successfully.</p>` +
        `<p><a href="${loginUrl}">Click here to sign in</a> and start tracking your payments.</p>` +
        `<p style="color:#888;font-size:12px;margin-top:24px;">If you didn't create this account, you can safely ignore this email.</p>`,
    });
    return { sent: true };
  } catch (err) {
    // Never let an email failure block signup - just log it.
    console.error("[mailer] Failed to send welcome email:", err.message);
    return { sent: false, reason: "send_failed" };
  }
};
