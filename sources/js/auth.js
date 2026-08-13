import {
  confirmationIssue,
  formatCountdown,
  isValidEmail,
  normalizeVerificationCode,
  passwordIssue,
  providerFromSearch,
  providerStateFromSearch
} from "./auth-core.mjs";
import { authPages, authText } from "./auth-content.mjs";

const html = document.documentElement;
const body = document.body;
const page = authPages.find((entry) => entry.page === body.dataset.authPage);
const languageToggles = [...document.querySelectorAll("[data-language-toggle]")];
let currentLanguage = "en";

const t = (key) => authText[key]?.[currentLanguage] ?? key;

function translatePage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (authText[key]) element.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (authText[key]) element.setAttribute("placeholder", t(key));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.dataset.i18nAriaLabel;
    if (authText[key]) element.setAttribute("aria-label", t(key));
  });

  document.querySelectorAll("[data-message-key]").forEach((element) => {
    element.textContent = t(element.dataset.messageKey);
  });

  document.querySelectorAll("[data-resend-countdown][data-seconds]").forEach((element) => {
    element.textContent = formatCountdown(Number(element.dataset.seconds), currentLanguage);
  });

  const currentLanguageLabel = document.querySelector("[data-language-current]");
  if (currentLanguageLabel) {
    currentLanguageLabel.textContent = currentLanguage === "he" ? "עברית" : "English";
  }

  languageToggles.forEach((toggle) => {
    toggle.textContent = currentLanguage === "he" ? "English" : "עברית";
    toggle.lang = currentLanguage === "he" ? "en" : "he";
    toggle.setAttribute(
      "aria-label",
      currentLanguage === "he" ? "מעבר לאנגלית" : "Switch to Hebrew"
    );
  });

  const description = document.querySelector("[data-auth-description]");
  description?.setAttribute(
    "content",
    currentLanguage === "he"
      ? "הדגמת ממשק התחברות של Positivus בלבד. לא נוצרים חשבונות ולא נשמרים נתונים אישיים."
      : "A UI-only Positivus authentication demonstration. No account or personal data is stored."
  );

  document.title = `${page ? t(page.titleKey) : "Authentication"} — Positivus`;
}

function applyLanguage(language, { persist = true } = {}) {
  currentLanguage = language === "he" ? "he" : "en";
  html.lang = currentLanguage;
  html.dir = currentLanguage === "he" ? "rtl" : "ltr";
  html.dataset.language = currentLanguage;
  translatePage();

  if (persist) {
    try {
      localStorage.setItem("positivus-language", currentLanguage);
    } catch {
      // The interface still switches when browser storage is unavailable.
    }
  }

  document.dispatchEvent(
    new CustomEvent("positivus:languagechange", { detail: { language: currentLanguage } })
  );
}

let savedLanguage = "en";
try {
  savedLanguage = localStorage.getItem("positivus-language") === "he" ? "he" : "en";
} catch {
  savedLanguage = "en";
}

languageToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    applyLanguage(currentLanguage === "en" ? "he" : "en");
  });
});

applyLanguage(savedLanguage, { persist: false });

const menuToggle = document.querySelector("[data-auth-menu-toggle]");
const mobileMenu = document.querySelector("[data-auth-mobile-menu]");

function setMenuOpen(open) {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", t(open ? "closeMenu" : "openMenu"));
  menuToggle.dataset.i18nAriaLabel = open ? "closeMenu" : "openMenu";
  mobileMenu.hidden = !open;
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

document.addEventListener("positivus:languagechange", () => {
  setMenuOpen(menuToggle?.getAttribute("aria-expanded") === "true");
});

document.querySelectorAll("[data-password-toggle]").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const wrap = toggle.closest(".auth-control-wrap");
    const input = wrap?.querySelector("input");
    const icon = toggle.querySelector(".auth-icon");
    if (!input || !icon) return;

    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    toggle.dataset.i18nAriaLabel = showing ? "showPassword" : "hidePassword";
    toggle.setAttribute("aria-label", t(showing ? "showPassword" : "hidePassword"));
    toggle.setAttribute("aria-pressed", String(!showing));
    icon.classList.toggle("auth-icon--eye", showing);
    icon.classList.toggle("auth-icon--eye-slash", !showing);
  });
});

function setMessage(element, key = "") {
  if (!element) return;
  if (key) {
    element.dataset.messageKey = key;
    element.textContent = t(key);
  } else {
    delete element.dataset.messageKey;
    element.textContent = "";
  }
}

function setFieldError(form, name, key = "") {
  const field = form.querySelector(`[data-field="${name}"]`);
  const input = form.elements[name];
  const error = form.querySelector(`[data-error-for="${name}"]`);
  const invalid = Boolean(key);
  field?.classList.toggle("is-invalid", invalid);
  input?.setAttribute("aria-invalid", String(invalid));
  setMessage(error, key);
}

function validateForm(form) {
  const type = form.dataset.authForm;
  const issues = [];
  const value = (name) => form.elements[name]?.value ?? "";
  const issue = (name, key) => {
    setFieldError(form, name, key);
    if (key) issues.push(name);
  };

  if (["sign-in", "sign-up", "forgot-password"].includes(type)) {
    issue("email", isValidEmail(value("email")) ? "" : "invalidEmail");
  }

  if (type === "sign-in") {
    issue("password", value("password") ? "" : "requiredPassword");
  }

  if (type === "sign-up") {
    issue("fullName", value("fullName").trim().length >= 2 ? "" : "requiredName");
    issue("password", passwordIssue(value("password")));
    issue(
      "confirmPassword",
      confirmationIssue(value("password"), value("confirmPassword"))
    );
    issue("consent", form.elements.consent.checked ? "" : "requiredConsent");
  }

  if (type === "verify-email") {
    const code = normalizeVerificationCode(value("verificationCode"));
    issue("verificationCode", code.length === 6 ? "" : "invalidCode");
    if (code.length === 6 && code !== "123456") {
      issue("verificationCode", "incorrectCode");
    }
  }

  if (type === "reset-password") {
    issue("password", passwordIssue(value("password")));
    issue(
      "confirmPassword",
      confirmationIssue(value("password"), value("confirmPassword"))
    );
  }

  return issues;
}

const formTargets = {
  "sign-in": "account.html",
  "sign-up": "verify-email.html",
  "forgot-password": "check-email.html",
  "verify-email": "auth-success.html",
  "reset-password": "password-updated.html"
};

document.querySelectorAll("[data-auth-form]").forEach((form) => {
  form.addEventListener("input", (event) => {
    const name = event.target.name;
    if (name) setFieldError(form, name);
    setMessage(form.querySelector("[data-form-status]"));
  });

  form.addEventListener("change", (event) => {
    const name = event.target.name;
    if (name) setFieldError(form, name);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-form-status]");
    const issues = validateForm(form);

    if (!issues.length && form.dataset.authForm === "sign-in") {
      const email = form.elements.email.value.trim().toLowerCase();
      if (email === "error@example.com") {
        setMessage(status, "invalidCredentials");
        status.classList.add("is-error");
        form.elements.email.focus();
        return;
      }
    }

    if (issues.length) {
      setMessage(status, "fixErrors");
      status.classList.add("is-error");
      form.elements[issues[0]]?.focus();
      return;
    }

    status.classList.remove("is-error");
    setMessage(status, "submitting");
    form.setAttribute("aria-busy", "true");
    const submit = form.querySelector("[data-submit]");
    if (submit) {
      submit.disabled = true;
      submit.classList.add("is-loading");
    }

    window.setTimeout(() => {
      window.location.assign(formTargets[form.dataset.authForm]);
    }, 550);
  });
});

const otpInput = document.querySelector("[data-otp-input]");
const otpShell = document.querySelector("[data-otp-shell]");

function renderOtp() {
  if (!otpInput || !otpShell) return;
  const value = normalizeVerificationCode(otpInput.value);
  otpInput.value = value;
  otpShell.querySelectorAll(".auth-otp__cells span").forEach((cell, index) => {
    cell.textContent = value[index] ?? "";
    cell.classList.toggle("is-filled", Boolean(value[index]));
  });
}

otpInput?.addEventListener("input", renderOtp);
otpInput?.addEventListener("focus", () => otpShell?.classList.add("is-focused"));
otpInput?.addEventListener("blur", () => otpShell?.classList.remove("is-focused"));
renderOtp();

document.querySelectorAll("[data-resend]").forEach((button) => {
  const wrapper = button.closest(".auth-resend");
  const countdown = wrapper?.querySelector("[data-resend-countdown]");
  const status = wrapper?.querySelector("[data-resend-status]");
  const initialSeconds = Number(button.dataset.countdown) || 45;
  let timerId;

  const startCountdown = () => {
    window.clearInterval(timerId);
    let seconds = initialSeconds;
    button.disabled = true;

    const update = () => {
      if (countdown) {
        countdown.dataset.seconds = String(seconds);
        countdown.textContent = formatCountdown(seconds, currentLanguage);
      }

      if (seconds <= 0) {
        window.clearInterval(timerId);
        button.disabled = false;
        if (countdown) {
          delete countdown.dataset.seconds;
          countdown.textContent = "";
        }
        return;
      }
      seconds -= 1;
    };

    update();
    timerId = window.setInterval(update, 1000);
  };

  button.addEventListener("click", () => {
    setMessage(status, "emailResent");
    startCountdown();
  });

  startCountdown();
});

const exceptionalState = new URLSearchParams(window.location.search).get("state");

if (page?.page === "verify-email" && exceptionalState === "expired") {
  const form = document.querySelector('[data-auth-form="verify-email"]');
  if (form) {
    setFieldError(form, "verificationCode", "expiredCode");
  }
}

if (page?.page === "check-email" && exceptionalState === "delivery-error") {
  const status = document.querySelector("[data-resend-status]");
  setMessage(status, "emailDeliveryFailed");
  status?.classList.add("is-error");
}

const providerView = document.querySelector("[data-provider-view]");
const providerError = document.querySelector("[data-provider-error]");

if (providerView && providerError) {
  const provider = providerFromSearch(window.location.search);
  const state = providerStateFromSearch(window.location.search);
  const providerName = `${provider[0].toUpperCase()}${provider.slice(1)}`;
  const providerIcon = document.querySelector("[data-provider-icon]");
  const actions = document.querySelector("[data-provider-actions]");

  if (providerIcon) {
    providerIcon.src = `assets/icons/auth/${provider}.svg`;
  }

  document.querySelectorAll(".auth-demo-states a").forEach((link) => {
    const url = new URL(link.href);
    url.searchParams.set("provider", provider);
    link.href = `${url.pathname.split("/").pop()}${url.search}`;
  });

  const retry = providerError.querySelector(".auth-submit");
  if (retry) retry.href = `social-auth.html?provider=${provider}`;

  const updateProviderHeading = () => {
    const heading = document.querySelector("#page-title");
    if (!heading) return;

    if (state === "connecting") {
      heading.removeAttribute("data-i18n");
      heading.textContent =
        currentLanguage === "he" ? `מתחברים אל ${providerName}` : `Connecting to ${providerName}`;
      document.title = `${heading.textContent} — Positivus`;
      return;
    }

    const titleKey = state === "cancelled" ? "providerCancelled" : "providerUnavailable";
    heading.dataset.i18n = titleKey;
    heading.textContent = t(titleKey);
    document.title = `${t(titleKey)} — Positivus`;
  };

  updateProviderHeading();
  document.addEventListener("positivus:languagechange", updateProviderHeading);

  if (state === "connecting") {

    window.setTimeout(() => {
      providerView.classList.add("is-ready");
      if (actions) actions.hidden = false;
    }, 850);
  } else {
    providerView.hidden = true;
    providerError.hidden = false;
    const bodyKey =
      state === "cancelled" ? "providerCancelledBody" : "providerUnavailableBody";
    const errorBody = providerError.querySelector("[data-provider-error-body]");
    if (errorBody) {
      errorBody.dataset.i18n = bodyKey;
      errorBody.textContent = t(bodyKey);
    }
  }
}

body.dataset.authReady = "true";
