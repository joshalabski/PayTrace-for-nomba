// In-memory store. Swap for Supabase/Postgres when disputes need to persist.
const disputes = [];

export const getDisputes = () => disputes;

export const addDispute = (dispute) => {
  disputes.unshift(dispute);
  return dispute;
};
