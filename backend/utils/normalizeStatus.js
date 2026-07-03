const STATUS_MAP = {
  paid: "success",
  successful: "success",
  success: "success",
  succeeded: "success",
  settled: "success",
  payment_success: "success",

  pending: "pending",
  processing: "pending",
  "in progress": "pending",
  in_progress: "pending",

  failed: "failed",
  declined: "failed",
  error: "failed",
  payment_failed: "failed",
};

export const normalizeStatus = (value) => {
  const status = `${value || ""}`.toLowerCase().trim();
  return STATUS_MAP[status] || "pending";
};
