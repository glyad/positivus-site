# Product roadmap

This roadmap records planned user-facing and platform work for Positivus. It is
maintained directly on `develop` so that every branch derived from `develop`
starts with the latest product direction.

The order below is intentional, but target releases may change as work is
reviewed. A roadmap item is complete only after it has passed the repository's
required checks and reached `main` through the regular release flow.

## Product principles

- Preserve the Positivus design language: high contrast, electric lime accents,
  Space Grotesk typography, generous whitespace, rounded outlined surfaces, and
  playful external artwork.
- Keep English LTR and Hebrew RTL behavior equivalent across every page, state,
  and viewport.
- Keep the public frontend dependency-free, except for approved icon assets.
- Prefer semantic HTML, progressive enhancement, keyboard access, and clear
  error recovery.
- Do not imply that prototype-only features provide production security,
  storage, or third-party integrations.

## Released foundation

### Positivus landing page — `v1.0.0`

- Responsive landing page closely matching the original community Figma file.
- English LTR and Hebrew RTL content and layout switching.
- Responsive navigation, service cards, process accordion, team expansion,
  testimonial carousel, contact form, and newsletter form.
- Static build, validation, packaging, CI, CodeQL, Dependabot, and tagged GitHub
  Release automation.

## Released: authentication UI — `v1.1.0`

Build a frontend-only authentication journey based on the approved **Green
Gateway** direction. The feature will use separate pages, deterministic fake
navigation, and no backend, account creation, provider SDK, or credential
storage.

### Pages and views

- Sign in.
- Create account.
- Forgot password.
- Check email after a recovery request.
- Verify email with a six-digit visual code entry.
- Reset password.
- Password updated confirmation.
- Account created and verified confirmation.
- Neutral social-auth transition for Google, Apple, and Facebook.
- Lightweight authenticated-demo destination.
- Prototype Terms and Privacy pages, clearly marked for legal review.

### Components

- Shared authentication shell and responsive promotional artwork panel.
- Positivus header, back-to-site action, auth navigation, and language switch.
- Text, email, password, confirmation, and verification-code fields.
- Password visibility control, checkbox, and terms consent.
- Primary, secondary, text, and social-provider buttons.
- Field help, inline validation, page-level alerts, and live status messages.
- Password guidance, divider, resend action with countdown, and demo-data notice.
- Informational, warning, failure, and success illustrations.

### Required interaction states

- Empty, hover, focus-visible, filled, valid, invalid, disabled, and loading.
- Invalid sign-in, invalid email, password mismatch, missing consent, and weak or
  rejected password.
- Recovery request submitted with privacy-preserving generic messaging.
- Verification code incomplete, invalid, expired, resent, and temporarily
  unavailable.
- Reset link invalid or expired.
- Social provider connecting, cancelled, unavailable, retrying, and successful.
- Successful account creation, email verification, sign-in, and password reset.

### Accessibility and security-oriented UX

- Use visible labels, programmatic descriptions, actionable errors, logical
  heading order, landmarks, and status announcements.
- Preserve a predictable keyboard order, visible focus, and sufficiently large
  pointer targets.
- Support password managers, autofill, copying, and pasting; never intercept or
  disable these browser features.
- Use the standard `name`, `email`, `current-password`, `new-password`, and
  `one-time-code` autocomplete purposes.
- Represent the six-digit verification UI with one paste- and autofill-friendly
  input while preserving the approved segmented appearance.
- Use a minimum of 15 characters for single-factor passwords, allow long
  passphrases and Unicode, and avoid arbitrary uppercase, number, or symbol
  composition rules.
- Use generic sign-in, registration, and recovery responses where specific copy
  could reveal whether an account exists.
- Store only the selected language. Never store, log, or place entered names,
  email addresses, passwords, or verification codes in a URL.
- Provide reduced-motion behavior and maintain readable zoom/reflow at narrow
  viewports.

### Responsive and bidirectional behavior

- Cover wide desktop, intermediate, and compact mobile layouts.
- Provide complete English LTR and Hebrew RTL translations for every visible,
  validation, status, and accessible string.
- Use logical layout properties and mirror directional composition, navigation,
  and artwork where meaning requires it.
- Never mirror the Positivus logo or social-provider brand marks.

### Acceptance criteria

- Every route and primary action works without network or backend dependencies.
- All required states can be reached deterministically for review and tests.
- The interface clearly says that authentication is a demonstration and no data
  is stored.
- English and Hebrew flows have equivalent content and behavior.
- Automated checks cover routing, validation, localization completeness,
  direction changes, and build output.
- Visual QA covers desktop and mobile success and error paths in both directions.

## Planned: multilingual blog — `v1.2.0`

Build a CMS-driven, read-only editorial knowledge hub for business owners,
marketing leads, practitioners, and specialists. The public article content is
static and dependency-free; a clearly labelled comment composer remains a
non-persistent UI prototype until production authentication and community
safeguards exist.

### Information architecture

- Blog home with editorial hero, blog-only search, topic navigation, featured
  guide, latest insights, author discovery, tag cloud, and newsletter CTA.
- Browse and search results with shareable filters and numbered pagination.
- Category, tag, series, authors directory, author profile, and article pages.
- Separate global site search and blog-only search experiences.

### Content and discovery

- One stable primary category, multiple governed tags, audience, level, format,
  author, optional co-authors and reviewer, series, publication date, and
  last-edited date.
- Seven initial categories: Strategy & Growth, SEO, Paid Media, Content &
  Creative, Social Media, Email & Lifecycle, and Analytics & Optimization.
- Accessible tag cloud with exact article counts and an alphabetical view.
- Structured article blocks for summaries, rich text, figures, quotations,
  statistics, checklists, steps, tables, media, downloads, citations, FAQs, and
  contextual consultation prompts.
- Editorial and automatic related-content rules, RSS feeds, sitemaps, canonical
  URLs, `hreflang`, social metadata, and structured data.

### CMS and delivery

- Keep the CMS provider replaceable through a validated content adapter.
- Generate static localized pages and separate global and blog search indexes at
  build time; never expose CMS credentials to the browser.
- Trigger validated deployments from CMS publishing events while leaving the
  existing production build online after invalid content or a failed build.
- Support draft, scheduled, published, preview, redirects, and explicit missing-
  translation behavior.

### Interaction and quality

- Responsive English LTR and Hebrew RTL layouts, accessible filters, search,
  dialogs, tag cloud, pagination, article navigation, and content blocks.
- Newsletter signup as the primary recurring conversion and one contextual
  consultation prompt on high-intent articles.
- Registered-user comment presentation as a transparent UI-only prototype; no
  public storage, real accounts, replies, reactions, moderation, reporting,
  deletion, spam controls, or comment-specific localization in `v1.2.0`.
- Automated coverage for content validation, routes, localization, search,
  filters, pagination, metadata, accessibility guards, and deterministic builds.

The approved design is specified in
[`docs/superpowers/specs/2026-08-15-blog-v1.2.0-design.md`](superpowers/specs/2026-08-15-blog-v1.2.0-design.md).

## Planned: site-wide accessibility baseline

Apply the authentication work's accessibility foundation across the existing
landing page.

- Audit page landmarks, heading hierarchy, accessible names, descriptions, and
  form error associations.
- Standardize focus-visible styles and keyboard behavior for navigation,
  accordion, carousel, menus, and forms.
- Verify contrast, zoom, reflow, pointer target size, reduced motion, and screen
  reader status announcements.
- Add automated accessibility-oriented guards where they can be reliable without
  a runtime dependency, plus a documented manual test matrix.
- Publish an accessibility statement that accurately describes supported
  behavior and known limitations.

## Planned: light and dark themes

The existing visual system is the light theme and remains the default.

- Convert hard-coded theme colors to semantic custom-property tokens.
- Add a dark theme that preserves the Positivus lime accent and required text,
  control, border, and focus contrast.
- Add an accessible theme switch in a consistent header location.
- Respect `prefers-color-scheme` before a visitor makes an explicit choice.
- Persist only the explicit theme preference and allow returning to system mode.
- Cover every landing and authentication component, illustration treatment, and
  state in both themes and both text directions.
- Prevent theme flash during navigation between static pages.

## Future: production authentication integration

This work is intentionally separate from the UI-only milestone and requires a
backend and security review.

- Real account and session lifecycle.
- Verified email delivery and single-use recovery tokens.
- Standards-compliant OAuth/OpenID Connect integrations.
- Rate limiting, compromised-password checks, audit logging, and abuse controls.
- Optional multi-factor authentication and passkeys based on product risk.
- Account settings for password, email, connected providers, and sign out.
- Production-ready Terms, Privacy, consent, retention, and deletion behavior.

## Reference guidance

- [WCAG 2.2 Accessible Authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [HTML autocomplete tokens](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
