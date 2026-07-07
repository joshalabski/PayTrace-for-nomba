import "dotenv/config";

export const PORT = process.env.PORT || 4000;
export const DEFAULT_MERCHANT_ID = process.env.DEFAULT_MERCHANT_ID || "NMB-18014";
export const DEFAULT_CURRENCY = "NGN";

export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export const JWT_SECRET = process.env.JWT_SECRET || "dev_only_change_this_secret";
export const JWT_EXPIRES_IN = "7d";

// Used to build the "sign in" link inside the welcome email.
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// SMTP settings for the welcome email sent after signup.
// If these are left unset, the backend just logs a warning and skips sending -
// signup itself still works.
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT || 587;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const MAIL_FROM = process.env.MAIL_FROM || "PayTrace <no-reply@paytrace.app>";
