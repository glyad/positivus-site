# Design QA

## Comparison Target

- Source visual truth: `design-qa/reference-mockup.webp`
- Implementation: `http://127.0.0.1:4173/`
- Primary implementation screenshot: `design-qa/desktop-1440.png`
- Source pixels: 1920 × 1080 collage; the matching landing-page panel was cropped to 705 × 441 pixels.
- Implementation pixels: 1440 × 900 pixels.
- CSS viewport: 1440 × 900 desktop target and 430 × 932 mobile target.
- Density normalization: the source panel crop and implementation viewport were both resampled to 720 × 450 for the combined comparison.
- State: light theme, top of the landing page, initial navigation state, first process item expanded, first testimonial selected.

## Full-view Comparison Evidence

- Combined reference/implementation input: `design-qa/hero-comparison.jpg`
- The normalized comparison confirms the same desktop composition: header proportions, six-item navigation, two-column hero, three-line headline, original megaphone artwork, primary CTA, and six-logo strip.
- The implementation preserves the source's Space Grotesk typography, near-black/lime/gray palette, generous whitespace, and asymmetric visual balance.

## Focused Region Evidence

- Service grid: `design-qa/services-1440.png`
- Working-process accordion: `design-qa/process-1440.png`
- Mobile hero: `design-qa/mobile-430.png`
- Mobile navigation open state: `design-qa/mobile-menu-430.png`
- Mobile service cards: `design-qa/mobile-services-430.png`
- Mobile contact form: `design-qa/mobile-contact-430.png`

Focused regions were necessary because the presentation collage compresses card typography, icon alignment, shadows, and form spacing too heavily for reliable judgment in a single full-view comparison.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: local Space Grotesk is used at matching weights and hierarchy. Headline wrapping, highlighted heading labels, paragraph density, and button labels align with the reference at desktop and remain readable on mobile.
- Spacing and layout rhythm: desktop gutters, 12-column hero, paired service cards, rounded 45px surfaces, 5px black card shadows, section gaps, and mobile stacking preserve the source hierarchy without root-level horizontal overflow.
- Colors and visual tokens: `#B9FF66`, `#191A23`, `#F3F3F3`, black, and white are mapped to reusable CSS tokens. Active, disabled, focus, error, and success states remain legible.
- Image quality and asset fidelity: the source hero, CTA, contact, service, team, logo, star, arrow, social, and control assets are local and render without missing or zero-width images. Visible artwork is not replaced with emoji, placeholder boxes, CSS drawings, or inline SVG.
- Copy and content: the original section titles, service labels, case-study content, working-process labels, team data, primary testimonial, contact copy, and footer information are preserved. Additional carousel slides use coherent agency-specific copy.
- Icons: original icon paths are stored as external assets, consistently sized, and optically aligned across cards, controls, navigation, testimonials, and social links.
- Responsiveness: browser captures at desktop and mobile, plus an intermediate-width resilience check, showed no viewport overflow, overlapping sections, clipped persistent controls, or unusable tap targets.
- Accessibility: semantic landmarks, headings, native details/summary controls, labels, alternative text, keyboard focus, Escape-to-close navigation, reduced-motion behavior, form errors, and status messaging are implemented.

## Comparison History

1. First browser pass found a P1 above-the-fold layout mismatch: the desktop hero illustration inherited the mobile `grid-row: 2` rule and appeared below the copy instead of in the right six columns.
   - Fix: set the desktop illustration to `grid-row: 1`, `grid-column: 7 / span 6`, and vertically center it in `scss/main.scss`; synchronized `css/main.css`.
   - Post-fix evidence: `design-qa/desktop-1440.png` and `design-qa/hero-comparison.jpg` show the corrected side-by-side hero.
2. Asset-fidelity review found a P2 shortcut in the testimonial speech-bubble tail, which was initially drawn with CSS borders.
   - Fix: replaced the CSS triangle with the source-derived external asset `assets/icons/quote-tail.svg`.
   - Post-fix evidence: the rendered testimonials retain the original dark/lime outline treatment with no CSS-drawn artwork.
3. Final comparison pass found no remaining P0/P1/P2 issues across the required fidelity surfaces.

## Primary Interactions Tested

- Mobile menu opens, locks page scrolling, exposes the navigation, and closes with Escape.
- Accordion enforces one expanded item at a time; selecting item 02 closed item 01.
- Testimonial Next control advanced selection from slide 1 to slide 2 and updated the track transform and active dot.
- Team reveal expanded from the mobile subset to all six cards and changed its label to “Show less.”
- Contact submission displayed specific invalid states for empty required fields, then displayed the success message after valid local test input.
- All 21 image elements completed with non-zero natural widths.
- Browser console warnings/errors checked: none.
- Local server response checked: HTTP 200 with `text/html; charset=utf-8`.

## Implementation Checklist

- [x] Preserve the original one-page section order and content hierarchy.
- [x] Use local source assets and font files.
- [x] Match desktop and mobile layout, typography, palette, radii, borders, and shadows.
- [x] Implement navigation, accordion, team reveal, carousel, contact form, and newsletter behavior without runtime libraries.
- [x] Check JavaScript syntax, stylesheet synchronization, external-library references, browser console, assets, and local server response.

## Follow-up Polish

- No blocking polish remains. The source is a compressed presentation collage rather than a pixel-perfect raw frame export, so fine-grained antialiasing and subpixel differences were treated as expected rather than actionable.

final result: passed
