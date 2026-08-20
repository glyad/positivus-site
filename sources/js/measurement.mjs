const TOKEN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

/** Create the complete vendor-neutral measurement payload. Extra input is ignored. */
export function createInteractionDetail({ action, locale, contentType, contentId } = {}) {
  if (!TOKEN.test(action ?? "")) throw new TypeError("action must be a non-personal token");
  if (!/^(?:en|he)$/u.test(locale ?? "")) throw new TypeError("locale must be en or he");
  if (!TOKEN.test(contentType ?? "")) throw new TypeError("contentType must be a non-personal token");
  if (!TOKEN.test(contentId ?? "")) throw new TypeError("contentId must be a non-personal content ID");
  return Object.freeze({ action, locale, contentType, contentId });
}

/** Dispatch one in-page hook. This module intentionally has no transport or SDK. */
export function dispatchInteraction(target, input) {
  try {
    const detail = createInteractionDetail(input);
    target.dispatchEvent(new CustomEvent("positivus:interaction", { detail }));
    return true;
  } catch {
    return false;
  }
}
