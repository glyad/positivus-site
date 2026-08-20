# Design QA

## Blog v1.2.0 — Editorial Grid implementation audit

### Source truth and evidence policy

The approved Blog design is the **Editorial Grid prose specification** in `docs/superpowers/specs/2026-08-15-blog-v1.2.0-design.md`. No approved Blog reference bitmap exists. The authentication Green Gateway board is unrelated to this feature and was not copied, cited, or used for comparison; no misleading `blog-editorial-grid-v2-reference.png` was created.

`docs/design-qa/blog-comparison.jpg` is therefore an implementation-only contact sheet comparing fresh English/Hebrew desktop and compact Blog Home captures with each other. It is not a reference-versus-implementation claim. All source screenshots were saved directly from the in-app browser and inspected after saving. Contact sheets scale complete copies for layout only; source captures remain untouched.

The requested CSS viewports were 1440 × 900 and 430 × 932. The earlier in-app browser pass rendered 1439 × 900 for desktop evidence and enforced a 471 × 931 minimum for compact evidence; the final-review recapture rendered 1441 × 900. Exact 1440/430 rendering is a named provider limitation, not normalized evidence. The browser's capture surface also emitted high-density files with unused white area and embedded scroll chrome; these exact pixels were preserved rather than cropped, resized, stretched, or relabeled.

### Accepted evidence inventory

| Evidence | Browser state | Saved pixels |
| --- | --- | --- |
| `blog-home-desktop-en.png`, `blog-home-desktop-he.png` | EN LTR / HE RTL Blog Home; CSS 1439 × 900 | 2763 × 1765 each |
| `blog-home-mobile-en.png`, `blog-home-mobile-he.png` | EN LTR / HE RTL compact Blog Home; CSS 471 × 931 | 865 × 1825 each |
| `blog-results-filters-desktop-en.png` | Browse/filter shell and explicit Blog-index recovery | 2763 × 1765 |
| `blog-article-desktop-en.png` | English article header, tools, hero, and article grid | 2763 × 1765 |
| `blog-article-mobile-he.png` | Hebrew RTL compact article; CSS 471 × 931 | 865 × 1825 |
| `blog-author-desktop-en.png` | English author profile | 2763 × 1765 |
| `blog-category-seo-desktop-en.png` | SEO category route; CSS 1441 × 900 | 2767 × 3614 full page |
| `blog-tag-technical-seo-desktop-en.png` | Technical SEO tag route; CSS 1441 × 900 | 2767 × 2665 full page |
| `blog-series-growth-foundations-desktop-en.png` | Growth foundations series route; CSS 1441 × 900 | 2767 × 3627 full page |
| `blog-authors-directory-desktop-en.png` | Authors directory with four cards; CSS 1441 × 900 | 2767 × 3412 full page |
| `blog-global-search-desktop-en.png` | Shared search overlay and recovery actions | 2763 × 1765 |
| `blog-empty-result-browser-blocked.png` | No-match query attempt with browser-blocked JSON and static recovery | 2763 × 1765 |
| `blog-missing-translation-desktop-he.png` | Announced Hebrew missing-translation page | 2763 × 1765 |
| `blog-comment-signed-out.png` | Corrected signed-out recovery spacing; CSS 1441 × 900 | 2767 × 9559 full page |
| `blog-comment-signed-in.png` | Signed-in preview form | 2763 × 10094 full page |
| `blog-comment-invalid.png` | Assertive validation and textarea focus recovery | 2763 × 10135 full page |
| `blog-comment-success.png` | Local success announcement and one demo item | 2763 × 10229 full page |
| `blog-comment-session-reset.png` | Reload notice and zero comments | 2763 × 10094 full page |
| `blog-comparison.jpg` | Labeled implementation-only EN/HE desktop/compact contact sheet | 2200 × 1600 |
| `blog-empty-and-translation-states.png` | Labeled recovery-state contact sheet | 2400 × 1040 |
| `blog-comment-prototype-states.png` | Refreshed labeled five-state comment contact sheet | 2767 × 1951 |

### Numbered functional and visual QA flow

1. **Preview health — verified for the current build.** Rebuilt and served the current worktree at `http://127.0.0.1:4173/`; the package intentionally remained at feature-work version 1.1.0. Fresh Blog pages, styles, routes, and manifest content were present.
2. **Blog Home and responsive direction — visually verified with a viewport limitation.** Inspected EN LTR and HE RTL at desktop and the provider's compact minimum. Editorial hierarchy, lime/near-black/gray tokens, mirrored reading order, search control, chips, featured guide, and compact navigation remained coherent with no visible root overflow. Exact requested viewport pixels were unavailable as documented above.
3. **Blog browse, both searches, filters, sort, and empty results — NOT FULLY VERIFIED; browser-blocked.** The server-rendered browse shell, all filter groups, sort control, 12-item first page, numbered pagination, recovery copy, and static result cards rendered. The final-review run again exposed the designed unavailable-index fallback because the in-app browser blocked the same-origin JSON enhancement. Client-side Blog search, every live filter/sort permutation, shared-search results, drawer initialization, focus containment, and a genuine calculated empty result therefore remain unverified manually. Automated schema/core/render/build tests cover these behaviors, but are not represented here as manual PASS evidence.
4. **Generated route-family matrix — verified for the reachable captured routes.** Fresh full-page evidence covers `/blog/category/seo/`, `/blog/tag/technical-seo/`, `/blog/series/growth-foundations/`, and `/blog/authors/`; the visible headings were SEO, Technical SEO, Growth foundations, and Meet the authors, and the directory exposed four author cards. Earlier route checks covered browse pagination, an author profile, and available Hebrew peers. The fresh capture set closes the previously missing category/tag/series/authors-directory evidence row; it does not imply that every localized route permutation was manually recaptured.
5. **Article journey and tools — PARTIALLY VERIFIED.** Inspected EN desktop and HE compact article composition, metadata, hero, semantic blocks, table of contents, tags, series navigation, related reading, and recovery links. Copy Link announced “Link copied” without URL mutation. A TOC link was activated, but the in-app browser did not expose a reliable hash/current-section assertion. Print was invoked in an isolated browser tab; the browser API does not expose the system print-preview surface for inspection. Those two checks remain unverified rather than PASS.
6. **Missing translation — visually verified.** `/he/blog/analytics-attribution-models/` rendered `lang="he"`, `dir="rtl"`, the announced missing-translation state, English-article recovery, and Blog-home recovery instead of silent language fallback.
7. **Newsletter and contextual consultation — visually verified within the prototype surface.** Earlier browser evidence covered newsletter validation and the explicit not-sent/not-stored success copy without URL mutation. The current paid-media article capture shows the new reading-column consultation block, explains how the learning-budget framework relates to Positivus paid-media planning, and exposes a service-specific contact link; it is not a personal-data form.
8. **Shared global search overlay — NOT FULLY VERIFIED; browser-blocked.** The Blog-header trigger opened the dialog and moved focus to the query field; the close button restored focus to the trigger. JSON blocking forced the designed recovery links instead of live results. Escape dismissal and live results remain automated-only and are not claimed as manual PASS evidence.
9. **Comment demonstration — PARTIALLY VERIFIED after fixes.** The refreshed signed-out capture and computed-style inspection prove that the form is hidden and the two recovery links use a flex layout with 18px logical column spacing and 12px row spacing. Earlier accepted captures cover signed-in, invalid, success, and reload-reset states; the five-state sheet was refreshed and inspected. Timer/list/textarea cleanup on `pagehide` and persisted `pageshow` is covered by a real `EventTarget`/timer test, but this browser surface did not expose a reliable BFCache assertion, so that lifecycle check remains manually unverified.
10. **Console, assets, overflow, and privacy evidence — LIMITED EVIDENCE, not a privacy PASS.** Earlier supported console-log inspection returned no warnings or errors after its flow, and accepted captures show local artwork without a visible missing asset or root-level overflow. The Browser API has no network panel and policy forbids storage/cookie/history inspection. Unchanged URLs and reload-cleared comments are useful observations, but transport and persistence claims depend on source review and automated behavioral tests described below.

### Findings, fix, and post-fix result

- **P1 fixed — signed-out comment form visibly leaked through its `hidden` state.** The renderer correctly emitted `hidden`, but `[data-demo-comments] form { display: grid; }` overrode the user-agent hidden rule. A focused build regression was added first and observed failing; `[data-demo-comment-form][hidden] { display: none; }` was then added as the minimal production fix. The focused test passed, browser inspection reported signed-out form hidden/signed-out recovery visible, and all five comment captures were freshly replaced and inspected.
- **P2 fixed — signed-out recovery links visually concatenated.** The action row now has explicit logical row/column gaps. The final-review capture was saved and inspected, and the five-state contact sheet was regenerated from the accepted source captures.
- **No new visible P0/P1/P2 defect** was observed in the routes reached during the final-review recapture. The named browser and assistive-technology gaps below remain unverified acceptance checks, not passes and not inferred defects.

### UX and accessibility assessment

- Confirmed strengths from visual/DOM evidence: the Editorial Grid hierarchy is clear across languages; logical properties mirror RTL without flipping the brand/hero artwork; headings, landmarks, breadcrumbs, route-specific skip links, filter associations/count copy, native dialog/details/form controls, focus styling, live status/alert regions, recovery links, and semantic article metadata are present.
- The recovery language is specific and actionable: unavailable indexes retain server-rendered content; missing translations preserve a path to the peer article/home; newsletter/consultation/comments state their prototype and privacy boundaries.
- **UNVERIFIED / NOT RUN:** no screen-reader session, browser zoom/reflow matrix, high-contrast session, or reduced-motion media emulation was available. Print preview, search-dialog Escape dismissal, live client-filter focus behavior, compact drawer behavior, dynamic empty results, and persisted BFCache restoration were also not manually confirmed. Automated tests and CSS/source review are supporting nonvisual evidence only; they do not turn these manual checks into PASS.

### Browser evidence limits and privacy claims

The Browser API has no DevTools network panel. It also was not used to inspect cookies, localStorage/sessionStorage, history, profiles, or credentials. Accordingly, this report does **not** claim direct network/storage-panel evidence. Manual proof is limited to unchanged URLs, disclosed prototype copy, hidden/non-submittable initial controls, and reload-cleared comments. Source review and behavioral tests establish that personal prototype controls start disabled, only arm after handlers exist, perform no transport, and never write personal values to URLs, logs, measurement, or storage. Comment data and pending timers live only in a transient in-memory session object and are cleared on exit/restoration; CMS credentials/endpoints remain absent from browser output.

Blog audit result: **NOT FULLY VERIFIED.** Reachable static routes and the corrected signed-out state have accepted visual evidence, but the explicitly listed browser/assistive-technology checks remain blocked or not run and are not reported as PASS. No approved Blog reference bitmap exists.

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
