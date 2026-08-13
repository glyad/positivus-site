import assert from "node:assert/strict";
import test from "node:test";

import {
  confirmationIssue,
  formatCountdown,
  isValidEmail,
  normalizeVerificationCode,
  passwordIssue,
  providerFromSearch,
  providerStateFromSearch
} from "../sources/js/auth-core.mjs";

test("email validation accepts normal addresses and rejects malformed input", () => {
  assert.equal(isValidEmail("name@company.com"), true);
  assert.equal(isValidEmail(" name+demo@company.co.il "), true);
  assert.equal(isValidEmail("name@company"), false);
  assert.equal(isValidEmail("name company@example.com"), false);
});

test("password guidance enforces length without composition rules", () => {
  assert.equal(passwordIssue(""), "requiredPassword");
  assert.equal(passwordIssue("short password"), "shortPassword");
  assert.equal(passwordIssue("a long passphrase with spaces"), "");
  assert.equal(passwordIssue("סיסמה ארוכה ובטוחה מאוד"), "");
});

test("password confirmation must be present and equal", () => {
  assert.equal(confirmationIssue("a long passphrase", ""), "requiredPassword");
  assert.equal(confirmationIssue("a long passphrase", "different"), "mismatchPassword");
  assert.equal(confirmationIssue("a long passphrase", "a long passphrase"), "");
});

test("verification codes normalize paste input", () => {
  assert.equal(normalizeVerificationCode("12 34-56"), "123456");
  assert.equal(normalizeVerificationCode("123456789"), "123456");
  assert.equal(normalizeVerificationCode("abc"), "");
});

test("social provider and state parameters use safe allowlists", () => {
  assert.equal(providerFromSearch("?provider=apple"), "apple");
  assert.equal(providerFromSearch("?provider=unknown"), "google");
  assert.equal(providerStateFromSearch("?state=cancelled"), "cancelled");
  assert.equal(providerStateFromSearch("?state=success"), "connecting");
});

test("countdowns are localized and never become negative", () => {
  assert.equal(formatCountdown(45, "en"), "Resend available in 00:45");
  assert.equal(formatCountdown(-1, "he"), "אפשר לשלוח שוב בעוד 00:00");
});
