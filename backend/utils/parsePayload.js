import { DEFAULT_CURRENCY, DEFAULT_MERCHANT_ID } from "../config.js";
import { normalizeStatus } from "./normalizeStatus.js";

const firstDefined = (...values) =>
  values.find((v) => v !== undefined && v !== null && v !== "");

// Nomba's real sandbox webhook shape looks like:
// { event_type: "payment_success", data: { merchant: {...}, transaction: {...}, order: {...} } }
// This also supports flatter test payloads like { id, customerName, amount, status, merchantId }
// so you can still POST simple test bodies with Thunder Client.
export const parseNombaPayload = (payload = {}) => {
  const data = payload.data && typeof payload.data === "object" ? payload.data : payload;
  const transaction = data.transaction || {};
  const order = data.order || {};
  const merchant = data.merchant || {};

  const status = firstDefined(
    payload.event_type,
    data.status,
    data.paymentStatus,
    payload.status,
    payload.paymentStatus,
  );

  return {
    id: firstDefined(
      transaction.transactionId,
      order.orderReference,
      order.orderId,
      data.id,
      data.reference,
      payload.id,
      payload.reference,
    ) || `pay_${Date.now()}`,

    customer: firstDefined(
      order.customerEmail,
      data.customerName,
      data.customer?.name,
      data.customer,
      payload.customerName,
      payload.customer,
    ) || "Customer",

    amount: Number(
      firstDefined(
        transaction.transactionAmount,
        order.amount,
        data.amount,
        payload.amount,
      ) || 0,
    ),

    status: normalizeStatus(status),

    currency: order.currency || data.currency || payload.currency || DEFAULT_CURRENCY,

    merchantId: firstDefined(
      merchant.userId,
      order.accountId,
      data.merchantId,
      payload.merchantId,
    ) || DEFAULT_MERCHANT_ID,

    receivedAt: new Date().toISOString(),
  };
};
