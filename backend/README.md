# PayTrace backend

This backend exposes a small webhook endpoint that can be used with Nomba-style payment events.

## Endpoints

- GET /health -> health check
- POST /nomba/webhook -> receives payment updates from Nomba
- POST /merchant/connect -> returns a webhook URL to register in the Nomba merchant dashboard
- GET /payments -> returns all captured payments

## Setup

1. Install dependencies:
   npm install
2. Start the backend:
   npm start
3. In the Nomba merchant dashboard, register the webhook URL shown by /merchant/connect.
4. Send a payment event to /nomba/webhook or trigger a test payment from Nomba.

Example webhook body:
{
"id": "pay_001",
"customerName": "Adaeze",
"amount": 250000,
"status": "paid",
"merchantId": "NMB-18014"
}
