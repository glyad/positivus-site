# Authentication design QA

## Comparison target

- Source visual truth: `docs/design-qa/auth-green-gateway-v2-reference.png`.
- Implementation: `http://127.0.0.1:4173/sign-up.html` and the related generated authentication routes.
- Source pixels: 1586 × 992 at 1×.
- CSS viewports: 1440 × 1024 for desktop and 390 × 844 for mobile.
- Captured pixels: the in-app browser normalized the DPR 2 desktop and mobile captures to 1425 × 1013 and 375 × 812 after excluding browser scrollbars. State-only screenshots were captured at the requested 1440 × 1024 and 390 × 844 output sizes.
- States: English LTR and Hebrew RTL; sign-in, create-account, verification, password recovery, provider progress/failure/cancellation, success, expired-link, validation-error, legal, and demo-dashboard views.

## Full-view comparison evidence

- Desktop design and implementation: `docs/design-qa/auth-desktop-comparison.jpg`.
- English and Hebrew mirrored layouts: `docs/design-qa/auth-rtl-comparison.jpg`.
- Mobile design and implementation: `docs/design-qa/auth-mobile-comparison.jpg`.
- Success and exceptional states in both directions: `docs/design-qa/auth-state-comparison.jpg`.

The comparison boards were generated from the approved visual and browser captures, then inspected as combined inputs. They confirm the same Green Gateway composition, lime/black/white palette, Space Grotesk hierarchy, compact outlined controls, dark primary actions, left-side promotional panel in English, mirrored right-side panel in Hebrew, and the same responsive card language.

## Focused evidence

- English desktop account creation: `docs/design-qa/auth-sign-up-desktop-en.jpg`.
- Hebrew desktop account creation: `docs/design-qa/auth-sign-up-desktop-he.jpg`.
- English mobile sign-in: `docs/design-qa/auth-sign-in-mobile-en.jpg`.
- Hebrew mobile account creation: `docs/design-qa/auth-sign-up-mobile-he.jpg`.
- English desktop success and error: `docs/design-qa/auth-success-desktop-en.jpg`, `docs/design-qa/auth-error-desktop-en.jpg`.
- Hebrew mobile success and error: `docs/design-qa/auth-success-mobile-he.jpg`, `docs/design-qa/auth-error-mobile-he.jpg`.

## Findings

- No actionable P0, P1, or P2 visual, interaction, accessibility, or responsive differences remain.
- Layout: the authentication surface and promotional panel preserve the source proportions on desktop and collapse to a focused, single-column flow on mobile. Hebrew reverses the macro layout while preserving the direction of the Positivus lockup, social marks, email addresses, passwords, and verification codes.
- Typography: Space Grotesk is used for Latin copy and the existing Hebrew system stack for complete glyph coverage. Heading, field-label, help-text, and button hierarchy match the approved board.
- Tokens: the authentication palette, borders, dividers, muted copy, focus, success, error, disabled, radii, and control dimensions are reusable CSS custom properties or shared component rules.
- Assets: the existing Positivus artwork supplies the promotional illustration. Bootstrap Icons and Simple Icons provide external icon assets; no emoji, placeholder art, CSS drawings, or inline SVG approximations are used.
- Responsiveness: all routes were checked at desktop and mobile widths without root-level horizontal overflow, clipped actions, or overlapping content. The account-creation view intentionally scrolls on short viewports so labels and controls retain readable sizing and accessible targets instead of being compressed to the presentation-board scale.
- Accessibility: landmarks, labels, descriptions, autocomplete metadata, focus-visible treatment, error summaries, live feedback, password toggles, Escape-to-close navigation, reduced-motion handling, and keyboard/paste behavior for the verification code are present.
- Privacy: the prototype stores only the selected language. It never stores or transmits entered names, email addresses, passwords, codes, consent choices, or provider responses.
- Remaining P3: the Google mark uses the nearest vendored Simple Icons asset and is monochrome rather than the multicolor presentation-board mark.

## Comparison history

1. The first interaction pass found a P1 local-preview defect: JavaScript modules with the `.mjs` extension were returned without the correct MIME type, leaving the authentication experience non-interactive.
   - Fix: added the JavaScript MIME mapping in `scripts/serve.mjs`.
   - Result: every page reports its ready state, form navigation works, and browser console errors and warnings are empty.
2. State review found a P2 content mismatch in the social-provider failure view: it retained the connecting heading after failure.
   - Fix: added state-specific headings and bilingual live updates in `sources/js/auth.js`.
   - Result: connecting, unavailable, and cancelled states now communicate the correct provider and outcome.
3. Journey coverage found P2 gaps for a failed email delivery and an expired verification code.
   - Fix: added deterministic `state=delivery-error` and `state=expired` views with retry paths.
   - Result: both exceptional states render in English and Hebrew and return safely to the expected flow.
4. RTL content review found a P2 consent-copy mismatch caused by composing Hebrew fragments around linked legal text.
   - Fix: supplied an exact language-specific visible sentence while preserving separate accessible legal links.
   - Result: the Hebrew account-creation agreement reads naturally and remains keyboard operable.
5. Final default-viewport inspection found a P1 illustration distortion: the promotional artwork retained its authored HTML height after CSS reduced its width, stretching it vertically into the subtitle.
   - Fix: allowed `.auth-promo__art` to derive its height from the source asset's intrinsic aspect ratio.
   - Result: the artwork keeps its original proportions and clears the copy at both the 1280 × 720 default viewport and the 1440 × 1024 desktop comparison viewport.
6. Accessibility review found a P2 language-control mismatch: its accessible action name was voiced in the target language rather than the page's current language.
   - Fix: aligned the authentication control with the landing page, using “Switch to Hebrew” on English pages and “מעבר לאנגלית” on Hebrew pages.
   - Result: the visible target-language name remains recognizable while the assistive label follows the active document language.
7. Accessibility review found P2 untranslated group names for social sign-in and password guidance.
   - Fix: added complete English/Hebrew accessible names to both component groups.
   - Result: grouped provider actions and password requirements are announced in the current document language.
8. Bilingual copy review found a P2 untranslated, assistive-hidden value line in the promotional panel.
   - Fix: added natural Hebrew copy for “Secure • Simple • Positive” and exposed the meaningful line to assistive technology.
   - Result: all app-owned visible promotional copy now follows the selected language.
9. Final combined desktop, RTL, mobile, and state comparisons found no remaining P0/P1/P2 issues.

## Primary interactions tested

- Sign-in and account-creation validation, including focus movement to the error summary.
- Password show/hide and live strong-password requirements.
- Fake account creation through email verification and the success destination.
- Six-digit code typing, full-code paste, Backspace navigation, resend countdown, and expired-code recovery.
- Forgot-password, check-email, reset-password, invalid-link, and password-updated paths.
- Google, Apple, and Facebook progress, failure, cancellation, retry, and return navigation.
- Mobile navigation open/close and Escape behavior.
- English/Hebrew switching, persistence, document metadata, and layout direction.
- All 13 generated authentication routes, local assets, template resolution, and entry-point manifest records.
- Browser console errors/warnings: none.

final result: passed
