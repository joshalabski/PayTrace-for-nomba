import express from "express";
import cors from "cors";

import { PORT } from "./config.js";
import webhookRoute from "./routes/webhook.js";
import connectRoute from "./routes/connect.js";
import paymentsRoute from "./routes/payments.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, status: "PayTrace backend ready" });
});

app.use("/nomba/webhook", webhookRoute);
app.use("/testing/connect", connectRoute);
app.use("/merchant/connect", connectRoute);
app.use("/payments", paymentsRoute);

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ ok: false, error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`PayTrace backend running on http://localhost:${PORT}`);
});
