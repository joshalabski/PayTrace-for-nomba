export const merchant = {
  name: "Adaeze's Stores",
  email: "adaeze@paytrace.test",
  merchantId: "NMB-18014",
  business: "Adaeze's Stores",
};

export const transactions = [
  {
    id: "TX1001",
    customer: "Chidi A.",
    method: "card",
    status: "success",
    amount: 128500,
    date: "2026-07-03T10:15:00",
  },
  {
    id: "TX1002",
    customer: "Amara B.",
    method: "transfer",
    status: "pending",
    amount: 84500,
    date: "2026-07-03T09:45:00",
  },
  {
    id: "TX1003",
    customer: "Tunde O.",
    method: "ussd",
    status: "failed",
    amount: 25000,
    date: "2026-07-03T08:30:00",
  },
  {
    id: "TX1004",
    customer: "Ngozi C.",
    method: "card",
    status: "success",
    amount: 64000,
    date: "2026-07-03T07:20:00",
  },
  {
    id: "TX1005",
    customer: "Emeka D.",
    method: "transfer",
    status: "success",
    amount: 92000,
    date: "2026-07-03T06:10:00",
  },
];

export const disputes = [
  {
    id: "DSP-01",
    customer: "Tunde O.",
    amount: 25000,
    reason: "Payment amount did not match the POS display.",
    status: "In progress",
  },
  {
    id: "DSP-02",
    customer: "Bola K.",
    amount: 18000,
    reason: "Customer reported the transfer never landed.",
    status: "Awaiting review",
  },
];

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
