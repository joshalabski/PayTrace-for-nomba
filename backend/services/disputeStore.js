// In-memory store. Swap for Supabase/Postgres when disputes need to persist.
const disputes = [];

export const getDisputes = () => disputes;

export const findDisputeByPaymentId = (paymentId) =>
  disputes.find((d) => d.paymentId === paymentId);

export const addDispute = ({ paymentId, customer, amount, reason }) => {
  const dispute = {
    id: `disp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    paymentId,
    customer,
    amount,
    reason,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  disputes.unshift(dispute);
  return dispute;
};

export const resolveDispute = (id) => {
  const dispute = disputes.find((d) => d.id === id);
  if (!dispute) return null;
  dispute.status = "resolved";
  dispute.resolvedAt = new Date().toISOString();
  return dispute;
};
