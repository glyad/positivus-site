export const minimumPasswordLength = 15;

/** Accept only the fixed, local article path used by the comment demonstration. */
export function safeReturnPath(value) {
  const path = String(value ?? "");
  return /^(?:he\/)?blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/index\.html\?commenter=demo#comments$/u.test(path) ? path : "";
}

export function isValidEmail(value) {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
}

export function passwordIssue(value) {
  if (!value) return "requiredPassword";
  if ([...value].length < minimumPasswordLength) return "shortPassword";
  return "";
}

export function confirmationIssue(password, confirmation) {
  if (!confirmation) return "requiredPassword";
  return password === confirmation ? "" : "mismatchPassword";
}

export function normalizeVerificationCode(value) {
  return value.replace(/\D/gu, "").slice(0, 6);
}

export function providerFromSearch(search) {
  const provider = new URLSearchParams(search).get("provider")?.toLowerCase();
  return ["google", "apple", "facebook"].includes(provider) ? provider : "google";
}

export function providerStateFromSearch(search) {
  const state = new URLSearchParams(search).get("state")?.toLowerCase();
  return ["error", "cancelled"].includes(state) ? state : "connecting";
}

export function formatCountdown(seconds, language = "en") {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
  const remainder = String(safeSeconds % 60).padStart(2, "0");
  const prefix = language === "he" ? "אפשר לשלוח שוב בעוד" : "Resend available in";
  return `${prefix} ${minutes}:${remainder}`;
}
