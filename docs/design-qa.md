# Design QA

## Blog v1.2.0 — Editorial Grid implementation audit

### Source truth and evidence policy

The approved Blog design is the **Editorial Grid prose specification** in `docs/superpowers/specs/2026-08-15-blog-v1.2.0-design.md`. No approved Blog reference bitmap exists. The authentication Green Gateway board is unrelated to this feature and was not copied, cited, or used for comparison; no misleading `blog-editorial-grid-v2-reference.png` was created.

`docs/design-qa/blog-comparison.jpg` is therefore an implementation-only contact sheet comparing fresh English/Hebrew desktop and compact Blog Home captures with each other. It is not a reference-versus-implementation claim. All source screenshots were saved directly from the in-app browser and inspected after saving. Contact sheets scale complete copies for layout only; source captures remain untouched.

The requested CSS viewports were 1440 × 900 and 430 × 932. The in-app browser rendered 1439 × 900 for the desktop evidence and enforced a 471 × 931 minimum for compact evidence. Exact 1440/430 rendering is a named provider limitation, not normalized evidence. The browser's capture surface also emitted high-density files with unused white area and embedded scroll chrome; these exact pixels were preserved rather than cropped, resized, stretched, or relabeled.

### Accepted evidence inventory

| Evidence | Browser state | Saved pixels |
| --- | --- | --- |
| `blog-home-desktop-en.png`, `blog-home-desktop-he.png` | EN LTR / HE RTL Blog Home; CSS 1439 × 900 | 2763 × 1765 each |
| `blog-home-mobile-en.png`, `blog-home-mobile-he.png` | EN LTR / HE RTL compact Blog Home; CSS 471 × 931 | 865 × 1825 each |
| `blog-results-filters-desktop-en.png` | Browse/filter shell and explicit Blog-index recovery | 2763 × 1765 |
| `blog-article-desktop-en.png` | English article header, tools, hero, and article grid | 2763 × 1765 |
| `blog-article-mobile-he.png` | Hebrew RTL compact article; CSS 471 × 931 | 865 × 1825 |
| `blog-author-desktop-en.png` | English author profile | 2763 × 1765 |
| `blog-global-search-desktop-en.png` | Shared search overlay and recovery actions | 2763 × 1765 |
| `blog-empty-result-browser-blocked.png` | No-match query attempt with browser-blocked JSON and static recovery | 2763 × 1765 |
| `blog-missing-translation-desktop-he.png` | Announced Hebrew missing-translation page | 2763 × 1765 |
| `blog-comment-signed-out.png` | Corrected signed-out state; CSS viewport 1439 × 900 | 2763 × 9400 full page |
| `blog-comment-signed-in.png` | Signed-in preview form | 2763 × 10094 full page |
| `blog-comment-invalid.png` | Assertive validation and textarea focus recovery | 2763 × 10135 full page |
| `blog-comment-success.png` | Local success announcement and one demo item | 2763 × 10229 full page |
| `blog-comment-session-reset.png` | Reload notice and zero comments | 2763 × 10094 full page |
| `blog-comparison.jpg` | Labeled implementation-only EN/HE desktop/compact contact sheet | 2200 × 1600 |
| `blog-empty-and-translation-states.png` | Labeled recovery-state contact sheet | 2400 × 1040 |
| `blog-comment-prototype-states.png` | Labeled five-state comment contact sheet | 2600 × 1980 |

### Numbered functional and visual QA flow

1. **Preview health — passed.** Rebuilt and served the current worktree at `http://127.0.0.1:4173/`; the package intentionally remained at feature-work version 1.1.0. Fresh Blog pages, styles, routes, and manifest content were present.
2. **Blog Home and responsive direction — passed with viewport limitation.** Inspected EN LTR and HE RTL at desktop and the provider's compact minimum. Editorial hierarchy, lime/near-black/gray tokens, mirrored reading order, search control, chips, featured guide, and compact navigation remained coherent with no visible root overflow. Exact requested viewport pixels were unavailable as documented above.
3. **Blog browse, both searches, filters, sort, and empty results — partially browser-blocked.** The server-rendered browse shell, all filter groups, sort control, pagination, recovery copy, and static result cards rendered. The in-app browser blocked local JSON fetch/navigation with `ERR_BLOCKED_BY_CLIENT`, so client-side Blog search, every live filter/sort permutation, shared-search results, filter drawer initialization, and a genuine calculated empty result could not be visually exercised. The accepted no-match capture honestly shows the fallback; schema/core/render/build tests independently cover index content, query/filter/sort logic, and empty-state markup.
4. **Generated route families — passed.** Opened `/blog/search/` and `/blog/search/page/2/`, category SEO, tag Measurement, Growth Foundations series, authors directory, Maya Chen profile, and Hebrew page-2/category/series/author peers. Headings, `lang`, and `dir` matched each route. The Hebrew/English author language switch landed on the stable peer identity.
5. **Article journey and tools — passed with browser-surface limitations.** Inspected EN desktop and HE compact article composition, metadata, hero, semantic blocks, table of contents, tags, series navigation, related reading, and recovery links. Copy Link announced “Link copied” without URL mutation. A TOC link was activated, but the in-app browser did not expose a reliable hash/current-section assertion. Print was invoked in an isolated browser tab; the browser API does not expose the system print-preview surface for inspection.
6. **Missing translation — passed.** `/he/blog/analytics-attribution-models/` rendered `lang="he"`, `dir="rtl"`, the announced missing-translation state, English-article recovery, and Blog-home recovery instead of silent language fallback.
7. **Newsletter and consultation prototypes — passed.** Invalid newsletter input produced an assertive, recoverable error. The fake non-personal address `qa@example.test` produced the success message stating that the address was not sent or stored, with no URL change. The paid-media consultation prompt disclosed that requests are a prototype and exposed its Request a quote recovery link.
8. **Shared global search overlay — partially browser-blocked.** The Blog-header trigger opened the dialog and moved focus to the query field; the close button restored focus to the trigger. JSON blocking forced the designed recovery links instead of live results. Escape dismissal could not be confirmed in this browser provider, so it remains covered by implementation/tests rather than claimed as manual evidence.
9. **Comment demonstration — passed after one regression fix.** Confirmed signed-out disclosure/form hiding, signed-in preview, one-character invalid alert and textarea focus recovery, fake “Useful demo note.” success, unchanged URL, one in-memory list item, and reload reset to zero items with a new-session notice.
10. **Console, assets, overflow, and privacy evidence — passed within API limits.** Supported console-log inspection returned no warnings or errors after the flow. Accepted captures showed the local article/author artwork and no visible missing asset or root-level horizontal overflow. URL comparison proved comment submission did not navigate, and reload proved comments were not durable in the document session.

### Findings, fix, and post-fix result

- **P1 fixed — signed-out comment form visibly leaked through its `hidden` state.** The renderer correctly emitted `hidden`, but `[data-demo-comments] form { display: grid; }` overrode the user-agent hidden rule. A focused build regression was added first and observed failing; `[data-demo-comment-form][hidden] { display: none; }` was then added as the minimal production fix. The focused test passed, browser inspection reported signed-out form hidden/signed-out recovery visible, and all five comment captures were freshly replaced and inspected.
- **No remaining actionable P0/P1/P2 product finding** was observed in the manually reachable surfaces. Browser-client restrictions are evidence gaps, not product defects.

### UX and accessibility assessment

- Strengths: the Editorial Grid hierarchy is clear across languages; logical properties mirror RTL without flipping the brand/hero artwork; headings, landmarks, breadcrumbs, native dialog/details/form controls, 44px control targets, focus styling, live status/alert regions, recovery links, semantic article metadata, reduced-motion CSS, and print CSS are present.
- The recovery language is specific and actionable: unavailable indexes retain server-rendered content; missing translations preserve a path to the peer article/home; newsletter/consultation/comments state their prototype and privacy boundaries.
- Remaining manual limits: no screen-reader session, browser zoom matrix, high-contrast mode, or reduced-motion media emulation was available in this pass. Print preview, Escape dismissal in the search dialog, client-filter focus trapping, and dynamic empty results could not be visually confirmed because of provider surfaces/policies; automated tests remain the supporting nonvisual evidence.

### Browser evidence limits and privacy claims

The Browser API has no DevTools network panel. It also was not used to inspect cookies, localStorage/sessionStorage, history, profiles, or credentials. Accordingly, this report does **not** claim direct network/storage-panel evidence. Manual proof is limited to unchanged URLs, disclosed prototype copy, and reload-cleared comments. Source review and automated tests establish that comment data uses only an in-memory array, newsletter/consultation submission is prevented, no comment transport exists, and CMS credentials/endpoints are absent from browser output.

Blog audit result: **passed with documented browser-provider limitations; no approved Blog reference bitmap exists.**

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
