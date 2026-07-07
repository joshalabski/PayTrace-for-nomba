// Standard password policy:
// - at least 8 characters
// - at least one uppercase letter
// - at least one lowercase letter
// - at least one number
// This keeps things reasonably strong without being annoying for users.
export const PASSWORD_RULES_MESSAGE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.";

export const validatePassword = (password) => {
  if (typeof password !== "string") return false;
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};
