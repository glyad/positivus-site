import assert from "node:assert/strict";
import test from "node:test";

import { escapeAttribute, escapeHtml, renderBlocks } from "../scripts/blog/render-blocks.mjs";

const resolveAsset = (path) => `../../${path}`;

test("renders the first structured article blocks with semantic HTML and escaped authored content", () => {
  const html = renderBlocks([
    { type: "keyTakeaways", heading: "Key < takeaways", items: ["Measure < outcomes", "Never trust <script>alert(1)</script>"] },
    { type: "richText", heading: "Start here", paragraphs: ["Use evidence & context.", "Keep \"claims\" honest."] },
    { type: "figure", src: "assets/images/team/team-1.webp", alt: "A < useful image", caption: "Image & context", attribution: "Ava \"Roe\"" },
    { type: "quote", heading: "A principle", text: "Use < evidence", attribution: "Maya & Co." },
    { type: "stat", heading: "Focus", value: "1 < 2", label: "primary \"change\"" },
    { type: "checklist", heading: "Check", items: ["One", "Two & three"] },
    { type: "steps", heading: "Steps", items: ["First", "Second"] }
  ], { locale: "en", resolveAsset, consultation: null });

  assert.match(html, /<section class="article-block article-block--key-takeaways">/);
  assert.match(html, /<ul>/);
  assert.match(html, /<ol>/);
  assert.match(html, /<figure>/);
  assert.match(html, /<img src="\.\.\/\.\.\/assets\/images\/team\/team-1\.webp" alt="A &lt; useful image" \/>/);
  assert.match(html, /<figcaption>Image &amp; context <span>— Ava &quot;Roe&quot;<\/span><\/figcaption>/);
  assert.match(html, /<blockquote><p>Use &lt; evidence<\/p><footer>Maya &amp; Co\.<\/footer><\/blockquote>/);
  assert.match(html, /<data value="1 &lt; 2">1 &lt; 2<\/data>/);
  assert.match(html, /Measure &lt; outcomes/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /Never trust <script>/);
});

test("escapes text and attribute values without accepting authored markup", () => {
  assert.equal(escapeHtml(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
  assert.equal(escapeAttribute(`<&>"'`), "&lt;&amp;&gt;&quot;&#39;");
});

test("renders complex blocks with accessible native structures and secure links", () => {
  const html = renderBlocks([
    {
      type: "table",
      heading: "Decision dashboard",
      caption: "A < field guide",
      columns: ["Field", "Question"],
      rows: [["Qualified demand", "Who < benefits?"]]
    },
    {
      type: "media",
      heading: "Watch",
      src: "assets/images/team/team-2.webp",
      alt: "A < video thumbnail",
      caption: "Watch & learn",
      href: "https://example.com/watch"
    },
    {
      type: "download",
      heading: "Download",
      label: "Dashboard < worksheet",
      fileLabel: "PDF, 1.2 MB",
      href: "https://example.com/worksheet.pdf"
    },
    {
      type: "citations",
      heading: "Sources",
      citations: [
        { label: "Research < report", href: "https://example.com/research" },
        { label: "Ignore me", href: "javascript:alert(1)" }
      ]
    },
    { type: "callout", tone: "expert", heading: "Editorial view", body: "Use < evidence." },
    { type: "faq", heading: "Questions", items: [{ question: "Why < now?", answer: "For safer decisions." }] }
  ], { locale: "en", resolveAsset, consultation: null });

  assert.match(html, /<table>/);
  assert.match(html, /<caption>A &lt; field guide<\/caption>/);
  assert.match(html, /<th scope="col">Field<\/th>/);
  assert.match(html, /<th scope="row">Qualified demand<\/th>/);
  assert.match(html, /<figure><a href="https:\/\/example\.com\/watch" target="_blank" rel="noreferrer noopener"><img/);
  assert.match(html, /<span class="article-block__file-label">File: PDF, 1\.2 MB<\/span>/);
  assert.match(html, /<ol><li><a href="https:\/\/example\.com\/research" target="_blank" rel="noreferrer noopener">Research &lt; report<\/a><\/li><\/ol>/);
  assert.match(html, /<p><strong>Expert:<\/strong> Use &lt; evidence\.<\/p>/);
  assert.match(html, /<details><summary>Why &lt; now\?<\/summary><p>For safer decisions\.<\/p><\/details>/);
  assert.doesNotMatch(html, /javascript:/);
});

test("renders a consultation only for its resolved service relationship", () => {
  const block = {
    type: "consultation",
    serviceId: "seo",
    heading: "Talk to < a specialist",
    body: "Plan the next step.",
    actionLabel: "Request a consultation",
    href: "https://example.com/contact"
  };
  const matching = renderBlocks([block], {
    locale: "en",
    resolveAsset,
    consultation: { serviceId: "seo" }
  });
  const mismatched = renderBlocks([block], {
    locale: "en",
    resolveAsset,
    consultation: { serviceId: "paid-media" }
  });

  assert.match(matching, /Talk to &lt; a specialist/);
  assert.match(matching, /data-consultation-service="seo"/);
  assert.match(matching, /target="_blank" rel="noreferrer noopener"/);
  assert.equal(mismatched, "");
  assert.equal(renderBlocks([{ type: "consultation", serviceId: "seo" }], { locale: "en", resolveAsset, consultation: null }), "");
});

test("rejects malformed optional values, unsafe links, and unsafe asset resolutions", () => {
  const html = renderBlocks([
    { type: "table", columns: "not an array", rows: [["<img src=x onerror=alert(1)>"]] },
    { type: "table", columns: ["Field"], rows: [["Uncaptioned"]] },
    { type: "media", src: "assets/../secrets.webp", alt: "No" },
    { type: "download", label: "Bad", fileLabel: { text: "PDF" }, href: "data:text/html,<script>alert(1)</script>" },
    { type: "citations", citations: [{ label: "Bad", href: "//tracker.invalid" }, null] },
    { type: "faq", items: [{ question: ["wrong"], answer: { value: "wrong" } }, null] }
  ], { locale: "en", resolveAsset: () => "https://attacker.invalid/asset.webp", consultation: { serviceId: "seo" } });

  assert.equal(html, "");
});

test("accepts only resolver paths rooted at assets after leading parent segments", () => {
  const figure = { type: "figure", src: "assets/images/team/team-1.webp", alt: "A safe image" };
  const invalidOutputs = [
    "../../assets/../../../secret.webp",
    "../assets/../../secret.webp",
    "../../assets/./images/x.webp",
    "../../assets/images/%2e%2e/secret.webp",
    "../../assets/images/x.webp?debug=1",
    "../../assets\\images\\x.webp",
    "../../assets/images/\u0000x.webp"
  ];

  for (const output of invalidOutputs) {
    assert.equal(renderBlocks([figure], { locale: "en", resolveAsset: () => output, consultation: null }), "");
  }

  for (const output of ["assets/x.webp", "../assets/x.webp", "../../assets/images/x.webp"]) {
    const html = renderBlocks([figure], { locale: "en", resolveAsset: () => output, consultation: null });
    assert.ok(html.includes(`src="${output}"`));
  }
});

test("keeps structured semantics neutral for Hebrew RTL content", () => {
  const html = renderBlocks([
    { type: "faq", heading: "שאלות", items: [{ question: "למה?", answer: "כדי לקבל החלטות." }] },
    { type: "callout", tone: "warning", body: "בדקו את המקור." }
  ], { locale: "he", resolveAsset, consultation: null });

  assert.match(html, /<details>/);
  assert.match(html, /למה\?/);
  assert.match(html, /אזהרה/);
  assert.doesNotMatch(html, /dir="ltr"/);
});
