# PayTrace backend

This backend exposes a small webhook endpoint that can be used with Nomba-style payment events.

## Endpoints

- GET /health -> health check
- POST /nomba/webhook -> receives payment updates from Nomba
- GET/POST /testing/connect -> returns a sandbox-friendly webhook URL for testing
- GET/POST /merchant/connect -> returns a webhook URL to register in the Nomba merchant dashboard
- GET /payments -> returns all captured payments

## Auth & account endpoints

- POST /auth/signup -> { name, email, password } — creates an account, sends a welcome email, and signs the user in immediately (returns a JWT)
- POST /auth/login -> { email, password } — returns a JWT
- GET /auth/me -> current user's name/email (requires Authorization: Bearer <token>)
- PUT /auth/me -> update { name, email, currentPassword, newPassword } (all optional; currentPassword required only when setting newPassword)
- GET /merchant/profile -> the logged-in user's linked merchant account details
- PUT /merchant/profile -> { name, accountNo, merchantId } to link/update the merchant account

## Environment variables

Add these to a `.env` file in `backend/` (see `.gitignore` — this file is not committed):

```
PORT=4000
JWT_SECRET=replace_with_a_long_random_string
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...

# Optional - only needed to actually send the "welcome, you can sign in now" email.
# If left unset, signup still works, the email is just skipped (a warning is logged instead).
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_smtp_password_or_api_key
MAIL_FROM="PayTrace <no-reply@yourdomain.com>"
```

Any standard SMTP provider works here (SendGrid, Mailgun, Gmail app passwords, Amazon SES SMTP, etc.) — just plug in its host/port/user/pass.

## Database

The `users` table needs a `name` column (text, nullable) alongside the existing `email`, `password_hash`, `provider`, `created_at` columns — see `backend/services/userStore.js` for the full expected schema. If you're on Supabase, run:

```sql
alter table users add column if not exists name text;
```

## Setup

1. Install dependencies:
   npm install
2. Start the backend:
   npm start
3. In the Nomba sandbox or merchant dashboard, register the webhook URL shown by /testing/connect or /merchant/connect.
4. Send a payment event to /nomba/webhook or trigger a test payment from Nomba.
5. The backend is already set up to accept common sandbox payload fields such as paymentId, transactionReference, amount, status, and merchantId.

Example webhook body:
{
"id": "pay_001",
"customerName": "Adaeze",
"amount": 250000,
"status": "paid",
"merchantId": "NMB-18014"
}
