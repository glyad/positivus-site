# Design QA

## Authentication extension

The approved Green Gateway v2 authentication system has its own complete source-to-browser comparison report at [`design-qa.md`](../design-qa.md). The evidence covers English LTR, Hebrew RTL, desktop, mobile, successful journeys, and exceptional states; its final result is passed.

## Header action refinement

The landing-page quote action now precedes the language/sign-in utilities, and the desktop utility pair no longer has an enclosing border or gray capsule. The controls were rechecked in English LTR, Hebrew RTL, desktop, tight-desktop, and open-mobile-menu states. Focused before/after evidence is stored in `docs/design-qa/header-actions-comparison.jpg` and `docs/design-qa/header-actions-mobile-comparison.jpg`; no actionable P0/P1/P2 issues remain.

## Comparison Target

- Source visual truth: `docs/design-qa/reference-mockup.webp`
- Implementation: `http://127.0.0.1:4173/`
- Primary implementation screenshots: `docs/design-qa/english-desktop-language.png`, `docs/design-qa/hebrew-desktop-1440.png`, and `docs/design-qa/hebrew-contact-rtl-fixed.png`
- Source pixels: 1920 × 1080 collage; the matching landing-page panel was cropped to 705 × 441 pixels.
- Implementation pixels: 1440 × 900 pixels for both original desktop language states; 430 × 931 pixels for the Hebrew mobile state; and 1600 × 900 pixels for the post-fix focused RTL contact capture.
- CSS viewport: 1440 × 900 desktop target, 1600 × 900 focused post-fix contact check, and 430 × 932 mobile target.
- Density normalization: the source panel crop and implementation viewport were both resampled to 720 × 450 for the full-view comparison. For the RTL contact fix, the 1600 × 900 post-fix browser capture was center-cropped to 1440 × 900, then normalized with the 1440 × 900 pre-fix capture to 720 × 450.
- State: light theme; top-of-page bilingual checks plus the Hebrew RTL contact anchor for the focused annotation check; navigation closed, first process item expanded, first testimonial selected.

## Full-view Comparison Evidence

- Combined reference/implementation input: `docs/design-qa/hero-comparison.jpg`
- Combined reference/English/Hebrew input: `docs/design-qa/rtl-comparison.jpg`
- Combined pre-fix/post-fix RTL contact input: `docs/design-qa/contact-rtl-fix-comparison.jpg`
- The normalized comparison confirms the same desktop composition: header proportions, six-item navigation, two-column hero, three-line headline, original megaphone artwork, primary CTA, and six-logo strip.
- The implementation preserves the source's Space Grotesk typography, near-black/lime/gray palette, generous whitespace, and asymmetric visual balance.
- The RTL comparison confirms that the Hebrew state mirrors the layout without mirroring the Positivus brand lockup or hero artwork: the brand and copy lead from the right, the hero artwork moves left, and the original spacing and visual weight remain intact. The contact illustration is intentionally mirrored because its asymmetric crop must face inward when it moves to the left side of the panel.

## Focused Region Evidence

- Service grid: `docs/design-qa/services-1440.png`
- Working-process accordion: `docs/design-qa/process-1440.png`
- Mobile hero: `docs/design-qa/mobile-430.png`
- Mobile navigation open state: `docs/design-qa/mobile-menu-430.png`
- Mobile service cards: `docs/design-qa/mobile-services-430.png`
- Mobile contact form: `docs/design-qa/mobile-contact-430.png`
- Hebrew desktop hero and navigation: `docs/design-qa/hebrew-desktop-1440.png`
- Hebrew desktop service grid: `docs/design-qa/hebrew-services-1440.png`
- Hebrew desktop contact form before the annotation fix: `docs/design-qa/hebrew-contact-1440.png`
- Hebrew desktop contact form after the annotation fix: `docs/design-qa/hebrew-contact-rtl-fixed.png`
- Focused before/after contact comparison: `docs/design-qa/contact-rtl-fix-comparison.jpg`
- Hebrew mobile hero: `docs/design-qa/hebrew-mobile-430.png`
- Hebrew mobile navigation and language control: `docs/design-qa/hebrew-menu.png`

Focused regions were necessary because the presentation collage compresses card typography, icon alignment, shadows, and form spacing too heavily for reliable judgment in a single full-view comparison.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: local Space Grotesk is used at matching weights and hierarchy in English. Hebrew uses the platform's Arial Hebrew/Arial sans-serif fallback because Space Grotesk has no Hebrew glyph set; hierarchy, wrapping, label density, and control sizing remain visually consistent.
- Spacing and layout rhythm: desktop gutters, 12-column hero, paired service cards, rounded 45px surfaces, 5px black card shadows, section gaps, and mobile stacking preserve the source hierarchy in both directions without root-level horizontal overflow.
- Colors and visual tokens: `#B9FF66`, `#191A23`, `#F3F3F3`, black, and white are mapped to reusable CSS tokens. Active, disabled, focus, error, and success states remain legible.
- Image quality and asset fidelity: the source hero, CTA, contact, service, team, logo, star, arrow, social, and control assets are local and render without missing or zero-width images. The focused post-fix comparison shows the contact artwork's black and lime center shapes fully visible on the left in RTL instead of clipped outside the panel. Visible artwork is not replaced with emoji, placeholder boxes, CSS drawings, or inline SVG.
- Copy and content: the original English remains unchanged. Every app-owned heading, paragraph, CTA, service, process step, team role, testimonial, form label, placeholder, validation message, metadata string, and footer label has a natural Hebrew translation; brand and person/company names remain intentionally unchanged.
- Icons: original icon paths are stored as external assets, consistently sized, and optically aligned across cards, controls, navigation, testimonials, and social links. Directional arrows flip in RTL; the asymmetric contact decoration also flips so its focal shapes remain inside the panel, while the brand lockup and hero artwork retain their original orientation.
- Responsiveness: browser captures at 1440px desktop and 430px mobile, plus an intermediate-width resilience check, showed no viewport overflow, overlapping sections, clipped persistent controls, or unusable tap targets in either direction.
- Accessibility: semantic landmarks, translated accessible names and alt text, native details/summary controls, labels, keyboard focus, Escape-to-close navigation, reduced-motion behavior, direction-aware metadata, form errors, and status messaging are implemented.

## Comparison History

1. First browser pass found a P1 above-the-fold layout mismatch: the desktop hero illustration inherited the mobile `grid-row: 2` rule and appeared below the copy instead of in the right six columns.
   - Fix: set the desktop illustration to `grid-row: 1`, `grid-column: 7 / span 6`, and vertically center it in `sources/scss/main.scss`; synchronized the generated `dist/css/main.css` during verification.
   - Post-fix evidence: `docs/design-qa/desktop-1440.png` and `docs/design-qa/hero-comparison.jpg` show the corrected side-by-side hero.
2. Asset-fidelity review found a P2 shortcut in the testimonial speech-bubble tail, which was initially drawn with CSS borders.
   - Fix: replaced the CSS triangle with the source-derived external asset `sources/assets/icons/quote-tail.svg`.
   - Post-fix evidence: the rendered testimonials retain the original dark/lime outline treatment with no CSS-drawn artwork.
3. The first RTL visual pass found a P2 brand-integrity issue: inherited RTL flex direction moved the Positivus star to the opposite side of the wordmark.
   - Fix: locked `.brand` to LTR direction while allowing its containing header and footer layouts to mirror.
   - Post-fix evidence: `docs/design-qa/hebrew-desktop-1440.png`, `docs/design-qa/hebrew-mobile-430.png`, and `docs/design-qa/rtl-comparison.jpg` show the corrected lockup.
4. Final bilingual comparison found no remaining P0/P1/P2 issues across the required fidelity surfaces.
5. The browser annotation identified a P2 RTL image-crop issue in the contact panel: moving the asymmetric source illustration to the left without mirroring it placed the artwork's black and lime focal shapes outside the clipped panel, leaving only outer rays visible.
   - Fix: added an RTL-only horizontal mirror to `.contact-panel__image` while preserving its existing vertical centering and leaving the English layout unchanged.
   - Post-fix evidence: `docs/design-qa/hebrew-contact-rtl-fixed.png` and `docs/design-qa/contact-rtl-fix-comparison.jpg` show the complete focal artwork inside the left side of the Hebrew panel.
6. The post-fix focused comparison found no remaining P0/P1/P2 issues in the annotated contact region.

## Primary Interactions Tested

- Mobile menu opens, locks page scrolling, exposes the navigation, and closes with Escape.
- Accordion enforces one expanded item at a time; selecting item 02 closed item 01.
- Testimonial Next control advanced selection from slide 1 to slide 2 and updated the track transform and active dot.
- Team reveal expanded from the mobile subset to all six cards and changed its label to “Show less.”
- Contact submission displayed specific invalid states for empty required fields, then displayed the success message after valid local test input.
- The language control switched `lang` and `dir`, translated visible and accessible copy, mirrored desktop/mobile layout, and restored the saved choice after reload.
- Hebrew accordion, team reveal, carousel, contact validation/success, and newsletter success states were exercised; live messages changed back to English and Hebrew without resetting component state.
- All 21 image elements completed with non-zero natural widths.
- Browser console warnings/errors checked: none.
- Local server response checked: HTTP 200 with `text/html; charset=utf-8`.

## Implementation Checklist

- [x] Preserve the original one-page section order and content hierarchy.
- [x] Use local source assets and font files.
- [x] Match desktop and mobile layout, typography, palette, radii, borders, and shadows.
- [x] Implement navigation, accordion, team reveal, carousel, contact form, and newsletter behavior without runtime libraries.
- [x] Add persistent English/Hebrew switching, complete Hebrew copy, translated accessibility attributes, and document-level LTR/RTL direction.
- [x] Mirror directional layout and arrows while preserving the brand lockup and hero artwork orientation; mirror the asymmetric contact decoration where its RTL crop requires it.
- [x] Check JavaScript syntax, stylesheet synchronization, external-library references, browser console, assets, and local server response.

## Follow-up Polish

- No blocking polish remains. The source is a compressed presentation collage rather than a pixel-perfect raw frame export, so fine-grained antialiasing and subpixel differences were treated as expected rather than actionable. A dedicated bundled Hebrew geometric font could further reduce platform-to-platform letterform differences, but the current system fallback is readable and preserves hierarchy.

final result: passed
