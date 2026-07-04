# PayTrace backend

This backend exposes a small webhook endpoint that can be used with Nomba-style payment events.

## Endpoints

- GET /health -> health check
- POST /nomba/webhook -> receives payment updates from Nomba
- GET/POST /testing/connect -> returns a sandbox-friendly webhook URL for testing
- GET/POST /merchant/connect -> returns a webhook URL to register in the Nomba merchant dashboard
- GET /payments -> returns all captured payments

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
