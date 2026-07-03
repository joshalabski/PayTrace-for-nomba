// In-memory store. Swap this for a real DB later — everything here
// resets when the server restarts.
const payments = [];

export const addPayment = (payment) => {
  payments.unshift(payment); // newest first
  return payment;
};

export const getPayments = () => payments;
