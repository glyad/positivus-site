# Positivus static landing page

A dependency-free HTML, SCSS/CSS, and vanilla JavaScript recreation of Olga Averchenko's [Positivus Landing Page Design](https://www.figma.com/community/file/1230604708032389430/positivus-landing-page-design).

## Run locally

Use any static-file server, or run the included zero-dependency Node server:

```sh
npm run dev
```

Then open `http://127.0.0.1:4173`.

## Structure

```text
assets/       Local fonts, original illustrations, portraits, logos, and icons
css/main.css  Browser-ready stylesheet
scss/main.scss Source stylesheet
js/main.js    Dependency-free interactions
index.html    Semantic one-page site
server.mjs    Minimal local preview server using Node built-ins
```

The browser stylesheet is committed so the site can be opened or served without installing a Sass compiler. `scss/main.scss` is deliberately kept CSS-compatible, making it valid SCSS while allowing deterministic builds with no dependency installation.

## Features

- Responsive navigation and menu overlay.
- English/Hebrew language switch with persistent RTL/LTR layout changes.
- Desktop and mobile hero compositions.
- Service, case study, process, team, testimonial, contact, and footer sections.
- Accessible accordion, testimonial carousel, contact validation, and newsletter feedback.
- Reduced-motion support and visible keyboard focus.
- No frontend frameworks or runtime libraries.

The language control sits beside the primary quote action on desktop and inside the mobile navigation. The selected language is saved locally and restores on reload.

## Credits

- Original design: Olga Averchenko.
- Space Grotesk is distributed under the SIL Open Font License in `assets/fonts/OFL.txt`.
- Source artwork and brand assets are preserved from the public Positivus reference implementation for fidelity to the original design.
