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

const METHOD_LABELS = {
  card: "POS Card Tap",
  transfer: "Bank Transfer",
  ussd: "USSD Payment",
};

export const formatMethod = (method) => METHOD_LABELS[method] || method;
