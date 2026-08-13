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

## Landing header action refinement

### Comparison target

- Source current-state crop: `docs/design-qa/header-actions-reference.png` at 846 × 240 pixels.
- Implementation: `http://127.0.0.1:4173/index.html`.
- Desktop evidence: `docs/design-qa/header-actions-desktop-en.jpg` and `docs/design-qa/header-actions-desktop-he.jpg`, captured from a 1600 × 900 CSS viewport. The in-app capture files are 1976 × 1125 pixels because the browser viewport override reports DPR 0.8; the focused action regions were cropped using CSS-aligned coordinates before comparison.
- Mobile evidence: `docs/design-qa/header-actions-mobile-en.jpg` and `docs/design-qa/header-actions-mobile-he.jpg`, captured from a 390 × 844 CSS viewport as 488 × 1054 pixel files at DPR 0.8 and normalized in the comparison board.
- States: English LTR and Hebrew RTL; desktop navigation visible; mobile navigation open with the menu control focus-visible.

### Combined evidence

- Before/English/Hebrew focused comparison: `docs/design-qa/header-actions-comparison.jpg`.
- English/Hebrew mobile comparison: `docs/design-qa/header-actions-mobile-comparison.jpg`.

The combined focused input confirms that the previous mixed treatment—standalone lime language button, underlined account link, and substantially taller quote button—has been replaced by a coherent utility pair beside a distinct conversion action. The two related utilities now share one gray outlined container, matching inset radii and equal height; the quote CTA uses the same 60px desktop rhythm while remaining separate and visually dominant.

### Findings

- No actionable P0, P1, or P2 issues remain in the refined header region.
- Fonts and typography: Space Grotesk, weight hierarchy, line height, and label scale remain consistent with the landing-page navigation. The account action now reads as a control rather than an underlined inline link.
- Spacing and layout rhythm: desktop controls share a 60px outer height, 4px inset rhythm, 12–18px radii, and balanced gaps. The tight 1120px desktop breakpoint keeps positive space between the wordmark and navigation without overflow. Mobile utilities use equal columns above the full-width CTA.
- Colors and tokens: existing lime, gray, white, near-black, border, focus, and transition tokens are reused; no new palette or elevation language was introduced.
- Image and asset quality: this region contains no image assets. The existing Positivus brand asset remains unchanged and unmirrored.
- Copy and content: English and Hebrew labels and routes remain unchanged. The target-language control stays recognizable, while the account and quote actions translate with the rest of the landing page.
- Responsiveness and RTL: desktop and mobile layouts have no root overflow. Hebrew reverses the action order and alignment naturally, while the account pair remains semantically grouped and the brand lockup preserves LTR orientation.
- Accessibility: language, sign-in, and quote remain native interactive elements with 48px-or-larger targets. Focus-visible treatment remains clearly visible, hover/active feedback is retained, and the mobile menu remains keyboard dismissible.

### Comparison history

1. The supplied current-state crop identified a P2 hierarchy and consistency issue: three adjacent actions used three unrelated heights and affordances, and the underlined sign-in link appeared visually accidental.
   - Fix: grouped language and sign-in as related utilities with equal inset controls, removed the persistent text underline, and normalized the desktop quote CTA to the same 60px outer rhythm.
   - Post-fix evidence: `docs/design-qa/header-actions-comparison.jpg` shows the calmer English and mirrored Hebrew clusters.
2. Tight-breakpoint review found a P2 density issue at the 1120px desktop threshold: the new group left too little space between the wordmark and first navigation item.
   - Fix: reduced intermediate navigation gaps, label size, and horizontal control padding only between 1120px and 1290px.
   - Post-fix evidence: the 1120 × 900 browser check reports no overflow or overlap and retains a positive brand-to-navigation gap.
3. Mobile review found no remaining P0/P1/P2 issues after the controls were placed in equal columns above the full-width quote CTA. Focus-visible, English, Hebrew, and RTL states remain legible and balanced.

final result: passed
