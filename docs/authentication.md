# Authentication UX/UI specification

## Scope

Green Gateway is a frontend-only authentication prototype for Positivus. It demonstrates the complete account-entry journey without creating accounts, contacting providers, sending messages, or storing personal data. Every successful action navigates to a deterministic local prototype state.

## Routes

| Route | Purpose |
| --- | --- |
| `sign-in.html` | Email/password entry, remember-me presentation, password recovery, and social providers. |
| `sign-up.html` | Name, email, strong-password guidance, consent, and social providers. |
| `forgot-password.html` | Requests a simulated password-reset link. |
| `check-email.html` | Confirms the simulated reset email and offers resend and delivery-error states. |
| `verify-email.html` | Six-digit verification-code entry, resend countdown, and expired-code state. |
| `reset-password.html` | Creates and confirms a replacement password. |
| `invalid-link.html` | Recovers from an invalid or expired reset link. |
| `password-updated.html` | Confirms a successful password update. |
| `auth-success.html` | Confirms successful account creation. |
| `social-auth.html` | Shows provider connecting, unavailable, and cancelled states. |
| `account.html` | Demonstrates the signed-in destination and sign-out navigation. |
| `terms.html` | Prototype Terms of Service copy. |
| `privacy.html` | Prototype Privacy Policy copy. |

## Core flow

```text
Sign in ────────────────┬─> Demo dashboard
  │                     └─> Social provider ─> Connecting / unavailable / cancelled
  └─> Forgot password ─> Check email ─> Reset password ─> Password updated

Create account ─> Verify email ─> Account created ─> Demo dashboard
                          └──────> Invalid or expired code
```

## Component and state definitions

- Text, email, password, and one-time-code inputs expose labels, instructions, autocomplete metadata, and inline error associations.
- Password controls support show/hide without replacing the user's entry. Password requirements update as the value changes.
- Buttons expose default, hover, focus-visible, disabled, loading, and completion feedback.
- Forms present an error summary and move focus to it after an invalid submission.
- Verification code entry supports typing, replacement, Backspace navigation, and full-code paste.
- Social authentication exposes deterministic provider-specific progress, failure, cancellation, retry, and return paths.
- Success and exceptional pages always provide a clear primary action and a safe route back to sign-in or the website.

## Internationalization and direction

English uses `lang="en"` and `dir="ltr"`; Hebrew uses `lang="he"` and `dir="rtl"`. The selected language persists through `localStorage` under the same preference used by the landing page. Layout order, text alignment, directional icons, and the promo artwork mirror in Hebrew, while the Positivus wordmark, provider marks, email addresses, passwords, and codes preserve their natural direction.

## Accessibility

- Semantic landmarks, headings, lists, forms, labels, buttons, and links are used throughout.
- Every icon-only control has an accessible name and communicates state through `aria-expanded`, `aria-pressed`, or status text where appropriate.
- Validation uses `aria-invalid`, `aria-describedby`, an error summary, and assertive live feedback.
- Informational and loading feedback uses polite live regions and is not color-only.
- Keyboard focus is visible, menus close with Escape, and one-time-code cells support predictable keyboard movement.
- Motion is minimal and disabled when the user prefers reduced motion.

## Prototype privacy boundary

The prototype never sends or persists a name, email address, password, verification code, consent choice, or provider response. Fake success states are triggered only by client-side checks. The only persisted value is the chosen interface language.

## Visual QA

The approved Green Gateway v2 board is stored at `docs/design-qa/auth-green-gateway-v2-reference.png`. English, Hebrew, desktop, mobile, success, and exceptional-state evidence and comparison boards are stored in the same directory. The detailed implementation QA report is at the repository root in `design-qa.md`.
