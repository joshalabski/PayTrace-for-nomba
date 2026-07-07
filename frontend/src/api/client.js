import { authFetch } from "./auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export const getMerchantProfile = async () => {
  const response = await authFetch("/merchant/profile");
  if (!response.ok) throw new Error("Failed to load merchant profile");
  const data = await response.json();
  return data.merchant;
};

// Links (or updates) the Nomba merchant account so payments show up on the dashboard.
export const updateMerchantProfile = async ({ name, accountNo, merchantId }) => {
  const response = await authFetch("/merchant/profile", {
    method: "PUT",
    body: JSON.stringify({ name, accountNo, merchantId }),
  });
  const data = await response.json();
  if (!response.ok || !data.ok) throw new Error(data.error || "Failed to link merchant account");
  return data.merchant;
};

export const checkHealth = async () => {
  const response = await fetch(`${BACKEND_URL}/health`);
  if (!response.ok) throw new Error("Backend not reachable");
  return response.json();
};

export const getPayments = async () => {
  const response = await fetch(`${BACKEND_URL}/payments`);
  if (!response.ok) throw new Error("Failed to load payments");
  return response.json();
};

// Normalizes a raw backend payment into the shape the UI expects.
export const toTransaction = (payment) => ({
  id: payment.id || `nomba-${payment.receivedAt || Date.now()}`,
  customer: payment.customer || "Nomba customer",
  method: payment.method || "card",
  status:
    payment.status === "success"
      ? "success"
      : payment.status === "failed"
        ? "failed"
        : "pending",
  amount: Number(payment.amount || 0),
  date: payment.receivedAt || new Date().toISOString(),
});
