# Positivus UX/UI Design Language and System Specification

**Document type:** UX/UI design definition
**Reference:** [Positivus Landing Page Design](https://www.figma.com/community/file/1230604708032389430/positivus-landing-page-design) by Olga Averchenko
**Scope:** Marketing landing pages for digital agencies and adjacent professional services
**Status:** Extracted reference specification, ready for design and frontend use

---

## 1. Purpose

This document defines the visual language, interaction patterns, design tokens, responsive behavior, and reusable components expressed by the Positivus landing-page template.

It is intended to support:

- Consistent extension of the original landing page.
- Translation from Figma into production UI.
- Creation of additional pages that still feel recognizably Positivus.
- Consolidation of repeated compositions into a maintainable component library.
- Accessibility and interaction states that are not fully defined in the static source.

### 1.1 Evidence levels

Definitions in this document use three evidence levels:

| Level | Meaning |
|---|---|
| **Source-confirmed** | Explicitly present in the published Figma style-frame data. |
| **Observed** | Repeated consistently in the visual design and public implementation. |
| **Normalized** | Converted into a systematic token or component rule for production use. |

The source-confirmed Figma library is intentionally small: four named fill styles, ten text styles, and two published component sets. The broader component model below formalizes recurring page patterns that should behave as reusable components even when they were not published that way in the source file.

---

## 2. Design-language summary

Positivus can be described as **soft neo-brutalism with editorial restraint**.

Its identity comes from the tension between:

- Strict black-and-white structure and a single electric-lime accent.
- Hard outlines and offset shadows paired with large, friendly corner radii.
- Utilitarian typography paired with playful, surreal illustrations.
- Large areas of whitespace paired with visually dense cards.
- Direct, professional copy paired with energetic visual details.

### 2.1 Defining characteristics

1. **One dominant accent.** Lime is used decisively for emphasis, not as ambient decoration.
2. **High-contrast hierarchy.** Most information is black on white or white on near-black.
3. **Highlighted language.** Important headings are placed on compact colored pills, sometimes line by line.
4. **Rounded brutalist surfaces.** Cards use thin black outlines, `45px` radii, and hard downward shadows.
5. **Playful technical illustration.** Orbit lines, stars, arrows, abstract characters, and browser metaphors communicate digital services.
6. **Editorial spacing.** Sections are separated generously so each story unit can stand on its own.
7. **Visible interaction affordances.** Arrows, plus/minus controls, underlines, borders, and partial off-canvas cards make actions discoverable.

### 2.2 Design principles

#### Clarity before decoration

Every visual element should strengthen hierarchy, explain a service, or signal an action. Decorative geometry should not compete with the value proposition.

#### Contrast creates emphasis

Prefer a decisive surface change—white to dark, grey to lime—over subtle tint changes.

#### Repetition creates brand recognition

Reuse the same heading highlights, rounded cards, circular arrow controls, and hard-shadow treatment across pages.

#### Friendly, not childish

Illustrations may be whimsical, but typography, spacing, and copy remain professional and controlled.

#### Responsive composition, not simple scaling

Desktop rows become mobile stacks or horizontally scrollable collections. Content should be reordered intentionally rather than merely reduced in size.

---

## 3. Foundations

## 3.1 Color system

### 3.1.1 Source-confirmed palette

| Token | Hex | Figma style | Primary role |
|---|---:|---|---|
| `color.accent` | `#B9FF66` | `Green` | Highlights, active surfaces, directional links, selected controls |
| `color.dark` | `#191A23` | `Dark` | Dark cards, primary buttons, testimonial section, footer |
| `color.surface` | `#F3F3F3` | `Grey` | Neutral cards, forms, CTA panels, inactive accordion rows |
| `color.text` | `#000000` | `Black` | Primary text, borders, icons, illustration strokes |
| `color.inverse` | `#FFFFFF` | Direct fill | Text and icons on dark surfaces; white heading highlights |

### 3.1.2 Supplemental color

| Token | Hex | Role |
|---|---:|---|
| `color.dark-raised` | `#292A32` | Nested dark panel used for the footer subscription area |

### 3.1.3 Semantic aliases

```text
background.page       = color.inverse
background.subtle     = color.surface
background.emphasis   = color.accent
background.inverse    = color.dark

text.primary          = color.text
text.inverse          = color.inverse
text.accent-on-dark   = color.accent

border.default        = color.text
border.inverse        = color.inverse
border.accent         = color.accent
```

### 3.1.4 Usage rules

- Use lime for one or two high-priority elements within a viewport.
- Use lime behind black text, or as text/icon color on the dark surface.
- Use near-black rather than pure black for large filled surfaces.
- Reserve pure black for copy, borders, icons, and illustration strokes.
- Use grey to separate content without lowering text contrast.
- Do not introduce additional brand colors unless the product explicitly requires them.
- Do not use gradients in core interface surfaces.
- Do not use lime for paragraph text on white.

### 3.1.5 Contrast guidance

Approximate WCAG contrast ratios:

| Pair | Ratio | Guidance |
|---|---:|---|
| Black on lime | `17.6:1` | Excellent for text and controls |
| Dark on lime | `14.5:1` | Excellent for text and controls |
| White on dark | `17.3:1` | Excellent for inverse content |
| Lime on dark | `14.5:1` | Excellent for links and active indicators |
| Lime on white | `1.2:1` | Fails; avoid for meaningful text or thin icons |

---

## 3.2 Typography

### 3.2.1 Typeface

**Family:** Space Grotesk
**Fallback:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
**Supported weights:** Regular `400`, Medium `500`
**Letter spacing:** `0` throughout the source styles

Space Grotesk gives the system a technical, contemporary personality while remaining readable in long-form copy.

### 3.2.2 Source-confirmed type scale

Figma uses the font's intrinsic/normal line height for headings. Approximate rendered line heights are shown for implementation planning; `normal` is acceptable when the same font file is used.

| Semantic style | Desktop | Mobile | Weight | Line height |
|---|---:|---:|---:|---|
| `type.display` / H1 | `60px` | `43px` | `500` | Normal, approximately `1.276` |
| `type.heading-lg` / H2 | `40px` | `36px` | `500` | Normal, approximately `1.276` |
| `type.heading-md` / H3 | `30px` | `26px` | `500` | Normal, approximately `1.276` |
| `type.heading-sm` / H4 | `20px` | `18px` | `500` | Normal, approximately `1.276` |
| `type.body` | `18px` | `16px` | `400` | Normal desktop; `24px` mobile |

The Figma text-style names are:

```text
h1
h1 mob
h2
h2 mob
h3
h3 mob
h4
h4 mob
p
p mob
```

### 3.2.3 Supporting text styles

The following production styles normalize common patterns found in the page:

| Style | Size / line height | Weight | Usage |
|---|---|---:|---|
| `type.body-lg` | `20px / 28px` | `400` | Hero description, desktop navigation, buttons |
| `type.body-sm` | `16px / 24px` | `400` | Metadata, compact cards, footer copy |
| `type.label` | `16px / 24px` | `400` | Form labels on desktop |
| `type.label-sm` | `14px / 20px` | `400` | Form labels and validation on compact screens |
| `type.step-number` | `60px / normal` desktop; `30px / normal` mobile | `500` | Process accordion numbering |

### 3.2.4 Typographic rules

- Use weight `500` for headings, not bold `700`.
- Use sentence case for headings and calls to action.
- Keep body text left-aligned except in compact section headers, which may be centered.
- Keep display headlines short enough to occupy approximately three lines or fewer.
- Split highlighted headings by semantic phrase, not by arbitrary line wrapping.
- Do not add tracking to uppercase text because uppercase is not a core part of the language.
- Avoid mixing Space Grotesk with another display font.

---

## 3.3 Spacing system

The source does not publish spacing variables. The following normalized scale captures repeated Auto Layout values and implementation measurements.

| Token | Value | Typical use |
|---|---:|---|
| `space.1` | `5px` | Tight label relationships |
| `space.2` | `10px` | Icon internals, field-label gap |
| `space.3` | `15px` | Compact list spacing |
| `space.4` | `20px` | Default component gap |
| `space.5` | `25px` | Form and accordion internals |
| `space.6` | `30px` | Mobile card/section-header spacing |
| `space.7` | `35px` | Hero content stack |
| `space.8` | `40px` | Desktop grid and section-header gap |
| `space.10` | `50px` | Default card padding |
| `space.12` | `60px` | Mobile section separation and desktop gutters inside panels |
| `space.16` | `80px` | Desktop header-to-content separation |
| `space.20` | `100px` | Desktop page gutter and major section rhythm |
| `space.28` | `140px` | Desktop separation between primary sections |

### 3.3.1 Spacing rules

- Use `20px` as the default relationship between sibling elements.
- Use `40px` as the default desktop grid gap.
- Use `80px` between a desktop section header and its main content.
- Use `140px` between major desktop story sections.
- Use `60px` between major sections on compact screens.
- Preserve generous spacing around dark panels; do not let adjacent dark surfaces visually merge.

---

## 3.4 Shape, border, and elevation

### 3.4.1 Radius tokens

| Token | Value | Usage |
|---|---:|---|
| `radius.highlight` | `7px` | Highlighted heading fragments |
| `radius.control` | `14px` | Buttons, inputs, subscription panels |
| `radius.card` | `45px` | Cards, accordions, testimonials, major panels |
| `radius.round` | `999px` or `50%` | Arrow controls, social icons, radio controls |

### 3.4.2 Borders

- Default structural border: `1px solid #000000`.
- Inverse divider: `1px solid #FFFFFF` or grey where visually softer.
- Testimonial bubble: `1px solid #B9FF66`.
- Borders must remain crisp; do not use semi-transparent black for primary structure.

### 3.4.3 Elevation

```css
box-shadow: 0 5px 0 #000000;
```

This is a hard offset shadow, not a blur-based elevation effect.

Use it for:

- Service cards.
- Process accordion rows.
- Team cards.
- Other interactive cards that need tactile weight.

Do not use it on every surface. Large dark containers, the CTA panel, inputs, and the footer remain flat.

---

## 3.5 Layout and grid

### 3.5.1 Wide layout

| Property | Definition |
|---|---|
| Reference canvas | Approximately `1440px` |
| Maximum page width | `1440px` |
| Horizontal page gutter | `100px` |
| Content width at 1440px | `1240px` |
| Grid | 12 columns |
| Column gap | `40px` |

The hero divides into two six-column regions. Service cards use a two-column grid. Team cards use a three-column grid.

### 3.5.2 Compact layout

| Property | Definition |
|---|---|
| Horizontal gutter | `20px` |
| Primary layout | Single column |
| Default card gap | `20px` |
| Section separation | `60px` |
| Header alignment | Centered stack, unless content requires left alignment |

### 3.5.3 Responsive ranges

The source provides dedicated desktop and mobile compositions rather than a complete breakpoint token system. Use:

| Range | Behavior |
|---|---|
| Compact: `0–767px` | Mobile composition, stacked layout, full-width controls |
| Intermediate: `768–1365px` | Preserve compact hierarchy while allowing larger imagery and gutters |
| Wide: `1366px+` | Full 12-column composition and desktop navigation |

Do not expose tablet users to an overcrowded desktop navigation. Maintain the compact navigation until the wide layout has enough room for all links and the CTA.

---

## 3.6 Iconography

### Style

- Monochrome geometric icons.
- Black, white, or lime fills depending on the surface.
- Simple star, arrow, plus, minus, social, and menu glyphs.
- Minimal internal detail and no multicolor UI icons.
- Circular containers frequently provide contrast and touch area.

### Directional arrow

The signature action icon is a northeast-pointing arrow inside a circle.

- Use with “Learn more” and similar secondary actions.
- Circle diameter should be approximately `41–44px` where space allows.
- Preserve at least a `44px` interactive target even if the visible icon is smaller.
- Rotate approximately `30deg` on hover only when motion is appropriate.

### Plus/minus control

- Use plus for collapsed process items and minus for expanded items.
- Place the glyph inside a light circular button with a black border.
- Do not rely on the glyph alone; expose `aria-expanded` and an accessible label.

---

## 3.7 Illustration language

Illustrations are central to the brand and should follow these constraints:

- Limit colors to black, white, lime, and occasional grey.
- Use flat vector fills and thin-to-medium black outlines.
- Combine digital metaphors with playful abstract geometry.
- Favor browser windows, cursors, charts, magnifiers, envelopes, speakers, stars, and orbit lines.
- Keep illustrations visually light enough to coexist with large typography.
- Avoid photorealistic imagery, 3D rendering, gradients, and detailed stock photography.
- Keep illustration backgrounds transparent so the same asset can work on white, grey, lime, or dark cards.
- Preserve source attribution and licensing metadata when reusing referenced assets.

Team portraits use lime-backed abstract cutouts rather than conventional circular headshots.

---

## 4. Interaction and motion

The original design is primarily static. These normalized motion rules reflect the behavior of the public implementation and the visual character of the template.

### 4.1 Motion tokens

| Token | Value | Usage |
|---|---|---|
| `motion.fast` | `200ms` | Arrow rotation, icon feedback |
| `motion.standard` | `300ms` | Button color, menu, carousel, accordion |
| `ease.standard` | `cubic-bezier(0.25, 0.8, 0.25, 1)` | Sliding and positional transitions |
| `ease.playful` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Small icon emphasis only |

### 4.2 Interaction rules

- Prefer color and icon changes over scale-heavy animation.
- Keep motion under `300ms` for direct manipulation.
- Do not animate large illustrations continuously.
- Ensure accordion animation does not delay access to content.
- Allow testimonial and case-study carousels to be dragged or swiped.
- Preserve normal scrolling; horizontal carousels must not trap vertical gestures.
- Respect `prefers-reduced-motion` by removing nonessential rotation and sliding.

### 4.3 State model

All actionable components must define:

```text
Default
Hover
Focus-visible
Active/pressed
Disabled, when applicable
Loading, when applicable
Error/success, for form controls
```

The original static design does not fully specify focus and validation states. Production implementations must add them without changing the core visual language.

---

## 5. Component specifications

## 5.1 Highlighted heading

### Purpose

Creates the signature lime-backed heading treatment used for section labels and service names.

### Anatomy

1. Semantic heading or text element.
2. Compact background highlight.
3. Optional multiple fragments for a deliberately broken title.

### Variants

| Variant | Background | Text |
|---|---|---|
| Accent | Lime | Black |
| Inverse | Dark | White |
| Light | White | Black |

### Specification

- Horizontal padding: `7px`.
- Corner radius: `7px`.
- Vertical padding: `0`.
- Width: hug content.
- Use type styles H1–H4 or body as required.
- When a title spans two highlighted lines, each line receives its own highlight.

### Accessibility

The highlight is decorative. Heading hierarchy must come from semantic HTML, not from the background color.

---

## 5.2 Section header

### Anatomy

1. Highlighted H2.
2. One concise descriptive paragraph.

### Wide behavior

- Horizontal composition.
- Left aligned.
- `40px` gap.
- Description width generally `292–580px`, depending on content.

### Compact behavior

- Vertical composition.
- Center aligned by default.
- `30px` gap.
- Titles may wrap when necessary; do not force every section title onto one line.

### Content guidance

- Heading: two to five words.
- Description: one sentence or two short sentences.
- Describe value or expected content, not internal company language.

---

## 5.3 Button

### Source-confirmed primary button

- Height: approximately `68px`.
- Padding: `20px 35px`.
- Radius: `14px`.
- Label: `20px / 28px`, regular.
- Background: dark.
- Text: white.

### Normalized variants

| Variant | Background | Text | Border | Typical use |
|---|---|---|---|---|
| Dark | Dark | White | None | Primary conversion action |
| Accent | Lime | Black | None | Primary action on dark surfaces |
| Outline | Transparent/white | Black | 1px black | Secondary navigation CTA |

### Layout behavior

- Hug label width on wide layouts.
- Full width on compact layouts where the button is the primary section action.
- Use a single-line label; shorten the copy instead of wrapping.
- Minimum target height: `48px`; reference height: `68px`.

### States

- Hover: change background opacity or switch to the paired high-contrast surface.
- Active: slightly restore saturation after hover; avoid large physical movement.
- Focus-visible: `2–3px` ring with at least `2px` offset.
- Disabled: reduce contrast while keeping label legible; remove pointer cursor.

---

## 5.4 Arrow link / icon button

### Anatomy

1. Circular icon surface.
2. Northeast arrow.
3. Optional text label.

### Variants

- Dark circle with lime arrow.
- White circle with black arrow.
- Lime circle with black arrow.
- Plain lime arrow and label on dark surfaces.

### Behavior

- Use for lower-commitment navigation such as “Learn more.”
- Keep icon-to-label gap around `15px`.
- Rotate the arrow approximately `30deg` on hover when reduced motion is not requested.
- Do not use the arrow link as the primary form submission control.

---

## 5.5 Surface card

### Base specification

- Width: fill container.
- Padding: `50px` wide; may reduce to `30px` or `20px` on narrow screens.
- Radius: `45px`.
- Optional border: `1px solid black`.
- Optional hard shadow: `0 5px 0 black`.

### Surface variants

| Variant | Background | Default text |
|---|---|---|
| Accent | Lime | Black |
| Dark | Dark | White |
| Neutral | Grey | Black |

### Composition rules

- Use one dominant illustration or one primary content group per card.
- Keep card headings short and prominent.
- Use border + shadow for discrete cards; omit shadow for large continuous panels.
- Alternate surfaces rhythmically. Avoid two visually identical adjacent service cards.

---

## 5.6 Navigation bar

### Wide anatomy

1. Positivus logo.
2. Five navigation links.
3. Outline “Request a quote” CTA.

### Wide specification

- Top/bottom page margin: approximately `60px`.
- Link gap: `40px`.
- Link typography: `20px / 28px` regular.
- Logo mark: approximately `36px`.

### Compact anatomy

1. Reduced logo.
2. Hamburger button.
3. Slide-down menu with links and CTA.
4. Optional dimmed page overlay.

### UX rules

- Header may be sticky on compact screens.
- Closing the menu returns focus to the hamburger button.
- Escape closes the menu.
- Prevent background interaction while the menu is open.
- Use current-section indication when the page supports scroll spy.

---

## 5.7 Hero section

### Wide composition

- 12-column grid with `40px` gap.
- Content occupies six columns.
- Illustration occupies six columns.
- Content stack gap: approximately `35px`.
- Description maximum width: approximately `498px`.
- CTA hugs its label.

### Compact composition

1. Display headline.
2. Illustration.
3. Description.
4. Full-width CTA.

The compact layout intentionally separates headline and supporting copy around the illustration. Preserve that storytelling sequence.

### Content rules

- Headline communicates the primary outcome.
- Description explains the service range or mechanism.
- CTA uses a specific, low-friction action such as “Book a consultation.”

---

## 5.8 Customer-logo strip

### Anatomy

- Six monochrome customer logos.
- Equal visual weight rather than equal pixel width.

### Behavior

- Wide: display in one evenly distributed row.
- Compact: use a clipped marquee or horizontally scrollable row.
- Use grayscale/monochrome assets to protect the core palette.
- Provide useful alt text for meaningful logos; use empty alt text when the same brand names are already present in accessible copy.

---

## 5.9 Service card

### Anatomy

1. Two-line highlighted H3.
2. Service illustration.
3. Arrow link labeled “Learn more.”

### Surface rotation

The six-card grid alternates:

```text
Neutral → Accent
Dark    → Neutral
Accent  → Dark
```

Heading-highlight and arrow colors invert to maintain contrast.

### Wide behavior

- Two-column card grid.
- `20px` vertical gap between rows.
- Card content and illustration form two internal columns.
- Illustration height is approximately `170px`.

### Compact behavior

- Single-column grid.
- Illustration remains secondary to the title.
- Reduce illustration height to approximately `129–150px`.
- Keep the arrow control near the lower-left edge.

---

## 5.10 CTA panel

### Anatomy

1. H3 title.
2. Short supporting paragraph.
3. Dark CTA button.
4. Decorative abstract illustration.

### Specification

- Grey surface.
- `45px` radius.
- Approximately `50px` padding.
- No border or hard shadow.

### Responsive behavior

- Wide: two columns; illustration may overlap the panel bounds intentionally.
- Compact: hide the decorative illustration and use a full-width CTA.

Decorative overflow must not create horizontal page scrolling.

---

## 5.11 Case-study group

### Wide behavior

- One continuous dark container.
- `45px` outer radius.
- Three equal content columns.
- Approximately `60px` horizontal padding per item.
- Vertical dividers between items.
- Lime arrow links.

### Compact behavior

- Convert each case study into an individual dark card.
- Horizontal scrolling with snap points.
- Show approximately `16%` of the next item to advertise more content.
- Maintain `20px` gaps and side insets.

### Accessibility

- Do not make horizontal scrolling the only way to reach content with a keyboard.
- Provide previous/next controls or ensure each card can be tabbed and scrolled into view.

---

## 5.12 Process accordion

### Anatomy

1. Two-digit step number.
2. Step title.
3. Circular plus/minus control.
4. Divider shown in the expanded state.
5. Description content.

### Collapsed state

- Grey card.
- Black border and hard shadow.
- Plus icon.
- Description hidden.

### Expanded state

- Lime card.
- Minus icon.
- Divider below the summary.
- Description visible.

### Wide specification

- Padding: approximately `41px 60px`.
- Step number: `60px`, medium.
- Step title: `30px`, medium.
- Row gap: `20px`.

### Compact specification

- Padding: approximately `30px`.
- Step number: `30px`, medium.
- Step title: `18px`, medium.

### Accessibility

- Use native `details/summary` or an accessible disclosure pattern.
- Expose `aria-expanded` and associate the summary with its panel.
- Keep the entire summary row interactive, not only the plus/minus circle.

---

## 5.13 Team card

### Anatomy

1. Abstract portrait.
2. Name and role.
3. Circular LinkedIn control.
4. Horizontal divider.
5. Short biography.

### Specification

- White or grey surface.
- Black border and hard shadow.
- `45px` radius.
- Approximately `40px 35px` padding on wide screens.
- Three-column grid on wide screens; one column on compact screens.

### UX rules

- The social icon must include the person's name in its accessible label.
- Keep biographies similar in length to preserve card rhythm.
- On compact screens, it is acceptable to show a subset with a “See all team” action.

---

## 5.14 Testimonial carousel

### Container

- Dark surface.
- `45px` radius.
- White primary text.
- Lime accent for borders, author names, and active indicators.

### Testimonial anatomy

1. Lime-outlined speech bubble.
2. Quote.
3. Speech-tail geometry.
4. Author name in lime.
5. Author role/company in white.

### Controls

- Previous and next arrow buttons.
- Star-shaped page indicators.
- Active indicator uses lime.
- Disabled arrows use reduced-opacity grey.

### Responsive behavior

- Wide: show one full testimonial and part of neighboring content, or two half-width items.
- Compact: one testimonial per viewport.
- Support swipe/drag and explicit controls.

### Accessibility

- Pause any automatic rotation by default; preferably do not auto-rotate.
- Announce slide position without repeatedly interrupting screen readers.
- Keep arrows and indicators keyboard operable.

---

## 5.15 Contact form

### Anatomy

1. Contact-intent radio group: “Say Hi” / “Get a Quote.”
2. Name field.
3. Email field.
4. Message textarea.
5. Submit button.
6. Decorative side illustration on wide screens.

### Panel specification

- Grey surface card.
- `45px` radius.
- Wide padding: approximately `60px 100px 80px`.
- Compact padding: approximately `40px 30px 50px`.

### Field specification

- White background.
- `1px` black border.
- `14px` radius.
- Wide input padding: `18px 30px`.
- Compact input padding: `18px 20px`.
- Input text: `18px` wide, `16px` compact.
- Textarea height: approximately `190px` wide and `132px` compact.

### Radio control

- Circular white control with black border.
- Lime inner dot for selected state.
- Entire label row is clickable.

### Validation

- Required fields must be identified in their labels.
- Error state uses text, an icon, and border treatment—not color alone.
- Place error text directly below the field.
- Preserve entered values after validation failure.
- Submit button should expose progress and completion states.

---

## 5.16 Footer

### Wide anatomy

1. White inverse logo.
2. Underlined navigation links.
3. Circular social links.
4. Contact block with lime heading highlight.
5. Raised subscription panel.
6. Copyright and privacy row.

### Specification

- Dark surface.
- Top corners: `45px` radius on wide layouts.
- Outer desktop margin: `100px`.
- Internal padding: approximately `55px 60px 50px`.
- Subscription panel background: `#292A32`.
- Subscription panel radius: `14px`.

### Compact behavior

- Full-bleed dark surface.
- Center-aligned stack.
- Navigation links become vertical.
- Contact and subscription blocks become vertical.
- Social links move below the contact/subscription content.

### UX rules

- Keep email and telephone details actionable.
- Subscription form must have a visible or programmatically available label.
- Do not use placeholder text as the only label.

---

## 6. Page architecture and information hierarchy

The original page follows this sequence:

1. Navigation.
2. Hero and primary conversion action.
3. Customer-logo proof.
4. Services.
5. Mid-page CTA.
6. Case studies.
7. Working process.
8. Team.
9. Testimonials.
10. Contact form.
11. Footer and subscription.

### 6.1 UX rationale

- **Promise first:** The hero states the outcome before describing the company.
- **Early trust:** Recognizable customer logos appear immediately after the hero.
- **Offer clarity:** Services define what can be purchased.
- **Low-friction conversion:** The first CTA appears before long evidence sections.
- **Proof:** Case studies, process, team, and testimonials progressively reduce uncertainty.
- **High-intent conversion:** The detailed contact form follows the proof sequence.

### 6.2 Extension guidance

New pages should retain the same logic:

```text
Outcome → evidence → explanation → proof → action
```

Do not begin with company history or a long generic introduction.

---

## 7. Content and voice

### Voice attributes

- Direct.
- Practical.
- Optimistic.
- Professional without corporate jargon.
- Outcome-oriented.

### Heading guidance

- State a benefit, activity, or clear section subject.
- Prefer concrete nouns and active verbs.
- Avoid exaggerated claims such as “revolutionary” or “world-class.”
- Keep highlighted headings concise so the pill treatment remains visually controlled.

### CTA guidance

Use specific action labels:

```text
Book a consultation
Request a quote
Get your free proposal
See all team
Send message
Learn more
```

Avoid vague labels such as “Submit,” “Click here,” or “Explore.”

### Card copy

- Service cards: name only; explain details on the destination page.
- Case studies: problem/intervention/result in one short paragraph.
- Team cards: role followed by expertise and experience.
- Testimonials: one concrete outcome plus one trust statement.

---

## 8. Accessibility requirements

### 8.1 Structure

- Use one H1 per page.
- Maintain sequential heading levels.
- Use landmarks: `header`, `nav`, `main`, `section`, and `footer`.
- Give each major section an accessible name.

### 8.2 Keyboard and focus

- All controls must be reachable and operable by keyboard.
- Use visible `:focus-visible` styles.
- Preserve logical focus order after responsive reordering.
- Menus and overlays must manage focus and Escape behavior.
- Carousels and horizontal scrollers need keyboard-compatible navigation.

### 8.3 Touch

- Minimum interactive target: `44 × 44px`.
- Maintain sufficient separation between carousel indicators.
- Make full accordion summaries clickable.

### 8.4 Motion

- Respect `prefers-reduced-motion`.
- Do not auto-rotate testimonials.
- Avoid essential information that only appears during hover.

### 8.5 Forms

- Associate labels and validation messages programmatically.
- Announce submission errors and success.
- Do not clear values after a failed submission.
- Ensure selected radio states are perceivable without color.

### 8.6 Images and icons

- Decorative geometry receives empty alt text or is hidden from assistive technology.
- Informative illustrations receive concise purpose-based alt text.
- Icon-only controls require accessible names.

---

## 9. Do and do not

### Do

- Use lime as a decisive accent.
- Use Space Grotesk Regular and Medium.
- Use large radii with crisp black borders.
- Alternate neutral, accent, and dark surfaces.
- Keep illustrations flat and limited to the core palette.
- Let sections breathe with generous vertical spacing.
- Convert complex desktop rows into intentional mobile stories.
- Use visible arrows and plus/minus controls to signal interaction.

### Do not

- Add gradients, glassmorphism, or soft ambient shadows.
- Use lime paragraph text on white.
- Replace the hard shadow with a conventional blurred drop shadow.
- Overuse lime until it stops functioning as emphasis.
- Introduce many font weights or multiple display typefaces.
- Force desktop card grids into squeezed mobile columns.
- Hide important actions behind ambiguous icon-only controls.
- Use photographic stock imagery without deliberately adapting it to the illustration system.

---

## 10. Starter implementation tokens

```css
:root {
  /* Typography */
  --pv-font-family: "Space Grotesk", system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  --pv-font-regular: 400;
  --pv-font-medium: 500;

  /* Color */
  --pv-color-accent: #b9ff66;
  --pv-color-dark: #191a23;
  --pv-color-dark-raised: #292a32;
  --pv-color-surface: #f3f3f3;
  --pv-color-text: #000000;
  --pv-color-inverse: #ffffff;

  /* Spacing */
  --pv-space-1: 5px;
  --pv-space-2: 10px;
  --pv-space-3: 15px;
  --pv-space-4: 20px;
  --pv-space-5: 25px;
  --pv-space-6: 30px;
  --pv-space-7: 35px;
  --pv-space-8: 40px;
  --pv-space-10: 50px;
  --pv-space-12: 60px;
  --pv-space-16: 80px;
  --pv-space-20: 100px;
  --pv-space-28: 140px;

  /* Shape */
  --pv-radius-highlight: 7px;
  --pv-radius-control: 14px;
  --pv-radius-card: 45px;
  --pv-radius-round: 999px;

  /* Structure */
  --pv-border-default: 1px solid var(--pv-color-text);
  --pv-shadow-card: 0 5px 0 var(--pv-color-text);
  --pv-page-max: 1440px;
  --pv-content-max: 1240px;
  --pv-gutter-compact: 20px;
  --pv-gutter-wide: 100px;
  --pv-grid-gap: 40px;

  /* Motion */
  --pv-motion-fast: 200ms;
  --pv-motion-standard: 300ms;
  --pv-ease-standard: cubic-bezier(0.25, 0.8, 0.25, 1);
  --pv-ease-playful: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

---

## 11. Recommended component-library structure

```text
Foundations
├── Color
├── Typography
├── Spacing
├── Grid
├── Iconography
└── Illustration

Primitives
├── Button
├── IconButton
├── ArrowLink
├── HeadingHighlight
├── Input
├── Textarea
├── Radio
└── SurfaceCard

Compositions
├── SectionHeader
├── ServiceCard
├── TeamCard
├── TestimonialCard
├── ProcessAccordionItem
├── CaseStudyCard
└── SubscriptionForm

Sections
├── Navbar
├── Hero
├── LogoStrip
├── Services
├── CTA
├── CaseStudies
├── WorkingProcess
├── Team
├── Testimonials
├── Contact
└── Footer
```

### 11.1 Recommended variant properties

```text
Button
├── appearance: dark | accent | outline
├── width: hug | fill
└── state: default | hover | focus | active | disabled | loading

HeadingHighlight
├── appearance: accent | inverse | light
└── level: h1 | h2 | h3 | h4 | body

SurfaceCard
├── surface: accent | dark | neutral | white
├── border: on | off
└── shadow: on | off

ArrowLink
├── appearance: accent | dark | light | plain
├── label: show | hide
└── direction: northeast | east | previous
```

---

## 12. Definition of done

A new Positivus-style page or feature is ready when:

- It uses only the defined core palette unless an approved product need exists.
- Typography follows the Space Grotesk scale and uses weights `400/500`.
- Major surfaces use the appropriate `7/14/45px` radius hierarchy.
- Interactive cards use the correct crisp border and hard shadow.
- Desktop and compact layouts are both intentionally composed.
- All component states, keyboard behavior, and focus styles are defined.
- Color contrast and touch-target requirements are satisfied.
- Illustrations follow the black/white/lime visual grammar.
- Copy is concrete, concise, and outcome-oriented.
- The implementation respects reduced-motion preferences.
- Components are reusable and not duplicated as page-specific one-offs.

---

## 13. Sources and confidence notes

### Primary reference

- [Positivus Landing Page Design — Figma Community](https://www.figma.com/community/file/1230604708032389430/positivus-landing-page-design)
- [Creator's product description](https://olgaaverchenko.gumroad.com/l/positivus-landing-page-design)

### Supporting references

- [Published Figma style-frame data](https://www.scribd.com/document/759231053/data2), used to confirm named colors, typography values, and published component/style metadata.
- [Public Positivus implementation](https://github.com/Deri-Kurniawan/positivus), used to cross-check recurring components, responsive transformations, spacing, interaction behavior, and implementation dimensions.

### Limitation

The Figma Community URL is a listing URL rather than a directly readable `/design/...` document key. Exact color styles, text styles, and the two published component sets are source-confirmed. Extended components, spacing tokens, responsive breakpoints, motion, and accessibility states are observed or normalized definitions intended to make the design language production-ready.
